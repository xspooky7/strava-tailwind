import { Suspense } from "react"
import { CustomTableSkeleton } from "@/components/table/table-skeleton"
import { unstable_cache } from "next/cache"
import { verifySession } from "@/app/auth/actions/verify-session"
import { getDeltaSegments } from "@/features/delta/server/get-delta-segments"
import { SegmentTable } from "@/components/table/table"
import { ColumnId } from "@/lib/types/types"

const getCachedDeltaSegments = unstable_cache(async (session) => getDeltaSegments(session), ["delta"], {
  revalidate: 120, // 2 minutes
})

export default async function DeltaKomPage() {
  const session = await verifySession()
  const data = getCachedDeltaSegments(session)

  const columnLayout: Partial<{ [key in ColumnId]: boolean }> = {
    star: true,
    name: true,
    city: true,
    terrain: false,
    label: false,
    status: true,
    actions: true,
  }

  return (
    <div className="px-5 py-5 md:px-4">
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
        <SegmentTable promises={data} columnLayout={columnLayout} sort="status" />
      </Suspense>
    </div>
  )
}
