import { getFromDatabase, setDatabase } from "@/lib/database"
import axios from "axios"
import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { Collections, KomEffortRecord, KomTimeseriesRecord, SegmentRecord } from "../../../../pocketbase-types"
import { fetchNewSegmentRecord } from "@/lib/fetch-segment-record"
import pb from "@/lib/pocketbase"

export const maxDuration = 30

let DEBUG_LOG = ""
export async function GET(req: Request) {
  DEBUG_LOG = ""
  try {
    /*const headersList = await headers()
	const apiKey = headersList.get('x-api-key')
	if (apiKey !== process.env.UPDATE_API_KEY)
		return new NextResponse('Unauthorized', { status: 401 })*/
    const userId = process.env.USER_ID!

    let exceededRate = false,
      stravaRequestCount = 0
    const date = new Date()
    const currentHour = (date.getUTCHours() + 1) % 24 //CEST
    const currentMinute = date.getUTCMinutes()

    if (currentHour < 7) {
      return new NextResponse("Night", { status: 201 })
    } else {
      log(
        `[INIT] ${currentHour < 10 ? "0" + currentHour : currentHour} : ${
          currentMinute < 10 ? "0" + currentMinute : currentMinute
        } CEST`
      )
      const now = date.getTime()

      log(`[DATABASE] Fetching Strava Token `, false)
      const stravaToken = await getFromDatabase("token/access", { cache: "no-store" })
      if (!stravaToken)
        return new NextResponse("Couldn't retrieve Strava Access Token", {
          status: 400,
        })
      log(stravaToken)
      log("[AUTH] Initializing Pocketbase")
      await pb.admins.authWithPassword(process.env.ADMIN_EMAIL!, process.env.ADMIN_PW!)
      pb.autoCancellation(false)

      log("[DATABASE] Fetching Kom_Effort Collection")
      const komEfforts: KomEffortRecord[] = await pb
        .collection(Collections.KomEfforts)
        .getFullList({ cache: "no-store" })
      const dbIds = komEfforts.filter((effort) => effort.has_kom).map((obj: KomEffortRecord) => obj.segment_id)
      const ownedKomIds: number[] = dbIds ? dbIds : []
      log(`[INFO] Kom_Effort count: ${komEfforts.length}, active Koms: ${ownedKomIds.length}`)
      const apiPromises = []
      let apiResults = []

      const p = komEfforts.length / 200
      const max_pages = Number.isInteger(p) ? p + 1 : Math.ceil(p)

      log(`[API] Fetching ${max_pages} Kom Pages `)
      for (let page = 1; page <= max_pages; page++) {
        stravaRequestCount++
        apiPromises.push(fetchKomPage(page, stravaToken))
      }
      try {
        apiResults = await Promise.all(apiPromises)
      } catch (error) {
        return new NextResponse("Couldn't fetch Kom Lists", {
          status: 400,
        })
      }
      log("[API]Success")
      const apiIds: number[] = apiResults.reduce((acc, curr) => acc.concat(curr), [])

      if (!checkIdsEqual(ownedKomIds, apiIds)) {
        const [lostKomIds, gainedKomIds] = arrDifference(ownedKomIds, apiIds)
        log(`[CALC] Kom Difference: ${gainedKomIds.length} gained - ${lostKomIds.length} lost`)
        if (lostKomIds.length) {
          try {
            log("[DATABASE] Processing lost koms", false)
            for (const lostId of lostKomIds) {
              log(lostId + ", ")
              const effort = komEfforts.find((effort) => effort.segment_id === lostId)
              if (effort == null || effort.id == null)
                return new NextResponse(
                  JSON.stringify({ message: "Couldn't resolve lost effort, which was expected", id: lostId }),
                  { status: 400 }
                )
              const timeline = effort.lost_at ? effort.lost_at : []
              await pb.collection(Collections.KomEfforts).update(
                effort.id,
                {
                  lost_at: timeline.concat(now),
                  has_kom: false,
                },
                { cache: "no-store" }
              )
              DEBUG_LOG += "Updated: " + lostId
            }
          } catch (err) {
            return new NextResponse(
              JSON.stringify({
                message: "Error occured while updating an existing Kom_Effort Record (lost)",
                ids: lostKomIds,
                originalError: err,
              }),
              { status: 400 }
            )
          }
          log("Success")
        }
        /**
         * Case Gained #1:
         * Gained a Kom which is already a past Kom-Effort. Both records are already present.
         */
        if (gainedKomIds.length) {
          const restIds = []
          for (const gainedId of gainedKomIds) {
            const storedEffort = komEfforts.find((effort) => effort.segment_id === gainedId)
            if (storedEffort) {
              log(`[INFO] Processing ${gainedId} (gained#1)`)
              const timeline = storedEffort.gained_at ? storedEffort.gained_at : []
              try {
                log(
                  `[DATABASE] Updating Kom_Effort Record status to true (segment_id:${storedEffort.segment_id}, segment_ref:${storedEffort.id})`
                )
                await pb.collection(Collections.KomEfforts).update(
                  storedEffort.id!,
                  {
                    gained_at: timeline.concat(now),
                    has_kom: true,
                  },
                  { cache: "no-store" }
                )
              } catch (err) {
                return new NextResponse(
                  JSON.stringify({
                    message: "Error occured while updating a present Kom_Effort Record (gained#1)",
                    ids: gainedId,
                    originalError: err,
                  }),
                  { status: 400 }
                )
              }
            } else {
              restIds.push(gainedId)
            }
          }
          if (restIds.length) {
            let segments: SegmentRecord[] = await pb.collection(Collections.Segments).getFullList({ cache: "no-store" })
            const segIds = new Set(segments.map((segment: SegmentRecord) => segment.segment_id))

            //newIds: gained segments not yet commited to any collection
            const newIds = restIds.filter((x) => !segIds.has(x))

            /**
             * Case Gained #2:
             * Gained an unknown Kom and unknown segment. Both records have to be created.
             */
            if (newIds.length) {
              log("[INFO] Processing gained koms (gained#2)")
              const newSegmentPromises: Promise<SegmentRecord>[] = newIds.map((newId: number) => {
                return fetchNewSegmentRecord(newId, stravaToken)
              })

              const settledSegmentPromises = await Promise.allSettled(newSegmentPromises)
              const newSegments = settledSegmentPromises
                .filter((val) => {
                  const isFullfilled = val.status === "fulfilled"
                  if (!isFullfilled) {
                    exceededRate = true
                  } else stravaRequestCount++
                  return isFullfilled
                })
                .map((res) => res.value)

              try {
                const newRecords = await Promise.all(
                  newSegments.map((seg: SegmentRecord) => {
                    log(`[DATABASE] Creating Segment Record (${seg.segment_id})`)
                    return pb.collection(Collections.Segments).create(seg, { cache: "no-store" })
                  })
                )
                await Promise.all(
                  newRecords.map((rec: any) => {
                    log(`[DATABASE] Creating Kom_Effort Record (segment_id:${rec.segment_id}, segment_ref:${rec.id})`)
                    return pb.collection(Collections.KomEfforts).create(
                      {
                        segment: rec.id,
                        user: userId,
                        segment_id: rec.segment_id,
                        gained_at: [now],
                        has_kom: true,
                      },
                      { cache: "no-store" }
                    )
                  })
                )
              } catch (err) {
                return new NextResponse(
                  JSON.stringify({
                    message: "Error occured while creating a new Segment and Kom_Effort (gained#2)",
                    originalError: err,
                  }),
                  { status: 400 }
                )
              }
              log(`[INFO] Success! Created ${newSegments.length} new Segment and Kom_Effort Record(s)`)
            }

            /**
             * Case Gained #3:
             * Gained Kom which is not yet a Kom_Record but it's Segment is already saved
             */
            const alreadyCachedSegIds = restIds.filter((x) => !newIds.includes(x))
            if (alreadyCachedSegIds.length) {
              log("[INFO] Processing gained koms (gained#3)")
              for (const gainedId of alreadyCachedSegIds) {
                const cachedSegment = segments.find((seg) => seg.segment_id === gainedId)
                try {
                  log(
                    `[DATABASE] Creating Kom_Effort Record (segment_id:${cachedSegment!.segment_id}, segment_ref:${
                      cachedSegment!.id
                    })`
                  )
                  await pb.collection(Collections.KomEfforts).create(
                    {
                      segment: cachedSegment!.id,
                      user: userId,
                      segment_id: cachedSegment!.segment_id,
                      gained_at: [now],
                      has_kom: true,
                    },
                    { cache: "no-store" }
                  )
                } catch (err) {
                  return new NextResponse(
                    JSON.stringify({
                      message: "Error occured while creating a new Kom_Effort Record (gained#3)",
                      ids: gainedId,
                      originalError: err,
                    }),
                    { status: 400 }
                  )
                }
              }
              log(`[INFO] Success! Created ${alreadyCachedSegIds.length} new Kom_Effort Record(s)`)
            }
          }
        }
        try {
          const amount = ownedKomIds.length + gainedKomIds.length - lostKomIds.length
          const dateString = date.toISOString()
          const newTimeseries: KomTimeseriesRecord = {
            user: userId,
            date: dateString,
            amount,
          }
          const seriesUpdate = pb.collection(Collections.KomTimeseries).create(newTimeseries, { cache: "no-store" })
          log(`[DATABASE] Updated Timeseries: ${amount} - ${dateString}`)
        } catch (err) {
          log(`[WARNING] Failed to update timeseries`)
        }

        // TODO Kom amount update
      } else {
        log("[INFO] Arrays are equal")
      }
      log(`[INFO] Requests made to Strava - ${stravaRequestCount}, Rate exceeded - ${exceededRate}`)
      log("[EXIT] 200")

      return new NextResponse(DEBUG_LOG, { status: 200 })
    }
  } catch (error) {
    if (error instanceof Error) {
      return new NextResponse(error.message, {
        status: 400,
      })
    } else {
      return new NextResponse("Unknown Error in Route", {
        status: 400,
      })
    }
  }
}

//STRAVA API FUNCTION
const fetchKomPage = async (page: number, token: string): Promise<number[]> => {
  const response = await axios({
    method: "GET",
    url: `${process.env.STRAVA_KOM_URL}?page=${page}&per_page=200`,
    headers: { Authorization: "Bearer " + token, "Cache-Control": "no-store" },
    timeout: 15000,
  })

  const segments = response.data ? response.data : []
  log(`  - ${page} (${segments.length})`)
  const idArray: number[] = segments.map((entry: any) => entry.segment.id)

  return idArray
}

// HELPER FUNCTIONS
const checkIdsEqual = (idArr1: number[], idArr2: number[]): boolean => {
  return idArr1.sort().join("") === idArr2.sort().join("")
}

const arrDifference = (arr1: number[], arr2: number[]): number[][] => {
  return [arr1.filter((x) => !arr2.includes(x)), arr2.filter((y) => !arr1.includes(y))]
}

const log = (message: string, newline = true, payload?: object) => {
  console.log(message)
  DEBUG_LOG += `${message}${newline ? "\n" : ""}`
}
