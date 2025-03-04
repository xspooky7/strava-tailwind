import { verifySession } from "@/app/auth/actions/verify-session"
import { getTailwindSegments } from "@/features/tables/tailwind/server"

export default async function TailwindPage() {
  const session = await verifySession()

  const promises = await getTailwindSegments(session)

  return null
  /*<div className="px-5 py-5 md:px-4">
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
        <SegmentTable promises={promises} meta="tailwind" />
      </Suspense>
    </div>*/
}
