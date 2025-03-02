"use server"

import { verifySession } from "@/app/auth/actions/verify-session"
import pb from "@/lib/pocketbase"
import { Collections } from "@/lib/types/pocketbase-types"

export const bulkUnstarSegments = async (recordIds: string[]) => {
  if (!recordIds.length) return
  const session = await verifySession()
  if (!session.isLoggedIn || session.pbAuth == null) throw new Error("Couldn't authenticate!")

  pb.authStore.save(session.pbAuth)
  return Promise.all(recordIds.map((id) => pb.collection(Collections.KomEfforts).update(id, { is_starred: false })))
}
