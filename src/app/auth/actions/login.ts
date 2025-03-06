"use server"

import { getIronSession } from "iron-session"
import { SessionData } from "../types"
import { sessionOptions } from "../session-options"
import { Collections } from "@/lib/types/pocketbase-types"
import pb from "@/lib/pocketbase"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"

export const login = async (prevState: { error: null | boolean }, formData: FormData) => {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions)

  let redirectPath: string | null = null

  const username = formData.get("username") as string
  const password = formData.get("password") as string

  try {
    const { token, record: userModel } = await pb.collection(Collections.Users).authWithPassword(username, password)
    session.username = userModel.username
    session.name = userModel.name
    session.pbAuth = token
    session.isLoggedIn = true
    session.pfpUrl = userModel.pfp_url
    session.userId = userModel.id
    session.athleteId = userModel.athlete_id

    await session.save()
    redirectPath = "/koms/delta"
  } catch (err) {
    return true
  }
  if (redirectPath) redirect(redirectPath)
}
