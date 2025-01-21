"use server"

import { SessionData } from "@/app/auth/types"
import { TableSegment } from "@/lib/types/types"
import pb from "@/lib/pocketbase"
import { Collections } from "@/lib/types/pocketbase-types"

export const getTotalSegments = async (session: SessionData): Promise<TableSegment[]> => {
  if (!session.isLoggedIn || session.pbAuth == null) throw new Error("Couldn't authenticate!")
  pb.authStore.save(session.pbAuth)

  const data = await pb.collection(Collections.KomEfforts).getFullList({
    filter: "has_kom=true",
    expand: "segment",
    fields: `segment_id,has_kom,is_starred,
      expand.segment.name,
      expand.segment.city,
      expand.segment.labels,
      expand.segment.distance,
      expand.segment.average_grade`,
    sort: "-updated",
  })
  return data.map((d) => ({
    segment_id: d.segment_id,
    name: d.expand!.segment.name,
    city: d.expand!.segment.city,
    is_starred: d.is_starred,
    has_kom: d.has_kom,
    labels: d.expand!.segment.labels,
    distance: d.expand!.segment.distance,
    average_grade: d.expand!.segment.average_grade,
  }))
}
