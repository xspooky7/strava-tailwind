import { loadScript } from "@/lib/load-script"
import { DataTable } from "./data-table"
import { columns } from "./columns"
import axios from "axios"
import { setDatabase } from "@/lib/database"
import React from "react"
import { DataTableSkeleton } from "../koms/kom-table-components/table-skeleton"

export default async function Home() {
  let segs: any[] = []
  let statusMessage = "Under Maintenance"
  //const update = await setDatabase('tailwind/segments', [])
  //statusMessage = update + ''
  try {
    const startTime = performance.now()
    const { segments, stravaRequestCount, meteoRequestCount, exceededRate, updateStatus } = await loadScript()
    segs = segments
    const loadTime = Math.round(performance.now() - startTime)
    statusMessage = `Page loaded in ${loadTime} milliseconds. Requests made: ${stravaRequestCount} Strava${
      exceededRate ? " (rate exceeded)" : ""
    }, ${meteoRequestCount} Open Meteo. Update successfull ${updateStatus}.`
    // console.log(segments.length, stravaRequestCount, overflowIds, updateStatus)
  } catch (error: any) {
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
        <DataTable columns={columns} data={segs} />
        <footer className="py-6 md:px-1 md:py-0">
          <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
            <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
              {statusMessage}
            </p>
          </div>
        </footer>
      </React.Suspense>
    </div>
  )
}
