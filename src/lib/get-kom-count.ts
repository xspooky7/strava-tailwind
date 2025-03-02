"use server"

import { SessionData } from "@/app/auth/types"
import pb from "./pocketbase"
import { Collections, UserRecord } from "./types/pocketbase-types"
import { unstable_cache } from "./unstable-cache"

export const getKomCount = async (session: SessionData) => {
  return await unstable_cache(
    async () => {
      try {
        const { isLoggedIn, pbAuth, userId } = session
        if (!isLoggedIn || pbAuth == null || userId == null) throw new Error("Couldn't authenticate!")
        pb.authStore.save(pbAuth)

        const userRecord: UserRecord = await pb.collection(Collections.Users).getFirstListItem(`id="${userId}"`, {
          fields: "kom_count",
        })
        return userRecord.kom_count
      } catch (err) {
        return 0
      }
    },
    [JSON.stringify(session)],
    {
      revalidate: 3600,
      tags: ["kom_count"],
    }
  )()
}
