"use server"

import pb from "@/lib/pocketbase"
import { Collections, SegmentRecord, UserTokenRecord } from "./types/pocketbase-types"
import axios from "axios"
import { getLabel, getPath, sanatizeSegment } from "./utils"
import { verifySession } from "@/app/auth/actions/verify-session"

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

export const fetchStarredPage = async (page: number, stravaToken: string) => {
  const session = await verifySession()
  if (!session.isLoggedIn || !session.userId || session.pbAuth == null) throw new Error("Couldn't authenticate!")

  return fetch(`${process.env.STRAVA_API}/segments/starred?page=${page}&per_page=200`, {
    method: "GET",
    headers: {
      Authorization: "Bearer " + stravaToken,
    },
    next: {
      tags: ["strava-starred"],
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Error ${response.status}: Couldn't retrieve starred segment page ${page} from Strava`)
      }
      return response.json()
    })
    .catch((err) => {
      throw new Error(`Error 401: Couldn't retrieve starred segment page ${page} from Strava`)
    })
}

export const getStravaToken = async (overlapSeconds = 600): Promise<[string, boolean]> => {
  const userTokenRecord: UserTokenRecord = await pb
    .collection(Collections.UserTokens)
    .getFirstListItem(`user = "${process.env.USER_ID}"`, { cache: "no-store" })
  const expiryDate = new Date(userTokenRecord.expires_at)

  if (new Date().getTime() >= expiryDate.getTime()) {
    const newTokenData = await axios.post(
      "https://www.strava.com/api/v3/oauth/token",
      {
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token: userTokenRecord.refresh_token,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    )

    const expiryDateString = new Date((newTokenData.data.expires_at - overlapSeconds) * 1000).toISOString()
    await pb.collection(Collections.UserTokens).update(userTokenRecord.id!, {
      access_token: newTokenData.data.access_token,
      refresh_token: newTokenData.data.refresh_token,
      expires_at: expiryDateString,
    })

    return [newTokenData.data.access_token, true]
  } else return [userTokenRecord.access_token, false]
}
