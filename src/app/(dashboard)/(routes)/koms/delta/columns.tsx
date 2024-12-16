"use client"

import { ColumnDef, Row } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { TableColumnHeader } from "../../table-components/table-column-header"
import { TableRowActions } from "../../table-components/table-row-action"
import { CircleMinusIcon, CirclePlusIcon, StarIcon } from "lucide-react"
import { TableSegment, Label } from "../../../../../../types"

export const columns: ColumnDef<TableSegment>[] = [
  {
    accessorKey: "name",
    filterFn: (row, _cloumnId: string, filterValue: string) =>
      row.original.name.toLowerCase().includes(filterValue.toLowerCase()) ||
      row.original.city.toLowerCase().includes(filterValue.toLowerCase()),
    header: ({ column }) => <TableColumnHeader column={column} title="Name" />,
    cell: ({ row }) => {
      const labels = row.original.labels
      return (
        <div className="flex space-x-2">
          {labels &&
            labels.slice(0, 2).map((c: Label) => (
              <Badge
                key={c}
                variant="outline"
                className="text-primary dark:text-secondary border-primary dark:border-secondary"
              >
                {c}
              </Badge>
            ))}
          <span className="max-w-[500px] truncate font-medium">{row.original.name}</span>
        </div>
      )
    },
  },
  {
    id: "label",
    accessorKey: "label",
    filterFn: (row, id, value) => {
      if (row.original.labels) return value.every((element: Label) => row.original.labels!.includes(element))
      return false
    },
    header: ({ column }) => null,
    cell: ({ row }) => null,
  },

  {
    accessorKey: "city",
    header: ({ column }) => <TableColumnHeader column={column} title="City" />,
    cell: ({ row }) => {
      return <span>{row.original.city}</span>
    },
  },

  {
    accessorKey: "status",
    header: ({ column }) => <TableColumnHeader column={column} title="Status" />,
    sortingFn: (rowA, rowB, columnId) => getDateFromRow(rowA) - getDateFromRow(rowB),
    cell: ({ row }) => {
      let status = ""
      if (row.original.has_kom) {
        if (row.original.gained_at) status = "Gained"
      } else if (row.original.lost_at) status = "Lost"

      const bubble =
        status === "Gained" ? (
          <div className="flex min-w-[110px] py-1 items-center rounded-xl ">
            <CirclePlusIcon className="mr-2 h-4 w-4 text-[#28A745]" />
            <span className="text-[#28A745]">
              {new Date(row.original.gained_at![row.original.gained_at!.length - 1]).toDateString().slice(4)}
            </span>
          </div>
        ) : (
          <div className="flex min-w-[110px] py-1 items-center rounded-xl ">
            <CircleMinusIcon className="mr-2 h-4 w-4 text-destructive" />
            <span className="text-destructive">
              {new Date(row.original.lost_at![row.original.lost_at!.length - 1]).toDateString().slice(4)}
            </span>
          </div>
        )

      return <div className="flex items-center">{bubble}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <TableRowActions row={row} />,
  },
]

const getDateFromRow = (row: Row<TableSegment>): number => {
  const { gained_at, lost_at } = row.original

  const lastGained = gained_at?.[gained_at.length - 1] || 0
  const lastLost = lost_at?.[lost_at.length - 1] || 0

  return Math.max(lastGained, lastLost)
}
