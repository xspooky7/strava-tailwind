"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TablePagination } from "../table-components/table-pagination"
import { TableToolbar } from "../table-components/table-toolbar"
import { TailwindSegment } from "../../../../../types"
import { RowActions } from "./row-action"
import { toggleStarEffort } from "@/data-access/segments"
import { revalidatePath, revalidateTag } from "next/cache"

interface DataTableProps {
  columns: ColumnDef<TailwindSegment>[]
  promises: Promise<any>
}

export function TailwindTable({ columns, promises }: DataTableProps) {
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({ label: false })
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])

  const [data, setData] = React.useState<TailwindSegment[]>([])
  React.useEffect(() => {
    promises.then((res) => setData(res.segments))
  }, [promises])

  const handleUnstar = (id: number) => {
    toggleStarEffort(id, true)
      .then(() => {
        setData((prevData) => prevData.filter((segment) => segment.segment_id !== id))
        revalidatePath("/tailwind")
        revalidateTag("strava-starred")
      })
      .catch((err) => console.log(JSON.stringify(err)))
  }

  const modifiedColumns = React.useMemo(
    () => [
      ...columns,
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          return <RowActions row={row} onUnstar={handleUnstar} />
        },
      },
    ],
    [columns, handleUnstar]
  )

  const table = useReactTable({
    data: data,
    columns: modifiedColumns,
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 30,
      },
    },
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  const loadTime = 12
  //const footer = `Page loaded in ${loadTime} milliseconds. Requests made: ${data.stravaRequestCount}
  //Strava${data.exceededRate ? " (rate exceeded)" : ""}, ${data.meteoRequestCount} Open Meteo.`

  return (
    <div className="space-y-4">
      <TableToolbar table={table} />
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <TablePagination table={table} />
      <footer className="py-6 md:px-1 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">footer</p>
        </div>
      </footer>
    </div>
  )
}
