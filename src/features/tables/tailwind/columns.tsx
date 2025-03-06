"use client"

import { ColumnDef } from "@tanstack/react-table"
import { PercentIcon, WindIcon } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { TailwindTableSegment } from "@/lib/types/types"
import { TableColumnHeader } from "../_components/table-column-header"

export const tailwindTableColumns: ColumnDef<TailwindTableSegment>[] = [
  {
    id: "tailwind",
    header: ({ column }) => <TableColumnHeader column={column} title="Tailwind" />,
    accessorFn: (row) => row.wind!.tail,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2 items-center">
          <WindIcon className="h-4 w-4 text-muted-foreground" />
          <span>{Math.round(row.original.wind!.avgTailwindSpeed)}km/h</span>
          <Separator orientation="vertical" className="h-4" />
          <PercentIcon className={"h-4 w-4 text-muted-foreground"} />
          <span className={"ml-3 text-primary"}>{Math.round(row.original.wind!.tail)}</span>
        </div>
      )
    },
  },
]
