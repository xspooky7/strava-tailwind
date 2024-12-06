import * as React from "react"

import { KomTable } from "../kom-components/table"
import { columns } from "./columns"
import { Collections } from "../../../../../../pocketbase-types"
import pb from "@/lib/pocketbase"
import { TableSegment } from "../../../../../../types"
import { unstable_cache } from "next/cache"
import { checkAuth } from "@/auth/actions"

const getDeltaData = unstable_cache(
  async () => {
    await pb.admins.authWithPassword(process.env.ADMIN_EMAIL!, process.env.ADMIN_PW!)
    const data = await pb.collection(Collections.KomEfforts).getFullList({
      filter: "(gained_at != null || lost_at != null)",
      expand: "segment",
      fields:
        "gained_at,lost_at,has_kom,segment_id,is_starred,expand.segment.name,expand.segment.city,expand.segment.labels",
      sort: "-updated",
    })
    return data.map((d) => ({
      name: d.expand!.segment.name,
      city: d.expand!.segment.city,
      lost_at: d.lost_at,
      gained_at: d.gained_at,
      is_starred: d.is_starred,
      has_kom: d.has_kom,
      labels: d.expand!.segment.labels,
      segment_id: d.segment_id,
    }))
  },
  ["delta"],
  { revalidate: 600, tags: ["delta"] }
)

export default async function DeltaKomPage() {
  await checkAuth()
  const data: TableSegment[] = await getDeltaData()

  return (
    <div className="container mx-auto py-5 md:px-4">
      <KomTable data={data} columns={columns} />
    </div>
  )
}
