"use server"

import { SessionData } from "@/app/auth/types"
import pb from "@/lib/pocketbase"
import { Collections } from "@/lib/types/pocketbase-types"
import { RecordModel } from "pocketbase"

export const getKomTimeline = async (session: SessionData): Promise<{ date: string; desktop: number }[]> => {
  if (!session.isLoggedIn || session.pbAuth == null) throw new Error("Couldn't authenticate!")
  pb.authStore.save(session.pbAuth)

  let current = 3592
  const rawData = await pb.collection(Collections.KomTimeseries).getFullList({
    fields: "created,status",
    sort: "created",
  })

  const data = rawData.map((entry: RecordModel): { date: string; desktop: number } => {
    if (entry.status === "lost") current -= 1
    else current += 1
    const splitDate = entry.created.split(" ")[0]
    return { date: splitDate, desktop: current }
  })
  const reducedData = reduceToLastOfMonth(data)
  reducedData.unshift(data[0])
  return reducedData
}

//chatgpt keep eye on this
function reduceToLastOfMonth(data: { date: string; desktop: number }[]): { date: string; desktop: number }[] {
  const grouped: Record<string, { date: string; desktop: number }> = data.reduce((acc, entry) => {
    const date = new Date(entry.date)
    const key = `${date.getFullYear()}-${date.getMonth()}`
    if (!acc[key] || new Date(entry.date) > new Date(acc[key].date)) {
      acc[key] = entry
    }
    return acc
  }, {} as Record<string, { date: string; desktop: number }>)

  return Object.values(grouped)
}
