"use server"

import { verifySession } from "@/app/auth/actions/verify-session"
import { Collections, KomEffortRecord, SegmentRecord } from "@/lib/types/pocketbase-types"
import pb from "@/lib/pocketbase"

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
