"use server"

import { SessionData } from "@/auth/lib"
import pb from "@/lib/pocketbase"
import { Collections, KomTimeseriesRecord } from "../../pocketbase-types"
import { TableSegment } from "../../types"

export const getDeltaSegments = async (session: SessionData): Promise<TableSegment[]> => {
  if (!session.isLoggedIn || session.pbAuth == null) throw new Error("Couldn't authenticate!")

  pb.authStore.save(session.pbAuth)
  const data = await pb.collection(Collections.KomEfforts).getFullList({
    filter: "(gained_at != null || lost_at != null)",
    expand: "segment",
    fields:
      "gained_at,lost_at,has_kom,segment_id,is_starred,expand.segment.name,expand.segment.city,expand.segment.labels",
    sort: "-updated",
  })
  return data.map((d) => ({
    name: d.expand!.segment.name,
    city: d.expand!.segment.city,
    lost_at: d.lost_at,
    gained_at: d.gained_at,
    is_starred: d.is_starred,
    has_kom: d.has_kom,
    labels: d.expand!.segment.labels,
    segment_id: d.segment_id,
  }))
}

export const getTotalSegments = async (session: SessionData): Promise<TableSegment[]> => {
  if (!session.isLoggedIn || session.pbAuth == null) throw new Error("Couldn't authenticate!")

  pb.authStore.save(session.pbAuth)

  const data = await pb.collection(Collections.KomEfforts).getFullList({
    filter: "has_kom=true",
    expand: "segment",
    fields:
      "gained_at,lost_at,has_kom,segment_id,is_starred,expand.segment.name,expand.segment.city,expand.segment.labels",
    sort: "-updated",
  })
  return data.map((d) => ({
    name: d.expand!.segment.name,
    city: d.expand!.segment.city,
    lost_at: d.lost_at,
    gained_at: d.gained_at,
    segment_id: d.segment_id,
    is_starred: d.is_starred,
    has_kom: d.has_kom,
    labels: d.expand!.segment.labels,
  }))
}

export const getKomCount = async (): Promise<KomTimeseriesRecord> => {
  // TODO replace admin auth

  pb.admins.authWithPassword(process.env.ADMIN_EMAIL!, process.env.ADMIN_PW!)
  const timeseriesRecordPromise: Promise<KomTimeseriesRecord> = pb
    .collection(Collections.KomTimeseries)
    .getFirstListItem("", {
      sort: "-created",
    })
  return timeseriesRecordPromise
}
