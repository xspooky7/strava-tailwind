import { CustomTableSkeleton } from "@/components/table/table-skeleton"
import { ColumnId, TableSegment } from "../../../../lib/types/types"
import { Suspense } from "react"
import { unstable_cache } from "next/cache"
import { TotalKomChart, TotalKomChartLoading } from "@/features/total/total-kom-chart"
import { verifySession } from "@/app/auth/actions/verify-session"
import { getTotalSegments } from "@/features/total/server/get-total-segments"
import { SegmentTable } from "@/components/table/table"
import { getKomTimeline } from "@/features/total/server/get-kom-timeline"
import { Separator } from "@/components/ui/separator"

const getCachedTotalSegments = unstable_cache(async (session) => getTotalSegments(session), ["total"], {
  revalidate: 120, // 2 minutes
})

const KomTotalPage = async () => {
  const session = await verifySession()
  const totalKoms: Promise<TableSegment[]> = getCachedTotalSegments(session)
  const komTimeline: Promise<{ date: string; desktop: number }[]> = getKomTimeline(session)

  const columnLayout: Partial<{ [key in ColumnId]: boolean }> = {
    star: true,
    name: true,
    city: true,
    terrain: false,
    label: false,
    actions: true,
  }

  return (
    <div className="px-5 py-5 space-y-6">
      <Suspense fallback={<TotalKomChartLoading />}>
        <TotalKomChart chartDataPromise={komTimeline} />
      </Suspense>
      <Separator className="w-full opacity-30" />
      <Suspense
        fallback={
          <CustomTableSkeleton
            columnCount={4}
            searchableColumnCount={1}
            filterableColumnCount={1}
            cellWidths={["4rem", "40rem", "14rem", "5rem"]}
          />
        }
      >
        <SegmentTable promises={totalKoms} columnLayout={columnLayout} sort="name" />
      </Suspense>
    </div>
  )
}

export default KomTotalPage
