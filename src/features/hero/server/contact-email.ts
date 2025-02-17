"use server"

import pb from "@/lib/pocketbase"
import { Collections, ContactFormRecord } from "@/lib/types/pocketbase-types"

export async function sendEmail({ username, email, text }: ContactFormRecord) {
  try {
    //TODO rate limit in pb
    await pb.collection(Collections.ContactForm).create({
      username,
      email,
      text,
    })
    return { success: true }
  } catch (error) {
    console.error("Failed to send message:", error)
    return { success: false }
  }
}
