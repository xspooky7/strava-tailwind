import { TailwindTable } from "./data-table"
import { columns } from "./columns"
import { DataTableSkeleton } from "../table-components/table-skeleton"
import { loadStarredSegments } from "./starred-segments"
import { Suspense } from "react"
import { verifySession } from "@/app/lib/auth/actions"

export default async function TailwindPage() {
  const session = await verifySession()
  let statusMessage = ""
  const startTime = performance.now()

  /*const promises = loadStarredSegments()

  const temp = (
    <div className="container mx-auto py-5 px-4">
      <Suspense
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
        <TailwindTable columns={columns} promises={promises} />
      </Suspense>
    </div>
  )*/
  return <p>Under Maintenance</p>
}
