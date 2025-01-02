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
import { TableSegment } from "../../../../../types"
import { toggleStarEffort } from "@/app/lib/data-access/segments"
import { revalidateTag } from "next/cache"
import { StarIcon, StarOffIcon } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface DataTableProps {
  columns: ColumnDef<TableSegment>[]
  tableSegments: TableSegment[]
  sort: string
  tableId: string
}

export const KomTable = ({
  columns,
  promises,
  sort,
  tableId,
}: {
  promises: Promise<any>
  columns: ColumnDef<TableSegment>[]
  sort: string
  tableId: string
}) => {
  const data = React.use(promises)
  return <KomTableUse columns={columns} tableSegments={data} sort={sort} tableId={tableId} />
}

function KomTableUse({ columns, tableSegments, sort, tableId }: DataTableProps) {
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({ label: false })
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([
    {
      desc: true,
      id: sort,
    },
  ])
  const [data, setData] = React.useState<TableSegment[]>(tableSegments)

  const handleToggleStar = (id: number, isCurrentlyStarred: boolean) => {
    toggleStarEffort(id, isCurrentlyStarred)
      .then(() => {
        console.log("togglestar")
        setData((prevData) =>
          prevData.map((item) => (id === item.segment_id ? { ...item, is_starred: !isCurrentlyStarred } : item))
        )
        setData((prevData) => prevData.filter((segment) => segment.segment_id !== id))
        revalidateTag(tableId)
      })
      .catch((err) => console.log(JSON.stringify(err)))
  }

  const modifiedColumns = React.useMemo(
    () => [
      {
        id: "star",
        cell: ({ row }) => {
          const starred = row.original.is_starred
          return (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <div className="flex justify-center items-center cursor-pointer group">
                  <StarIcon
                    className={
                      "h-5 w-5 translate-y-[2px]  cursor-pointer" +
                      (starred
                        ? " text-amber-400 fill-amber-400 group-hover:text-muted group-hover:fill-transparent"
                        : " text-muted group-hover:text-amber-400 group-hover:fill-amber-400")
                    }
                  />
                </div>
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex gap-2 items-center">
                    {starred ? (
                      <>
                        <StarOffIcon className="h-5 w-5" />
                        Unstar Segment?
                      </>
                    ) : (
                      <>
                        <StarIcon className="h-5 w-5" />
                        Star Segment?
                      </>
                    )}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Do you want to {starred ? "unstar" : "star"} {row.original.name}?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleToggleStar(row.original.segment_id, starred)}>
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )
        },
        enableSorting: false,
        enableHiding: false,
      },
      ...columns,
    ],
    [columns, handleToggleStar]
  )

  const table = useReactTable({
    data,
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
  return (
    <div className="space-y-4">
      <TableToolbar table={table} revalidateId={tableId} />
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
    </div>
  )
}
