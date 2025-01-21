"use server"

import { revalidatePath } from "next/cache"

export async function revalidate(path: string) {
  revalidatePath(path)
  console.log("revalidate " + path)
}
