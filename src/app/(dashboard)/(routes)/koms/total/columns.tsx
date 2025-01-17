"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { TableColumnHeader } from "../../table-components/table-column-header"
import { TableRowActions } from "../../table-components/table-row-action"
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
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "city",
    header: ({ column }) => <TableColumnHeader column={column} title="City" />,
    cell: ({ row }) => {
      return <span>{row.original.city}</span>
    },
  },

  {
    id: "actions",
    cell: ({ row }) => <TableRowActions row={row} />,
  },
]
