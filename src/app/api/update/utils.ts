import { KOM_REGAINED_THRESHOLD } from "@/lib/constants"
import pb from "@/lib/pocketbase"
import { Collections, KomTimeseriesRecord } from "@/lib/types/pocketbase-types"
import { NextResponse } from "next/server"

export let DEBUG_LOG = ""

export async function checkIfRestored(segmentId: number) {
  let previousEntry: KomTimeseriesRecord | null = null
  try {
    previousEntry = await pb.collection(Collections.KomTimeseries).getFirstListItem(`kom_effort=${segmentId}`)
    if (previousEntry) {
      return new Date().getTime() - new Date(previousEntry.created!).getTime() < KOM_REGAINED_THRESHOLD
    }
    return false
  } catch {
    log(`[INFO] Didn't find previous timeseries entry for segment ${segmentId}`)
    return false
  }
}

export const log = (message: string, newline = true, payload?: object) => {
  console.log(message)
  DEBUG_LOG += `${message}${newline ? "\n" : ""}`
}

export const errorResponse = (message: string, status = 400, error?: any, ...params: any[]) => {
  return new NextResponse(
    `[ERROR ${status}] ${message} \n\n -ERROR: ${
      error ? JSON.stringify(error, Object.getOwnPropertyNames(error)) : "-"
    } \n\n -LOG: ${DEBUG_LOG}  \n\n -PARAMS: ${JSON.stringify(params)}`,
    {
      status: status,
    }
  )
}
