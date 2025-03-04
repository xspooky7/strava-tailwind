"use server"

import { fetchNewSegmentRecord } from "@/lib/strava"
import { RecordIdString, SegmentRecord } from "@/lib/types/pocketbase-types"

import { Line, TailwindTableSegment } from "@/lib/types/types"
import { RecordModel } from "pocketbase"
import { bulkUnstarSegments } from "./bulk-unstar-segments"

/**
 * Processes Strava segment data by comparing starred segments with database records
 *
 * @param {any[]} stravaStarredList
 * - List of segments starred by user on Strava
 * @param {(TailwindTableSegment & { path: Line[]; id: RecordIdString })[]} dbKomEffortRecords
 * - Existing segment records from the database
 * @param {string} stravaToken
 * - Authentication token for Strava API requests
 *
 * @returns {Object} Object containing:
 *   - newSegments: Newly fetched segment records
 *   - tailwindSegments: Combined list of known and new segments for display
 *   - requestCount: Number of Strava API requests made
 *   - exceededRateLimit: Boolean indicating if Strava rate limit was exceeded
 */

export async function processSegmentData(
  stravaStarredList: any[],
  dbKomEffortRecords: (TailwindTableSegment & { path: Line[]; id: RecordIdString })[],
  stravaToken: string
) {
  let stravaRequestCount = 0
  let exceededRate = false

  // Find segments that are already known in our database
  const knownSegments: (TailwindTableSegment & { path: Line[]; id: RecordIdString })[] = []

  // Create fetch promises for new segments that aren't in our database yet
  const newSegmentPromises: Promise<SegmentRecord>[] = stravaStarredList
    .filter((apiListEle: any) => {
      const known = dbKomEffortRecords.find((rec) => rec.segment_id === apiListEle.id)
      if (known) {
        knownSegments.push(known)
        return false
      }
      return true
    })
    .slice(0, 50) // TODO make this limit better
    .map((apiListEle: any) => {
      stravaRequestCount++
      return fetchNewSegmentRecord(apiListEle.id, stravaToken)
    })

  // Find segments that need to be unstarred (they're in our DB but no longer in the Strava list)
  const toUnstarEffortRefs = dbKomEffortRecords
    .filter((effort) => !stravaStarredList.some((x: any) => x.id === effort.segment_id))
    .map((effort) => {
      return effort.id
    })

  // Process both new segments and unstar operations concurrently
  const [newSegmentsSettled] = await Promise.all([
    Promise.allSettled(newSegmentPromises),
    bulkUnstarSegments(toUnstarEffortRefs),
  ])

  // Process results from fetched new segments
  const newTailwindSegments: (TailwindTableSegment & { path: Line[] })[] = []
  const newSegments: SegmentRecord[] = newSegmentsSettled
    .filter((val) => {
      const isFullfilled = val.status === "fulfilled"
      if (!isFullfilled) exceededRate = true
      else stravaRequestCount++
      return isFullfilled
    })
    .map((obj: any) => {
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

  return {
    newSegments,
    tailwindSegments,
    requestCount: stravaRequestCount,
    exceededRateLimit: exceededRate,
  }
}
