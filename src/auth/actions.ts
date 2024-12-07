"use server"

import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { Collections } from "../../pocketbase-types"
import pb from "@/lib/pocketbase"
import { getIronSession } from "iron-session"
import { defaultSession, SessionData, sessionOptions } from "./lib"

export const getSession = async () => {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions)

  if (!session.isLoggedIn) {
    session.isLoggedIn = defaultSession.isLoggedIn
  }

  // TODO Validation goes here

  return session
}

export const checkAuth = async () => {
  console.log("AUTH CHECK")
  const session = await getSession()
  if (!session.isLoggedIn) redirect("/")
  else return session
}
export const login = async (prevState: { error: null | boolean }, formData: FormData) => {
  const session = await getSession()

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
    console.log("dfdsf")
    return true
  }
  if (redirectPath) redirect(redirectPath)
}
export const logout = async () => {
  const session = await getSession()
  session.destroy()
  redirect("/")
}
