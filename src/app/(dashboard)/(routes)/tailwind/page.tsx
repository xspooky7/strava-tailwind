import { TailwindTable } from "./data-table"
import { columns } from "./columns"
import { DataTableSkeleton } from "../table-components/table-skeleton"
import { loadStarredSegments } from "./starred-segments"
import { Suspense } from "react"
import { verifySession } from "@/app/lib/auth/actions"
import { LoaderIcon } from "lucide-react"

export default async function TailwindPage() {
  const session = await verifySession()
  let statusMessage = ""
  const startTime = performance.now()

  const promises = loadStarredSegments(session)
  const maintenance = <p>Under Maintenance</p>
  const temp = (
    <div className="container mx-auto py-5 px-4">
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-screen">
            <LoaderIcon className="size-6 animate-spin text-main-foreground" />
          </div>
        }
      >
        <TailwindTable columns={columns} promises={promises} />
      </Suspense>
    </div>
  )
  return temp
}
