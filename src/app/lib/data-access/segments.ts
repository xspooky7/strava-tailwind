"use server"

import pb from "@/app/lib/pocketbase"
import { Collections, KomEffortRecord, KomTimeseriesRecord, SegmentRecord } from "../../../../pocketbase-types"
import { TableSegment } from "../../../../types"
import { RecordModel } from "pocketbase"
import axios from "axios"
import { getLabel, getPath, sanatizeSegment } from "@/app/lib/utils"
import { getStravaToken } from "./strava"
import { SessionData } from "../auth/lib"
import { verifySession } from "../auth/actions"

/**
 * Fetches the details for a newly added segment. Surpresses rate exceeding error.
 * @param {number} id - The segment id.
 * @param {string} token - The auth header for Strava.
 * @returns {SegmentRecord} - A detailed segment with the decoded polyline path and a label
 */

export const fetchNewSegmentRecord = async (id: number, token: string): Promise<SegmentRecord> => {
  const segmentRequest = await axios({
    method: "get",
    url: `${process.env.STRAVA_API}/segments/${id}`,
    headers: {
      Authorization: "Bearer " + token,
    },
  })
  const detailedSegment: any = {
    ...segmentRequest.data,
    path: getPath(segmentRequest.data.map.polyline),
  }
  return sanatizeSegment({ ...detailedSegment, labels: getLabel(detailedSegment) })
}

export const getDeltaSegments = async (session: SessionData): Promise<TableSegment[]> => {
  if (!session.isLoggedIn || session.pbAuth == null) throw new Error("Couldn't authenticate!")

  pb.authStore.save(session.pbAuth)
  const data = await pb.collection(Collections.KomEfforts).getFullList({
    filter: "(gained_at != null || lost_at != null)",
    expand: "segment",
    fields:
      "segment_id,gained_at,lost_at,has_kom,is_starred,expand.segment.name,expand.segment.city,expand.segment.labels",
    sort: "-updated",
  })
  return data.map((d) => ({
    segment_id: d.segment_id,
    name: d.expand!.segment.name,
    city: d.expand!.segment.city,
    lost_at: d.lost_at,
    gained_at: d.gained_at,
    is_starred: d.is_starred,
    has_kom: d.has_kom,
    labels: d.expand!.segment.labels,
  }))
}

export const getTotalSegments = async (session: SessionData): Promise<TableSegment[]> => {
  if (!session.isLoggedIn || session.pbAuth == null) throw new Error("Couldn't authenticate!")
  console.log("GETTOTAL")
  pb.authStore.save(session.pbAuth)

  const data = await pb.collection(Collections.KomEfforts).getFullList({
    filter: "has_kom=true",
    expand: "segment",
    fields:
      "segment_id,gained_at,lost_at,has_kom,is_starred,expand.segment.name,expand.segment.city,expand.segment.labels",
    sort: "-updated",
  })
  return data.map((d) => ({
    segment_id: d.segment_id,
    name: d.expand!.segment.name,
    city: d.expand!.segment.city,
    lost_at: d.lost_at,
    gained_at: d.gained_at,
    is_starred: d.is_starred,
    has_kom: d.has_kom,
    labels: d.expand!.segment.labels,
  }))
}

export const getStarredSegments = async (): Promise<RecordModel[]> => {
  const session = await verifySession()
  if (!session.isLoggedIn || session.pbAuth == null) throw new Error("Couldn't authenticate!")

  pb.authStore.save(session.pbAuth)

  const starredSegmentsRequest = await pb.collection(Collections.KomEfforts).getFullList({
    filter: `user="${session.userId}" && is_starred=true`,
    expand: "segment",
    fields: `id,expand.segment.name,expand.segment.city,segment_id,expand.segment.distance,expand.segment.labels,expand.segment.path,
      is_starred,has_kom,expand.segment.average_grade,expand.segment.profile_url_light,expand.segment.leader_qom`,
  })

  return starredSegmentsRequest
}

export const bulkUnstarSegments = async (recordIds: string[]) => {
  if (!recordIds.length) return
  const session = await verifySession()
  if (!session.isLoggedIn || session.pbAuth == null) throw new Error("Couldn't authenticate!")

  pb.authStore.save(session.pbAuth)
  return Promise.all(recordIds.map((id) => pb.collection(Collections.KomEfforts).update(id, { is_starred: false })))
}

export const getKomCount = async (session: SessionData): Promise<KomTimeseriesRecord> => {
  const { isLoggedIn, pbAuth } = session
  if (!isLoggedIn || pbAuth == null) throw new Error("Couldn't authenticate!")
  pb.authStore.save(pbAuth)

  const timeseriesRecordPromise: Promise<KomTimeseriesRecord> = pb
    .collection(Collections.KomTimeseries)
    .getFirstListItem("", {
      sort: "-created",
    })
  return timeseriesRecordPromise
}

/**
 * Function that creates or updates a Kom Effort Records to be starred and if necessary creates the corrosponding Segment Records
 * @param {SegmentRecord[]} segments
 */
export const processNewSegments = async (segments: SegmentRecord[]): Promise<void> => {
  const session = await verifySession()
  if (!session.isLoggedIn || !session.userId || session.pbAuth == null) throw new Error("Couldn't authenticate!")

  pb.authStore.save(session.pbAuth)

  for (const segment of segments) {
    try {
      const komEffort: KomEffortRecord = await pb
        .collection(Collections.KomEfforts)
        .getFirstListItem(`segment_id=${segment.segment_id}`)
      komEffort.is_starred = true
      await pb.collection(Collections.KomEfforts).update(komEffort.id!, komEffort)
    } catch (err) {
      let seg_ref: SegmentRecord
      try {
        seg_ref = await pb.collection(Collections.Segments).getFirstListItem(`segment_id=${segment.segment_id}`)
      } catch (err) {
        seg_ref = await pb.collection(Collections.Segments).create(segment)
      }
      const newRecord: KomEffortRecord = {
        segment: seg_ref.id!,
        user: session.userId,
        segment_id: seg_ref.segment_id,
        is_starred: true,
        has_kom: false,
      }
      await pb.collection(Collections.KomEfforts).create(newRecord)
    }
  }
}

export const toggleStarEffort = async (segment_id: number, status: boolean) => {
  const session = await verifySession()
  if (!session.isLoggedIn || !session.userId || session.pbAuth == null) throw new Error("Couldn't authenticate!")

  pb.authStore.save(session.pbAuth)
  const [token, _] = await getStravaToken()

  const newStatus = !status
  try {
    await axios({
      method: "put",
      url: process.env.STRAVA_API + "/segments/" + segment_id + "/starred",
      headers: { Authorization: "Bearer " + token },
      data: {
        starred: newStatus,
      },
    })

    try {
      const effort: KomEffortRecord = await pb
        .collection(Collections.KomEfforts)
        .getFirstListItem(`segment_id=${segment_id}`)

      effort.is_starred = newStatus
      console.log(effort.is_starred)
      await pb
        .collection(Collections.KomEfforts)
        .update(effort.id!, effort)
        .then(() => console.log("PATCH SUCCESS"))
    } catch (dbError) {
      try {
        await axios({
          method: "put",
          url: process.env.STRAVA_API + "/segments/" + segment_id + "/starred",
          headers: { Authorization: "Bearer " + token },
          data: {
            starred: status,
          },
        })
        throw new Error("Database update failed, but Strava state was restored")
      } catch (stravaError) {
        throw new Error("Failed to update database and restore Strava state")
      }
    }
  } catch (stravaError) {
    throw new Error("Failed to toggle star on Strava")
  }
}

export async function revalidate(tag: string) {
  console.log("revalidate " + tag)
}
