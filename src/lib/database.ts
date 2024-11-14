import axios from "axios"
import { Collections, UserTokenRecord } from "../../pocketbase-types"
import pb from "./pocketbase"

export const getFromDatabase = async (path: string, settings?: Object): Promise<any> => {
  const response = await fetch(`${process.env.DATABASE_URL}${path}.json`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    ...settings,
  })

  if (!response.ok) {
    throw new Error(`Error fetching data: ${response.statusText}`)
  }

  return await response.json()
}

export const setDatabase = async (path: string, payload: any): Promise<number> => {
  const response = await fetch(`${process.env.DATABASE_URL}${path}.json`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  return response.status
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
