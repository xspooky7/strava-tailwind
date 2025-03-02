"use server"

import { verifySession } from "@/app/auth/actions/verify-session"
import { RecordModel } from "pocketbase"
import { Collections } from "@/lib/types/pocketbase-types"
import pb from "@/lib/pocketbase"

export const getStarredSegments = async (): Promise<RecordModel[]> => {
  const session = await verifySession()
  if (!session.isLoggedIn || session.pbAuth == null) throw new Error("Couldn't authenticate!")

  pb.authStore.save(session.pbAuth)

  const starredSegmentsRequest = await pb.collection(Collections.KomEfforts).getFullList({
    filter: `user="${session.userId}" && is_starred=true`,
    expand: "segment",
    fields: `id,expand.segment.name,
    expand.segment.city,
    segment_id,
    expand.segment.distance,
    expand.segment.labels,
    expand.segment.path,
    is_starred,
    has_kom,
    expand.segment.average_grade,
    expand.segment.leader_qom`,
  })

  return starredSegmentsRequest
}
