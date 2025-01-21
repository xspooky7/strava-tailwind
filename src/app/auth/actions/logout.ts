"use server"

import { redirect } from "next/navigation"
import { verifySession } from "./verify-session"

export const logout = async () => {
  const session = await verifySession()
  session.destroy()
  redirect("/")
}
