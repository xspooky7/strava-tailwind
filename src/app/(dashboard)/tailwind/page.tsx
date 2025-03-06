// app/tailwind/page.tsx
import TailwindTable from "@/features/tables/tailwind/tailwind-table"
import { Suspense } from "react"

export default function TailwindPage() {
  return (
    <div className="grid items-center gap-8 py-5 px-2 lg:px-4">
      <TailwindTable />
    </div>
  )
}
