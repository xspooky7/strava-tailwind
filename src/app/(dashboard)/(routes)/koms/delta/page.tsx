import { KomTable } from "../../table-components/table"
import { columns } from "./columns"
import { getDeltaSegments } from "@/app/lib/data-access/segments"
import { Suspense } from "react"
import { DataTableSkeleton } from "../../table-components/table-skeleton"
import { verifySession } from "@/app/lib/auth/actions"

export default async function DeltaKomPage() {
  const { isLoggedIn, pbAuth, userId } = await verifySession()
  const data = getDeltaSegments(isLoggedIn, pbAuth, userId)

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
        <KomTable promises={data} columns={columns} sort="status" />
      </Suspense>
    </div>
  )
}
