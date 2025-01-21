"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Cross2Icon } from "@radix-ui/react-icons"
import { Table } from "@tanstack/react-table"
import { TableFacetedFilter } from "./table-faceted-filter"
import { labels } from "./metadata"
import { RefreshCwIcon } from "lucide-react"
import { toast } from "sonner"
import { usePathname } from "next/navigation"
import { DataTableViewOptions } from "./data-table-view-option"
import { revalidate } from "@/lib/revalidate-path"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function TableToolbar<TData>({ table }: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  const path = usePathname()

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filter segments..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
        />
        <Button
          className="h-8 w-8"
          variant="outline"
          size="icon"
          onClick={() => {
            toast.promise(revalidate(path), {
              loading: "Loading...",
              success: () => {
                return "Table successfully revalidated"
              },
              error: "Table couldn't be revalidated",
            })
          }}
        >
          <RefreshCwIcon className="h-4 w-4" />
        </Button>
        {table.getColumn("label") && (
          <TableFacetedFilter column={table.getColumn("label")} title="Label" options={labels} />
        )}
        {isFiltered && (
          <Button variant="ghost" onClick={() => table.resetColumnFilters()} className="h-8 px-2 lg:px-3">
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  )
}
