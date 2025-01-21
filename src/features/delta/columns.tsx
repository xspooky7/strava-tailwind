"use client"

import { ColumnDef, Row } from "@tanstack/react-table"
import { TableColumnHeader } from "@/components/table/table-column-header"
import { CircleMinusIcon, CirclePlusIcon } from "lucide-react"
import { TableSegment } from "@/lib/types/types"

export const deltaColumns: { [key: string]: ColumnDef<TableSegment> } = {
  status: {
    id: "status",
    accessorKey: "status",
    header: ({ column }) => <TableColumnHeader column={column} title="Status" />,
    sortingFn: (rowA, rowB, columnId) => getDateFromRow(rowA) - getDateFromRow(rowB),
    cell: ({ row }) => {
      const createdDateString = new Date(row.original.created!).toDateString().slice(4)
      const bubble =
        row.original.status !== "lost" ? (
          <div className="flex min-w-[110px] py-1 items-center rounded-xl ">
            <CirclePlusIcon className="mr-2 h-4 w-4 text-[#28A745]" />
            <span className="text-[#28A745]">{createdDateString}</span>
          </div>
        ) : (
          <div className="flex min-w-[110px] py-1 items-center rounded-xl ">
            <CircleMinusIcon className="mr-2 h-4 w-4 text-destructive" />
            <span className="text-destructive">{createdDateString}</span>
          </div>
        )

      return <div className="flex items-center">{bubble}</div>
    },
  },
}

const getDateFromRow = (row: Row<TableSegment>): number => {
  return new Date(row.original.created!).getTime()
}
