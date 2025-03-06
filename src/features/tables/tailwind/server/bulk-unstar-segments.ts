"use server"

import pb from "@/lib/pocketbase"
import { Collections } from "@/lib/types/pocketbase-types"

export const bulkUnstarSegments = async (recordIds: string[]) => {
  if (!recordIds.length) return
  return Promise.all(recordIds.map((id) => pb.collection(Collections.KomEfforts).update(id, { is_starred: false })))
}
