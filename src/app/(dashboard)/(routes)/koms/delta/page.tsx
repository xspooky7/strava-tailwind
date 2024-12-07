import { KomTable } from "../kom-components/table"
import { columns } from "./columns"
import { unstable_cache } from "next/cache"
import { checkAuth } from "@/auth/actions"
import { getDeltaSegments } from "@/data-access/segments"
import { Suspense } from "react"
import { DataTableSkeleton } from "../kom-components/table-skeleton"

const getCachedDeltaSegments = unstable_cache(async (session) => getDeltaSegments(session), ["delta"], {
  revalidate: 600,
  tags: ["delta"],
})

export default async function DeltaKomPage() {
  const session = await checkAuth()
  const data = getCachedDeltaSegments(session)

  return (
    <div className="container mx-auto py-5 md:px-4">
      <Suspense
        fallback={
          <DataTableSkeleton
            columnCount={5}
            searchableColumnCount={1}
            filterableColumnCount={1}
            cellWidths={["4rem", "35rem", "14rem", "14rem", "5rem"]}
            shrinkZero
          />
        }
      >
        <KomTable promises={data} columns={columns} />
      </Suspense>
    </div>
  )
}
