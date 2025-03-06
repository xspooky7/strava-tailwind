"use server"

import { verifySession } from "@/app/auth/actions/verify-session"
import { getStravaToken } from "./strava"
import pb from "./pocketbase"
import axios from "axios"
import { Collections, KomEffortRecord } from "./types/pocketbase-types"

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
      await pb.collection(Collections.KomEfforts).update(effort.id!, effort)
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
