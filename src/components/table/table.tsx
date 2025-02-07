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
import { TablePagination } from "./table-pagination"
import { TableToolbar } from "./table-toolbar"
import { ColumnId, TableSegment } from "@/lib/types/types"
import { getColumn } from "@/lib/get-column"

interface DataTableProps {
  columnLayout: Partial<{ [key in ColumnId]: boolean }>
  tableSegments: TableSegment[]
  sort: string
  meta: string
}

export const SegmentTable = ({
  columnLayout,
  promises,
  sort,
  meta,
}: {
  promises: Promise<any>
  columnLayout: Partial<{ [key in ColumnId]: boolean }>
  sort: string
  meta: string
}) => {
  const data = React.use(promises)
  return <SegmentTableUse columnLayout={columnLayout} tableSegments={data} sort={sort} meta={meta} />
}

function SegmentTableUse({ columnLayout, tableSegments, sort, meta }: DataTableProps) {
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(columnLayout)
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([
    {
      desc: true,
      id: sort,
    },
  ])
  const [data, setData] = React.useState<TableSegment[]>(tableSegments)

  const columns: ColumnDef<TableSegment>[] = Object.keys(columnLayout).map((colId) => getColumn(colId as ColumnId))

  const table = useReactTable({
    data,
    columns,
    meta,
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

  const ref = React.useRef<HTMLInputElement>(null)

  let uniqueOpponents: string[] | undefined = undefined
  if (meta === "delta") {
    uniqueOpponents = [
      ...new Set(data.filter((segment) => segment.opponent !== undefined).map((segment) => segment.opponent!.name)),
    ]
  }

  return (
    <div className="space-y-4">
      <TableToolbar table={table} ref={ref} opponents={uniqueOpponents} />
      <div className="max-w-full rounded-md border bg-card overflow-x-auto">
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
    </div>
  )
}
