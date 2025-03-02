import * as React from "react"
import { verifySession } from "@/app/auth/actions/verify-session"
import pb from "@/lib/pocketbase"
import { TotalTable } from "@/features/tables/total/total-table"
import { SearchParams } from "@/features/tables/_lib/types"
import { searchParamsSchema } from "@/features/tables/_lib/validations"
import { getTotalKoms } from "@/features/tables/total/server/queries"
import { TableSkeleton } from "@/features/tables/_components/table-skeleton"
import { CustomTableSkeleton } from "@/components/table/table-skeleton"

export interface TotalPageProps {
  searchParams: Promise<SearchParams>
}

export default async function TotalPage({ searchParams }: TotalPageProps) {
  const session = await verifySession()
  pb.authStore.save(session.pbAuth!)

  const awaitedParams = await searchParams
  const search = searchParamsSchema.parse(awaitedParams)

  const dataPromise = getTotalKoms(search)

  return (
    <div className="grid items-center gap-8 py-5 px-2 lg:px-4">
      <React.Suspense
        fallback={
          <CustomTableSkeleton
            columnCount={5}
            searchableColumnCount={1}
            filterableColumnCount={2}
            cellWidths={["10rem", "40rem", "12rem", "12rem", "8rem"]}
            shrinkZero
          />
        }
      >
        <TotalTable dataPromise={dataPromise} />
      </React.Suspense>
    </div>
  )
}
