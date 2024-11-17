import * as React from "react"

import { DataTableSkeleton } from "./kom-table-components/table-skeleton"
import { KomTable } from "./kom-table-components/kom-table"
import { columns } from "./kom-table-components/columns"
import { Collections, KomEffortRecord, SegmentRecord } from "../../../../../pocketbase-types"
import pb from "@/lib/pocketbase"
import { cookies } from "next/headers"

const KomPage = async () => {
  const cookie = cookies().get("pb_auth")
  if (!cookie) throw new Error("Not logged in")

  const { model } = JSON.parse(cookie.value)

  await pb.admins.authWithPassword(process.env.ADMIN_EMAIL!, process.env.ADMIN_PW!)
  const promises: Promise<(KomEffortRecord & { expand: { segment: SegmentRecord } })[]> = pb
    .collection(Collections.KomEfforts)
    .getFullList({
      filter: "has_kom=true && (gained_at != null || lost_at != null)",
      expand: "segment",
      next: { revalidate: 10 },
    })

  return (
    <div className="container mx-auto py-5 px-4">
      <React.Suspense
        fallback={
          <DataTableSkeleton
            columnCount={6}
            searchableColumnCount={1}
            filterableColumnCount={2}
            cellWidths={["10rem", "40rem", "12rem", "12rem", "8rem", "8rem"]}
            shrinkZero
          />
        }
      >
        <KomTable promises={promises} columns={columns} />
      </React.Suspense>
    </div>
  )
}

export default KomPage
