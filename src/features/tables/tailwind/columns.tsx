"use client"

import { ColumnDef } from "@tanstack/react-table"
import { CrownIcon, PercentIcon, WindIcon } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { TailwindTableSegment } from "@/lib/types/types"
import { TableColumnHeader } from "../_components/table-column-header"

export const tailwindTableColumns: ColumnDef<TailwindTableSegment>[] = [
  {
    id: "kom",
    enableSorting: false,
    cell: ({ row }) => {
      let crownColor = "text-muted"
      if (row.original.has_kom) crownColor = "text-amber-300"
      else if (!row.original.leader_qom) crownColor = "text-pink-300"
      return (
        <div className="flex justify-center">
          <CrownIcon className={"h-5 w-5 " + crownColor} />
        </div>
      )
    },
  },
  {
    id: "tailwind",
    accessorKey: "tailwind",
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
/*
  profile: {
    accessorKey: "profile",
    header: ({ column }) => <TableColumnHeader column={column} title="Profile" />,
    cell: ({ row }) => {
      return <Image src={row.original.profile_url!} alt="" width={112} height={32} />
    },
  },*/
