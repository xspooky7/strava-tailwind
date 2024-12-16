"use server"

import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import pb from "@/app/lib/pocketbase"
import { getIronSession } from "iron-session"
import { SessionData, sessionOptions } from "./lib"
import { cache } from "react"
import { Collections } from "../../../../pocketbase-types"

export const verifySession = cache(async () => {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions)
  if (!session?.isLoggedIn) {
    redirect("/")
  }

  return session //{ isAuth: true, userId: session.userId, pbAuth: session.pbAuth }
})

export const login = async (prevState: { error: null | boolean }, formData: FormData) => {
  const session = await verifySession()

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
    redirectPath = "/dashboard"
  } catch (err) {
    return true
  }
  if (redirectPath) redirect(redirectPath)
}
export const logout = async () => {
  const session = await verifySession()
  session.destroy()
  redirect("/")
}
