"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { TableColumnHeader } from "./table-column-header"
import { TableRowActions } from "./table-row-action"
import { CircleMinusIcon, CirclePlusIcon, MinusIcon, PlusIcon, StarIcon } from "lucide-react"
import { KomEffortRecord, SegmentRecord } from "../../../../../../pocketbase-types"
import { KomSegment, Label } from "../../../../../../types"

export const columns: ColumnDef<KomSegment>[] = [
  {
    id: "star",
    header: "",
    cell: ({ row }) => (
      <div className="flex justify-center w-10">
        <StarIcon className="h-5 w-5 translate-y-[2px] text-muted hover:text-amber-400 hover:fill-amber-400 cursor-pointer" />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => <TableColumnHeader column={column} title="Name" />,
    cell: ({ row }) => {
      const labels = row.original.expand.segment.labels
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
          <span className="max-w-[500px] truncate font-medium">{row.original.expand.segment.name}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "city",
    header: ({ column }) => <TableColumnHeader column={column} title="City" />,
    cell: ({ row }) => {
      return <span>{row.original.expand.segment.city}</span>
    },
  },

  {
    accessorKey: "status",
    header: ({ column }) => <TableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      let status = ""
      if (row.original.has_kom) {
        if (row.original.gained_at) status = "Gained"
      } else if (row.original.lost_at) status = "Lost"

      const bubble =
        status === "Gained" ? (
          <div className="flex py-1 px-2 items-center rounded-xl">
            <CirclePlusIcon className="mr-2 h-4 w-4 text-[#28A745]" />
            <span className="text-[#28A745]">{new Date(row.original.gained_at![0]).toDateString().slice(4)}</span>
          </div>
        ) : (
          <div className="flex py-1 px-2 items-center rounded-xl ">
            <CircleMinusIcon className="mr-2 h-4 w-4 text-destructive" />
            <span className="text-destructive">{new Date(row.original.lost_at![0]).toDateString().slice(4)}</span>
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
