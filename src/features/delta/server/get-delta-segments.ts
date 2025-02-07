"use server"

import { SessionData } from "@/app/auth/types"
import { TableSegment } from "@/lib/types/types"
import pb from "@/lib/pocketbase"
import { Collections } from "@/lib/types/pocketbase-types"

export const getDeltaSegments = async (session: SessionData): Promise<TableSegment[]> => {
  if (!session.isLoggedIn || session.pbAuth == null) throw new Error("Couldn't authenticate!")

  pb.authStore.save(session.pbAuth)
  const data = await pb.collection(Collections.KomTimeseries).getFullList({
    filter: "created > '2024-12-31 23:59:59'",
    expand: "opponent,kom_effort,kom_effort.segment",
    fields: `status,
      created,
      expand.opponent.name,
      expand.opponent.athlete_id,
      expand.opponent.avatar,
      expand.opponent.collectionId,
      expand.opponent.id,
      expand.kom_effort.segment_id,
      expand.kom_effort.has_kom,
      expand.kom_effort.is_starred,
      expand.kom_effort.expand.segment.name,
      expand.kom_effort.expand.segment.city,
      expand.kom_effort.expand.segment.labels,
      expand.kom_effort.expand.segment.distance,
      expand.kom_effort.expand.segment.average_grade`,
    sort: "-created",
  })

  return data.map((d) => ({
    status: d.status,
    created: new Date(d.created),
    opponent: d.expand!.opponent
      ? {
          name: d.expand!.opponent.name,
          athlete_id: d.expand!.opponent.athlete_id,
          avatar: `${process.env.PB_URL}/api/files/${d.expand!.opponent.collectionId}/${d.expand!.opponent.id}/${
            d.expand!.opponent.avatar
          }`,
        }
      : undefined,
    segment_id: d.expand!.kom_effort.segment_id,
    is_starred: d.expand!.kom_effort.is_starred,
    has_kom: d.expand!.kom_effort.has_kom,
    name: d.expand!.kom_effort.expand!.segment.name,
    city: d.expand!.kom_effort.expand!.segment.city,
    labels: d.expand!.kom_effort.expand!.segment.labels,
    distance: d.expand!.kom_effort.expand!.segment.distance,
    average_grade: d.expand!.kom_effort.expand!.segment.average_grade,
  }))
}
