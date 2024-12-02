import { DataTable } from "./data-table"
import { columns } from "./columns"
import React from "react"
import { DataTableSkeleton } from "../koms/kom-table-components/table-skeleton"
import { loadStarredSegments } from "./starred-segments"

export default async function TailwindPage() {
  let statusMessage = ""
  const startTime = performance.now()

  const promises = loadStarredSegments().catch((error) => {
    console.log(error)
    statusMessage = error.message
  })
  const temp = (
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
        <DataTable columns={columns} promises={promises} loadStart={startTime} />
      </React.Suspense>
    </div>
  )
  return <p>Under Maintenance</p>
}
