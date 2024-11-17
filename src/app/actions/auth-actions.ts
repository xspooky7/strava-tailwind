// ./app/actions.ts

"use server"

import { redirect } from "next/navigation"
import PocketBase from "pocketbase"
import { cookies } from "next/headers"
import { Collections } from "../../../pocketbase-types"
import pb from "@/lib/pocketbase"

export async function login(formData: FormData) {
  console.log(formData)
  const username = formData.get("username") as string
  const password = formData.get("password") as string

  const { token, record: model } = await pb.collection(Collections.Users).authWithPassword(username, password)

  const cookie = JSON.stringify({ token, model })

  cookies().set("pb_auth", cookie, {
    secure: true,
    path: "/",
    sameSite: "strict",
    httpOnly: true,
    maxAge: 1209600, //2weeks
  })

  redirect("/koms")
}

export async function logout() {
  cookies().delete("pb_auth")
  redirect("/")
}
