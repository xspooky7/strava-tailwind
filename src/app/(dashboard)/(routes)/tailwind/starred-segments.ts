import { getStravaToken } from "@/lib/database"
import { Collections, KomEffortRecord, SegmentRecord } from "../../../../../pocketbase-types"
import { fetchNewSegmentRecord } from "@/lib/fetch-segment-record"
import { WeatherSegment } from "../../../../../types"
import pb from "@/lib/pocketbase"

/**
 * Gathers a detailed version of all currently starred segments using a database as cache to relieve API rates.
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

  // Fetching stored access token and cached segments
  const stravaToken = await getStravaToken()
  await pb.admins.authWithPassword(process.env.ADMIN_EMAIL!, process.env.ADMIN_PW!)

  const databaseListRequest: Promise<(KomEffortRecord & { expand: { segment: SegmentRecord } })[]> = pb
    .collection(Collections.KomEfforts)
    .getFullList({
      filter: `user="${process.env.USER_ID}" && is_starred=true`,
      expand: "segment",
    })

  stravaRequestCount++
  let [stravaStarredList, dbKomEffortRecords] = await Promise.all([
    fetchStarredPage(1, stravaToken),
    databaseListRequest,
  ])

  let starredWeatherSegments: WeatherSegment[] = []
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

    const knownSegments: (SegmentRecord & { isOwnedKom: boolean })[] = []
    const newSegmentPromises = stravaStarredList
      .filter((apiListEle: any) => {
        const known = dbKomEffortRecords.find((rec) => rec.segment_id === apiListEle.id)
        if (known) {
          knownSegments.push({ ...known.expand.segment, isOwnedKom: true })
          return false
        }
        return true
      })
      .map((apiListEle: any) => {
        stravaRequestCount++
        return fetchNewSegmentRecord(apiListEle.id, stravaToken)
      })

    const falsifyEffortPromises = dbKomEffortRecords
      .filter((effort: KomEffortRecord) => !stravaStarredList.some((x: any) => x.id === effort.segment_id))
      .map((effort: KomEffortRecord) => {
        return pb.collection(Collections.KomEfforts).update(effort.id!, { is_starred: false })
      })

    const [newSegmentsSettled, dbFalsifyEfforts] = await Promise.all([
      Promise.allSettled(newSegmentPromises),
      Promise.all(falsifyEffortPromises),
    ])

    const newSegments: (SegmentRecord & { isOwnedKom: boolean })[] = newSegmentsSettled
      .filter((val) => {
        const isFullfilled = val.status === "fulfilled"
        if (!isFullfilled) exceededRate = true
        else stravaRequestCount++
        return isFullfilled
      })
      .map((obj) => {
        return { ...obj.value, isOwnedKom: false }
      })

    const starredSegments = newSegments.concat(knownSegments)

    const [komEffortUpdate, newStarredWeatherSegments]: [any[], WeatherSegment[]] = await Promise.all([
      Promise.all(
        newSegments.map(async (segment) => {
          try {
            const komEffort: KomEffortRecord = await pb
              .collection(Collections.KomEfforts)
              .getFirstListItem(`segment_id:${segment.segment_id}`)

            komEffort.is_starred = true
            return pb.collection(Collections.KomEfforts).update(komEffort.id!, komEffort)
          } catch (err) {
            let seg_ref: SegmentRecord
            try {
              seg_ref = await pb.collection(Collections.Segments).getFirstListItem(`segment_id:${segment.segment_id}`)
            } catch (err) {
              const { isOwnedKom, ...uploadSegment } = segment
              seg_ref = await pb.collection(Collections.Segments).create(uploadSegment)
            }
            const newRecord: KomEffortRecord = {
              segment: seg_ref.id!,
              user: process.env.USER_ID!,
              segment_id: seg_ref.segment_id,
              is_starred: true,
              has_kom: false,
            }
            return pb.collection(Collections.KomEfforts).create(newRecord)
          }
        })
      ),
      Promise.all(
        starredSegments.map(async (segment) => {
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
const fetchStarredPage = (page: number, stravaToken: string) => {
  return fetch(`${process.env.STRAVA_API}/segments/starred?page=${page}&per_page=200`, {
    method: "GET",
    headers: {
      Authorization: "Bearer " + stravaToken,
    },
    next: { revalidate: 600 },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Error ${response.status}: Couldn't retrieve starred segment page ${page} from Strava`)
      }
      return response.json()
    })
    .catch((err) => {
      throw new Error(`Error 401: Couldn't retrieve starred segment page ${page} from Strava`)
    })
}
