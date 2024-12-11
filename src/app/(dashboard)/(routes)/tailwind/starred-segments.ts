import { SegmentRecord } from "../../../../../pocketbase-types"
import pb from "@/lib/pocketbase"
import { asError } from "@/lib/utils"
import {
  bulkUnstarSegments,
  fetchNewSegmentRecord,
  getStarredSegments,
  processNewSegments,
} from "@/data-access/segments"
import { TailwindSegment } from "../../../../../types"
import { RecordModel } from "pocketbase"
import { fetchStarredPage, getStravaToken } from "@/data-access/strava"

/**
 * Gathers a detailed version of all currently starred segments
 *
 * @returns {WeatherSegment[]} Array of detailed segments.
 * @returns {number} Number of unique requests made to the Strava API.
 * @returns {number} Number of unique requests made to the open-meteo API.
 * @returns {boolean} Exeeded Strava API rates.
 */

export const loadStarredSegments = async () => {
  let meteoRequestCount = 0,
    stravaRequestCount = 0,
    exceededRate = false

  // Fetching stored access token
  let stravaToken = ""
  try {
    const [token, _] = await getStravaToken()
    stravaToken = token
  } catch (error) {
    throw new Error("[ERROR] Couldn't retrieve Strava Access Token " + JSON.stringify(asError(error)))
  }

  // Fetching stored starred Kom Efforts + Segments and the first page of starred segments from strava

  stravaRequestCount++
  let [stravaStarredList, dbKomEffortRecords] = await Promise.all([
    fetchStarredPage(1, stravaToken),
    getStarredSegments(),
  ])

  // Check If site was full (200 entries) and query the rest of the pages from Strava
  let starredWeatherSegments: TailwindSegment[] = []
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

    const knownSegments: TailwindSegment[] = []
    const newSegmentPromises: Promise<SegmentRecord>[] = stravaStarredList
      .filter((apiListEle: any) => {
        if (apiListEle.id === 4487456) console.log("STRAVA MISTAKE")
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
            profile_url: known.expand!.segment.profile_url_light,
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

    const newTailwindSegments: TailwindSegment[] = []
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
          profile_url: obj.value.profile_url_light,
          leader_qom: obj.value.leader_qom,
        })
        return { ...obj.value }
      })

    const tailwindSegments = newTailwindSegments.concat(knownSegments)

    const [_, newStarredWeatherSegments]: [void, TailwindSegment[]] = await Promise.all([
      processNewSegments(newSegments),
      Promise.all(
        tailwindSegments.map(async (segment) => {
          const weatherResponse = await fetch(process.env.WEATHER_API_URL!, {
            method: "POST",
            headers: {
              Accept: "application/json",
            },
            body: JSON.stringify(segment.path),
            next: { revalidate: 1800 },
          })
          const { meteoRequests, ...weatherData } = await weatherResponse.json()
          meteoRequestCount += meteoRequests
          return { ...segment, ...weatherData }
        })
      ),
    ])
    starredWeatherSegments = newStarredWeatherSegments
  }
  return {
    segments: starredWeatherSegments,
    stravaRequestCount,
    meteoRequestCount,
    exceededRate,
  }
}
