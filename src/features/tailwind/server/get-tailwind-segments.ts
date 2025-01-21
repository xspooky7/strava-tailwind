"use server"

import { SegmentRecord } from "@/lib/types/pocketbase-types"
import pb from "@/lib/pocketbase"
import { asError } from "@/lib/utils"
import { Coordinate, Line, TableSegment, WeatherResponse } from "@/lib/types/types"
import { RecordModel } from "pocketbase"
import { fetchNewSegmentRecord, fetchStarredPage, getStravaToken } from "@/lib/strava"
import { getCenter, getDistance } from "geolib"
import { fetchWeatherApi } from "openmeteo"
import { unstable_cache } from "next/cache"
import { MAX_WEATHER_QUERY_INTERVAL } from "@/lib/constants"
import { SessionData } from "@/app/auth/types"
import { getStarredSegments } from "./get-starred-segments"
import { bulkUnstarSegments } from "./bulk-unstar-segments"
import { processNewSegments } from "./process-new-segments"

/**
 * Gathers a detailed version of all currently starred segments
 *
 * @returns {WeatherSegment[]} Array of detailed segments.
 * @returns {number} Number of unique requests made to the Strava API.
 * @returns {number} Number of unique requests made to the open-meteo API.
 * @returns {boolean} Exeeded Strava API rates.
 */

export const getTailwindSegments = async (session: SessionData) => {
  if (!session.isLoggedIn || !session.userId || session.pbAuth == null) throw new Error("Couldn't authenticate!")
  pb.authStore.save(session.pbAuth)

  let meteoRequestCount = 0,
    stravaRequestCount = 0,
    exceededRate = false

  let stravaToken = ""
  try {
    const [token, _] = await getStravaToken()
    stravaToken = token
  } catch (error) {
    throw new Error("[ERROR] Couldn't retrieve Strava Access Token " + JSON.stringify(asError(error)))
  }

  stravaRequestCount++
  let [stravaStarredList, dbKomEffortRecords] = await Promise.all([
    fetchStarredPage(1, stravaToken),
    getStarredSegments(),
  ])

  // Check If site was full (200 entries) and query the rest of the pages from Strava
  let starredWeatherSegments: TableSegment[] = []
  if (stravaStarredList.length) {
    if (stravaStarredList.length === 200) {
      let i = 2
      while (i > 1) {
        const starredPage = await fetchStarredPage(2, stravaToken)
        stravaRequestCount++
        stravaStarredList = stravaStarredList.concat(starredPage)
        i = starredPage.length === 200 ? i + 1 : 0
      }
      stravaStarredList = stravaStarredList.flat()
    }

    const knownSegments: (TableSegment & { path: Line[] })[] = []
    const newSegmentPromises: Promise<SegmentRecord>[] = stravaStarredList
      .filter((apiListEle: any) => {
        const known = dbKomEffortRecords.find((rec) => rec.segment_id === apiListEle.id)
        if (known) {
          knownSegments.push({
            name: known.expand!.segment.name,
            city: known.expand!.segment.city,
            segment_id: known.segment_id,
            distance: known.expand!.segment.distance,
            path: known.expand!.segment.path,
            is_starred: known.is_starred,
            has_kom: known.has_kom,
            labels: known.expand!.segment.labels,
            average_grade: known.expand!.segment.average_grade,
            leader_qom: known.expand!.segment.leader_qom,
          })
          return false
        }
        return true
      })
      .slice(0, 50) // TODO make this accurate
      .map((apiListEle: any) => {
        stravaRequestCount++
        return fetchNewSegmentRecord(apiListEle.id, stravaToken)
      })

    const toUnstarEffortRefs = dbKomEffortRecords
      .filter((effort: RecordModel) => !stravaStarredList.some((x: any) => x.id === effort.segment_id))
      .map((effort: RecordModel) => {
        return effort.id
      })

    const [newSegmentsSettled, dbFalsifyEfforts] = await Promise.all([
      Promise.allSettled(newSegmentPromises),
      bulkUnstarSegments(toUnstarEffortRefs),
    ])

    const newTailwindSegments: (TableSegment & { path: Line[] })[] = []
    const newSegments: SegmentRecord[] = newSegmentsSettled
      .filter((val) => {
        const isFullfilled = val.status === "fulfilled"
        if (!isFullfilled) exceededRate = true
        else stravaRequestCount++
        return isFullfilled
      })
      .map((obj) => {
        newTailwindSegments.push({
          name: obj.value.name,
          city: obj.value.city,
          segment_id: obj.value.segment_id,
          distance: obj.value.distance,
          path: obj.value.path!,
          is_starred: true,
          has_kom: false,
          labels: obj.value.labels,
          average_grade: obj.value.average_grade,
          leader_qom: obj.value.leader_qom,
        })
        return { ...obj.value }
      })

    const tailwindSegments = newTailwindSegments.concat(knownSegments)
    const paths = tailwindSegments.map((segment) => segment.path)

    const [_, weatherPaths]: [void, { res: WeatherResponse[]; apiRequestCount: number }] = await Promise.all([
      processNewSegments(newSegments),
      fetchWeather(paths),
    ])

    const { apiRequestCount, ...weatherData } = weatherPaths
    meteoRequestCount += apiRequestCount
    starredWeatherSegments = tailwindSegments.map((segment, i) => {
      const { path, ...rest } = segment
      return { ...rest, wind: weatherData.res[i] }
    })
  }
  return starredWeatherSegments
  /*return {
    segments: starredWeatherSegments,
    stravaRequestCount,
    meteoRequestCount,
    exceededRate,
  }*/
}

/**
 * Fetches Weather Data for all Paths and calculates tailwind percentage
 * Density-based clustering of lines for more efficient API usage
 *
 * @param {Line[][]} paths - Array of Paths. One for each starred segment
 * @returns {WeatherResponse [], number}  - Objects holding respective weather data for the segment as well as the path
 * and the number of requests made
 */

const fetchWeather = unstable_cache(
  async (paths: Line[][]) => {
    console.log("Cache miss")

    let apiRequestCount = 0

    const res: WeatherResponse[] = []
    const meteoRequests: Promise<any>[] = []
    const clusters: Coordinate[] = []

    paths.forEach((path: Line[]) => {
      for (const line of path) {
        const midpoint = getCenter([line.start, line.end])
        if (!midpoint) throw new Error("fucked")
        const formattedMidpoint: Coordinate = { lat: midpoint.latitude, lon: midpoint.longitude }
        let addedToCluster = false

        for (let i = 0; i < clusters.length; i++) {
          if (getDistance(midpoint, clusters[i]) <= MAX_WEATHER_QUERY_INTERVAL) {
            line.clusterId = i
            addedToCluster = true
            break
          }
        }

        if (!addedToCluster) {
          clusters.push(formattedMidpoint)
          meteoRequests.push(meteoRequest(formattedMidpoint))
          apiRequestCount++
          line.clusterId = clusters.length - 1
        }
      }
    })

    const meteoResults = await Promise.all(meteoRequests)

    paths.forEach((path: Line[]) => {
      let tailAbs = 0,
        crossAbs = 0,
        headAbs = 0,
        aggregateWindspeed = 0,
        aggregateDistance = 0

      for (let i = 0; i < path.length; i++) {
        const line: Line = path[i]
        aggregateDistance += line.distance

        // Handle circular degree calculation
        const rawAngleDiff = line.bearing - meteoResults[line.clusterId!].current.windDirection10m
        const angleDifference = Math.min(360 - Math.abs(rawAngleDiff), Math.abs(rawAngleDiff))

        // Calculate the wind component (using cosine for more accurate tailwind speed)
        const windSpeed = meteoResults[line.clusterId!].current.windSpeed10m
        //const angleRadians = (angleDifference * Math.PI) / 180
        //const tailwindComponent = Math.cos(angleRadians) * windSpeed

        if (angleDifference >= 135) {
          tailAbs += line.distance
          aggregateWindspeed += line.distance * windSpeed
        } else if (angleDifference >= 45) {
          crossAbs += line.distance
        } else {
          headAbs += line.distance
        }

        line.windDirection = angleDifference
      }

      const tail = (tailAbs / aggregateDistance) * 100
      const cross = (crossAbs / aggregateDistance) * 100
      const head = (headAbs / aggregateDistance) * 100
      const avgTailwindSpeed = tailAbs > 0 ? aggregateWindspeed / tailAbs : 0

      res.push({
        tail,
        cross,
        head,
        avgTailwindSpeed,
      })
    })

    return { res, apiRequestCount }
  },
  [],
  {
    tags: ["meteo"],
    revalidate: 1800,
  }
)

/**
 * Takes a coordinate pair and queries open-meteo for weather data
 *
 * @param {Coordinate} coord - Coordinates for the API.
 * @returns {Object} - Weather data by open-meteo.
 */

const meteoRequest = async (coord: Coordinate) => {
  const params = {
    latitude: coord.lat,
    longitude: coord.lon,
    current: ["temperature_2m", "weather_code", "wind_speed_10m", "wind_direction_10m", "wind_gusts_10m"],
    timezone: "Europe/Berlin",
    forecast_days: 1,
  }
  const url = "https://api.open-meteo.com/v1/forecast"
  const responses = await fetchWeatherApi(url, params)
  const response = responses[0]

  const utcOffsetSeconds = response.utcOffsetSeconds()
  const timezone = response.timezone()
  const timezoneAbbreviation = response.timezoneAbbreviation()
  const latitude = response.latitude()
  const longitude = response.longitude()

  const current = response.current()!

  // Note: The order of weather variables in the URL query and the indices below need to match!
  return {
    current: {
      time: new Date((Number(current.time()) + utcOffsetSeconds) * 1000),
      temperature2m: current.variables(0)!.value(),
      weatherCode: current.variables(1)!.value(),
      windSpeed10m: current.variables(2)!.value(),
      windDirection10m: current.variables(3)!.value(),
      windGusts10m: current.variables(4)!.value(),
    },
  }
}
