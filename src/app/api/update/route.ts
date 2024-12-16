import axios from "axios"
import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { Collections, KomEffortRecord, KomTimeseriesRecord, SegmentRecord } from "../../../../pocketbase-types"
import pb from "@/app/lib/pocketbase"
import { getStravaToken } from "@/app/lib/data-access/strava"
import { fetchNewSegmentRecord } from "@/app/lib/data-access/segments"

export const maxDuration = 60 // vercel

let DEBUG_LOG = ""
let STRAVA_REQUEST_COUNT = 0
export async function GET(req: Request) {
  DEBUG_LOG = ""
  STRAVA_REQUEST_COUNT = 0
  try {
    const headersList = await headers()
    const apiKey = headersList.get("x-api-key")
    if (apiKey !== process.env.UPDATE_API_KEY) return new NextResponse("Unauthorized", { status: 401 })

    const userId = process.env.USER_ID!
    let exceededRate = false
    const date = new Date()
    const currentHour = (date.getUTCHours() + 1) % 24 //CEST
    const currentMinute = date.getUTCMinutes()
    const now = date.getTime()

    log(
      `[INIT] ${currentHour < 10 ? "0" + currentHour : currentHour} : ${
        currentMinute < 10 ? "0" + currentMinute : currentMinute
      } CEST`
    )
    if (currentHour < 7 && headersList.get("night-override") === null) {
      return new NextResponse("Night", { status: 201 })
    }

    log("[AUTH] Initializing Pocketbase")
    await pb.admins.authWithPassword(process.env.ADMIN_EMAIL!, process.env.ADMIN_PW!)
    pb.autoCancellation(false)

    log(`[DATABASE] Fetching Strava Token - `, false)
    let stravaToken
    try {
      const [token, wasRefreshed] = await getStravaToken()
      log(wasRefreshed ? "REFRESHED - " : "VALID - ", false)
      stravaToken = token
    } catch (error) {
      return errorResponse("Couldn't retrieve Strava Access Token ", 511, error)
    }
    log(stravaToken + " - Success")

    log("[DATABASE] Fetching Kom Effort Collection")
    const userEfforts: KomEffortRecord[] = await pb.collection(Collections.KomEfforts).getFullList({
      filter: `user="${userId}"`,
      fields: "segment_id, id, has_kom, gained_at, lost_at",
      cache: "no-store",
    })
    const ownedKomIds: Set<number> = userEfforts
      ? new Set(userEfforts.filter((obj: KomEffortRecord) => obj.has_kom).map((obj: KomEffortRecord) => obj.segment_id))
      : new Set()

    log(`[INFO] Kom Effort count: ${userEfforts.length}, active Koms: ${ownedKomIds.size}`)
    const apiPromises: Promise<Set<number>>[] = []
    let apiResults: Set<number>[] = []
    let apiIds: Set<number> = new Set()

    const p = ownedKomIds.size / 200
    const max_pages = Number.isInteger(p) ? p + 1 : Math.ceil(p)

    log(`[API] Fetching First Kom Page`)
    try {
      apiIds = await fetchKomPageWithRetry(1, stravaToken, 3, 1500)
    } catch (error) {
      return errorResponse("Couldn't fetch first Kom Page ", 503, error)
    }

    if (max_pages > 1) {
      log(`[API] Fetching ${max_pages - 1} more Kom Pages `)
      try {
        for (let page = 2; page <= max_pages; page++) {
          apiPromises.push(fetchKomPageWithRetry(page, stravaToken))
        }
        apiResults = await Promise.all(apiPromises)
      } catch (error) {
        return errorResponse("Couldn't fetch Kom Lists", 503, error)
      }
      apiIds = apiIds.union(apiResults.reduce((acc, curr) => acc.union(curr), new Set()))
    }

    log("[API] Success")

    if (ownedKomIds.symmetricDifference(apiIds).size !== 0) {
      const [lostKomIds, gainedKomIds] = [ownedKomIds.difference(apiIds), apiIds.difference(ownedKomIds)]
      log(`[CALC] Kom Difference: ${gainedKomIds.size} gained - ${lostKomIds.size} lost`)

      const concurrentUpdates: Promise<any>[] = []

      // handles lost koms
      if (lostKomIds.size) {
        log("[INFO] Processing lost Koms")
        lostKomIds.forEach((lostId) => {
          const storedEffort = userEfforts.find((effort) => effort.segment_id === lostId)
          if (storedEffort == null || storedEffort.id == null)
            return errorResponse("Couldn't resolve lost effort, which was expected", 512, { id: lostId })
          const timeline = storedEffort.lost_at ? storedEffort.lost_at : []
          log(
            `[DATABASE] Updating a present Kom Effort Record (seg_id:${storedEffort.segment_id}, effort_ref:${storedEffort.id})`
          )
          concurrentUpdates.push(
            pb
              .collection(Collections.KomEfforts)
              .update(
                storedEffort.id,
                {
                  lost_at: timeline.concat(now),
                  has_kom: false,
                },
                { cache: "no-store" }
              )
              .then(() =>
                log(`[DATABASE] Succesfully updated an existing Kom Effort Record to lost (seg_id:${lostId})`)
              )
              .catch((error) => {
                return errorResponse(
                  `Error occured while updating an existing Kom Effort Record to lost (seg_id:${lostId})`,
                  513,
                  error,
                  lostKomIds
                )
              })
          )
        })
      }

      //handles gained koms
      if (gainedKomIds.size) {
        log("[INFO] Processing gained Koms")
        for (const gainedId of gainedKomIds) {
          const storedEffort = userEfforts.find((effort) => effort.segment_id === gainedId)
          if (storedEffort) {
            const timeline = storedEffort.gained_at ? storedEffort.gained_at : []

            log(
              `[DATABASE] Updating a present Kom Effort Record (seg_id:${storedEffort.segment_id}, effort_ref:${storedEffort.id})`
            )
            concurrentUpdates.push(
              pb
                .collection(Collections.KomEfforts)
                .update(
                  storedEffort.id!,
                  {
                    gained_at: timeline.concat(now),
                    has_kom: true,
                  },
                  { cache: "no-store" }
                )
                .then(() =>
                  log(`[DATABASE] Succesfully updated an existing Kom Effort Record to gained (seg_id:${gainedId})`)
                )
                .catch((error) => {
                  return errorResponse(
                    `Error occured while updating an existing Kom Effort Record to gained (seg_id:${gainedId})`,
                    514,
                    error,
                    gainedId
                  )
                })
            )
          } else {
            let seg_ref,
              segment: SegmentRecord | null = null
            try {
              log(`[DATABASE] Trying to fetch Segment (seg_id: ${gainedId})`)
              seg_ref = await pb.collection(Collections.Segments).getFirstListItem(`segment_id="${gainedId}"`)
            } catch {
              // TODO make this catch conditional for only one type of error otherwise populate error
              log(`[DATABASE] Couldn't find segment (seg_id: ${gainedId})`)

              try {
                log(`[API] Fetching/Formatting a detailed Segment from Strava (seg_id: ${gainedId})`)
                segment = await fetchNewSegmentRecord(gainedId, stravaToken)
              } catch (error) {
                return errorResponse(
                  `Error occured while fetching/formatting a detailed Segment from Strava (seg_id: ${gainedId})`,
                  515,
                  error,
                  gainedId
                )
              }

              try {
                log(`[DATABASE] Creating Segment Record (seg_id: ${gainedId})`)
                seg_ref = await pb.collection(Collections.Segments).create(segment!)
              } catch (error) {
                return errorResponse(`Error occured while creating a new Segment on the database`, 516, error, gainedId)
              }
            }

            log(`[DATABASE] Creating Kom Effort Record (seg_id:${gainedId}, seg_ref:${seg_ref.id})`)
            const newEffort: KomEffortRecord = {
              segment: seg_ref.id!,
              user: userId,
              segment_id: seg_ref.segment_id,
              is_starred: false,
              has_kom: true,
              gained_at: [now],
            }
            concurrentUpdates.push(
              pb
                .collection(Collections.KomEfforts)
                .create(newEffort)
                .then(() => log(`[DATABASE] Succesfully created a new Kom Effort Record (seg_id: ${gainedId})`))
                .catch((error) => {
                  return errorResponse(
                    `Error occured while creating a new Kom Effort on the database (seg_id: ${gainedId})`,
                    517,
                    error,
                    gainedId
                  )
                })
            )
          }
        }
      }

      const amount = ownedKomIds.size + gainedKomIds.size - lostKomIds.size
      const dateString = date.toISOString()
      const newTimeseries: KomTimeseriesRecord = {
        user: userId,
        date: dateString,
        amount,
      }
      concurrentUpdates.push(
        pb
          .collection(Collections.KomTimeseries)
          .create(newTimeseries, { cache: "no-store" })
          .then((timeSeries) => {
            log(`[DATABASE] Updated Timeseries: ${timeSeries.amount} - ${timeSeries.date}`)
          })
          .catch(() => {
            log(`[WARNING] Failed to update timeseries`)
          })
      )
      await Promise.all(concurrentUpdates)
    } else {
      log(`[INFO] Sets are identical (Db: ${ownedKomIds.size} - Api: ${apiIds.size})`)
    }
    log(`[INFO] Requests made to Strava - ${STRAVA_REQUEST_COUNT}, Rate exceeded - ${exceededRate}`)
    log("[EXIT] 200")

    return new NextResponse(DEBUG_LOG, { status: 200 })
  } catch (error) {
    return errorResponse("Uncaught Error in route", 520, error)
  }
}

//Strava Api
const fetchKomPageWithRetry = async (page: number, token: string, retries = 2, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios({
        method: "GET",
        url: `${process.env.STRAVA_KOM_URL}?page=${page}&per_page=200`,
        headers: { Authorization: "Bearer " + token },
      })
      STRAVA_REQUEST_COUNT++
      log(`  - ${page} (${response.data.length})`)
      const idArray: number[] = response.data.map((entry: any) => entry.segment.id)

      return new Set(idArray)
    } catch (error) {
      if (axios.isAxiosError(error) && error.status === 503) {
        log(`[ERROR] 503 error on attempt ${i + 1} fetching page ${page}, retrying in ${delay}ms...`)
        await new Promise((res) => setTimeout(res, delay))
        delay *= 2
      } else {
        throw error
      }
    }
  }
  throw new Error(`503 error on fetching page ${page} after ${retries} retries.`)
}

//Helper
const log = (message: string, newline = true, payload?: object) => {
  console.log(message)
  DEBUG_LOG += `${message}${newline ? "\n" : ""}`
}

const errorResponse = (message: string, status = 400, error: any, ...params: any[]) => {
  return new NextResponse(
    `[ERROR ${status}] ${message} \n\n -ERROR: ${JSON.stringify(
      error,
      Object.getOwnPropertyNames(error)
    )} \n\n -LOG: ${DEBUG_LOG}  \n\n -PARAMS: ${JSON.stringify(params)}`,
    {
      status: status,
    }
  )
}
