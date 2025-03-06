import { getIronSession } from "iron-session"
import { redirect } from "next/navigation"
import { cache } from "react"
import { SessionData } from "../types"
import { sessionOptions } from "../session-options"
import { cookies } from "next/headers"

export const getSession = async () => {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions)
  return session
}
export const verifySession = cache(async () => {
  const session = await getSession()
  if (!session?.isLoggedIn) {
    redirect("/")
  }
  return session //{ isAuth: true, userId: session.userId, pbAuth: session.pbAuth }
})
