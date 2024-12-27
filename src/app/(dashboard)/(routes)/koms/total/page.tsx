import { DataTableSkeleton } from "../../table-components/table-skeleton"
import { KomTable } from "../../table-components/table"
import { columns } from "./columns"
import { TableSegment } from "../../../../../../types"
import { getTotalSegments } from "@/app/lib/data-access/segments"
import { Suspense } from "react"
import { verifySession } from "@/app/lib/auth/actions"
import { unstable_cache } from "next/cache"

const getCachedDeltaSegments = unstable_cache(async (session) => getTotalSegments(session), ["total"])

const KomTotalPage = async () => {
  const session = await verifySession()
  const data: Promise<TableSegment[]> = getCachedDeltaSegments(session)

  return (
    <div className="container mx-auto py-5 md:px-4">
      <Suspense
        fallback={
          <DataTableSkeleton
            columnCount={4}
            searchableColumnCount={1}
            filterableColumnCount={1}
            cellWidths={["4rem", "40rem", "14rem", "5rem"]}
            shrinkZero
          />
        }
      >
        <KomTable promises={data} columns={columns} sort="city" />
      </Suspense>
    </div>
  )
}

export default KomTotalPage
