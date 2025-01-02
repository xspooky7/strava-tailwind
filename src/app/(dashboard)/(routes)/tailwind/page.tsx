import { TailwindTable } from "./data-table"
import { columns } from "./columns"
import { loadStarredSegments } from "./starred-segments"
import { Suspense } from "react"
import { verifySession } from "@/app/lib/auth/actions"
import { CustomTableSkeleton } from "../table-components/table-skeleton"

export default async function TailwindPage() {
  const session = await verifySession()

  const promises = loadStarredSegments(session)

  return (
    <div className="container mx-auto py-5 px-4">
      <Suspense
        fallback={
          <CustomTableSkeleton
            columnCount={5}
            searchableColumnCount={1}
            filterableColumnCount={1}
            cellWidths={["4rem", "35rem", "14rem", "14rem", "5rem"]}
          />
        }
      >
        <TailwindTable columns={columns} promises={promises} />
      </Suspense>
    </div>
  )
}
