import { DataTable } from "./data-table"
import { columns } from "./columns"
import React from "react"
import { DataTableSkeleton } from "../koms/kom-table-components/table-skeleton"
import { loadStarredSegments } from "./starred-segments"

export default async function Home() {
  let promises
  let statusMessage = ""
  const startTime = performance.now()
  //const update = await setDatabase('tailwind/segments', [])
  //statusMessage = update + ''
  try {
    promises = loadStarredSegments()
  } catch (error: any) {
    console.log(error)
    statusMessage = error.message
  }

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
        <DataTable columns={columns} promises={promises!} loadStart={startTime} />
      </React.Suspense>
    </div>
  )
}
