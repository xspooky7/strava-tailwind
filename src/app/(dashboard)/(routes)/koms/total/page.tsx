import { DataTableSkeleton } from "../kom-components/table-skeleton"
import { KomTable } from "../kom-components/table"
import { columns } from "./columns"
import { TableSegment } from "../../../../../../types"
import { unstable_cache } from "next/cache"
import { checkAuth } from "@/auth/actions"
import { getTotalSegments } from "@/data-access/segments"
import { Suspense } from "react"

const getCachedTotalData = unstable_cache(async (session) => getTotalSegments(session), ["total"], {
  revalidate: 600,
  tags: ["total"],
})

const KomTotalPage = async () => {
  const session = await checkAuth()

  const data: Promise<TableSegment[]> = getCachedTotalData(session)

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
        <KomTable promises={data} columns={columns} />
      </Suspense>
    </div>
  )
}

export default KomTotalPage
