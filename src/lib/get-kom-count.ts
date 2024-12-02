import { Collections, KomTimeseriesRecord } from "../../pocketbase-types"
import pb from "./pocketbase"

export async function getKomCount(userId: string) {
  await pb.admins.authWithPassword(process.env.ADMIN_EMAIL!, process.env.ADMIN_PW!)
  const timeseriesRecordPromise: Promise<KomTimeseriesRecord> = pb
    .collection(Collections.KomTimeseries)
    .getFirstListItem("", {
      sort: "-created",
      next: { revalidate: 240 },
    })
  return timeseriesRecordPromise
}
