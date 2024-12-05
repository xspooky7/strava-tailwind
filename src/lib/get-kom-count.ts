import { unstable_cache } from "next/cache"
import { Collections, KomTimeseriesRecord } from "../../pocketbase-types"
import pb from "./pocketbase"

export const getKomCount = unstable_cache(
  async () => {
    await pb.admins.authWithPassword(process.env.ADMIN_EMAIL!, process.env.ADMIN_PW!)
    const timeseriesRecordPromise: Promise<KomTimeseriesRecord> = pb
      .collection(Collections.KomTimeseries)
      .getFirstListItem("", {
        sort: "-created",
      })
    return timeseriesRecordPromise
  },
  ["count"],
  { revalidate: 600, tags: ["count"] }
)
