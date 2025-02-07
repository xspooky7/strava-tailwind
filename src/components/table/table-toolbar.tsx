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
import { RefObject } from "react"
import { DateRangePicker } from "../date-range-picker/date-range-picker"
import { DateRange } from "../date-range-picker/types"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  ref?: RefObject<HTMLInputElement | null>
  opponents?: string[]
}

export function TableToolbar<TData>({ table, ref, opponents }: DataTableToolbarProps<TData>) {
  const labelFilterActive = table.getState().columnFilters.find((filter) => filter.id === "label")
  const statusFilter = table.getState().columnFilters.find((filter) => filter.id === "")
  const path = usePathname()

  const handleScrollIntoView = (event: React.MouseEvent<HTMLInputElement>) => {
    event.currentTarget.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const filterByDate = (range: DateRange) => {
    table.setColumnFilters((prevFilters) => [
      ...prevFilters.filter((filter) => filter.id !== "date"),
      {
        id: "date",
        value: range,
      },
    ])
  }

  const resetLabelFilter = () => {
    table.setColumnFilters((prevFilters) => [...prevFilters.filter((filter) => filter.id !== "label")])
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          ref={ref}
          placeholder="Filter segments..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
          onClick={handleScrollIntoView}
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
        {labelFilterActive && (
          <Button variant="ghost" onClick={resetLabelFilter} className="h-8 px-2 lg:px-3">
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex space-x-2">
        <DateRangePicker onUpdate={filterByDate} />
        <DataTableViewOptions table={table} />
      </div>
    </div>
  )
}
