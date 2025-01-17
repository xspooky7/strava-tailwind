import { TailwindTable } from "./data-table"
import { columns } from "./columns"
import { loadStarredSegments } from "./starred-segments"
import { Suspense } from "react"
import { verifySession } from "@/app/lib/auth/actions"
import { CustomTableSkeleton } from "../table-components/table-skeleton"
import { unstable_cache } from "next/cache"

const getCachedTwilwindSegments = unstable_cache(async (session) => loadStarredSegments(session), ["tailwind"], {
  revalidate: 240, // 4 minutes
})

export default async function TailwindPage() {
  const session = await verifySession()

  const promises = loadStarredSegments(session)

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
        <TailwindTable columns={columns} promises={promises} />
      </Suspense>
    </div>
  )
}
