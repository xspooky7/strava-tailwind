"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ChevronsLeftRightEllipsisIcon, CrownIcon, MountainIcon, PercentIcon, WindIcon } from "lucide-react"
import Image from "next/image"
import { Label, TailwindSegment } from "../../../../../types"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { TableColumnHeader } from "../table-components/table-column-header"

export const columns: ColumnDef<TailwindSegment>[] = [
  {
    accessorKey: "kom",
    header: "",
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
    accessorKey: "name",
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
      return <span>{row.original.city ? row.original.city : "-"}</span>
    },
  },
  {
    accessorKey: "terrain",
    header: ({ column }) => <TableColumnHeader column={column} title="Terrain" />,
    cell: ({ row }) => {
      let distance = Math.round(row.original.distance) + "m"
      if (distance.length > 4) distance = Math.round(row.original.distance / 100) / 10 + "km"
      return (
        <div className="flex space-x-2 items-center">
          <ChevronsLeftRightEllipsisIcon className="h-4 w-4 text-muted-foreground" />
          <span>{distance}</span>
          <Separator orientation="vertical" className="h-4" />
          <MountainIcon className="h-3 w-3 text-muted-foreground" />
          <span>{row.original.average_grade}%</span>
        </div>
      )
    },
  },
  {
    accessorKey: "profile",
    header: ({ column }) => <TableColumnHeader column={column} title="Profile" />,
    cell: ({ row }) => {
      return <Image src={row.original.profile_url!} alt="" width={112} height={32} />
    },
  },
  {
    accessorKey: "tail",
    header: ({ column }) => <TableColumnHeader column={column} title="Tailwind" />,
    accessorFn: (row) => row.wind!.tail,
    cell: ({ row }) => {
      const color = row.original.wind!.tail >= 90 ? "" : ""
      return (
        <div className="flex space-x-2 items-center">
          <WindIcon className="h-4 w-4 text-muted-foreground" />
          <span>{Math.round(row.original.wind!.avgTailwindSpeed)}km/h</span>
          <Separator orientation="vertical" className="h-4" />
          <PercentIcon className={"h-4 w-4 text-muted-foreground" + color} />
          <span className={"ml-3 text-primary" + color}>{Math.round(row.original.wind!.tail)}</span>
        </div>
      )
    },
  },
]
