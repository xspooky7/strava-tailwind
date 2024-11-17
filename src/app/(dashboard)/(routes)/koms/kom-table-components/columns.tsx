"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { TableColumnHeader } from "./table-column-header"
import { priorities } from "./metadata"
import { TableRowActions } from "./table-row-action"
import { MinusIcon, PlusIcon, StarIcon } from "lucide-react"
import { KomEffortRecord, SegmentRecord } from "../../../../../../pocketbase-types"
import { Label } from "../../../../../../types"

export const columns: ColumnDef<KomEffortRecord & { expand: { segment: SegmentRecord } }>[] = [
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
              <Badge key={c} variant="outline">
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
          <>
            <PlusIcon className="mr-2 h-4 w-4 text-green-400" />
            <span className="text-green-400">{new Date(row.original.gained_at![0]).toDateString()}</span>
          </>
        ) : (
          <>
            <MinusIcon className="mr-2 h-4 w-4 text-red-400" />
            <span className="text-red-400">{new Date(row.original.lost_at![0]).toDateString()}</span>
          </>
        )

      return <div className="flex items-center">{bubble}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <TableRowActions row={row} />,
  },
]
