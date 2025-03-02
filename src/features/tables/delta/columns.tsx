"use client"

import { ColumnDef, Row } from "@tanstack/react-table"
import { CircleXIcon, FlagIcon, MedalIcon, PencilLineIcon, RotateCwIcon, Trash2Icon } from "lucide-react"
import { DeltaTableSegment } from "@/lib/types/types"
import { DateRange } from "@/components/date-range-picker/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import StatusTooltip from "@/features/tables/delta/components/status-tooltip"
import { TableColumnHeader } from "../_components/table-column-header"

export const deltaTableColumns: ColumnDef<DeltaTableSegment>[] = [
  {
    id: "created",
    accessorKey: "created",
    minSize: 100,
    header: ({ column }) => <TableColumnHeader column={column} title="Created" />,
    sortingFn: (rowA, rowB, columnId) => getDateFromRow(rowA) - getDateFromRow(rowB),
    filterFn: (row, columnId, filterValue) => {
      const rowDate = new Date(getDateFromRow(row))
      const { from, to } = filterValue as DateRange

      // Check if the date is within the specified range
      const isAfterFrom = from ? rowDate >= new Date(from) : true
      const isBeforeTo = to ? rowDate <= new Date(to) : true

      return isAfterFrom && isBeforeTo
    },
    cell: ({ row }) => {
      const createdDateString = new Date(row.original.created!).toDateString().slice(4)

      return <p className="text-muted-foreground min-w-[85px]">{createdDateString}</p>
    },
  },
  {
    id: "status",
    accessorKey: "status",
    header: ({ column }) => <TableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      switch (row.original.status) {
        case "gained":
          return (
            <StatusTooltip title="Gained" description="from another athlete" color="text-success" icon={MedalIcon} />
          )
        case "created":
          return (
            <StatusTooltip
              title="Created"
              description="a new segment by you or another athlete"
              color="text-info"
              icon={PencilLineIcon}
            />
          )
        case "claimed":
          return (
            <StatusTooltip title="Claimed" description="as first of your gender" color="text-warning" icon={FlagIcon} />
          )
        case "lost":
          return (
            <StatusTooltip title="Lost" description="to another athlete" color="text-destructive" icon={CircleXIcon} />
          )
        case "deleted":
          return (
            <StatusTooltip
              title="Deleted"
              description="by strava or the creator"
              color="text-destructive"
              icon={Trash2Icon}
            />
          )
        case "restored":
          return (
            <StatusTooltip
              title="Restored"
              description="since the recent change was removed by strava or the athlete"
              color="text-success"
              icon={RotateCwIcon}
            />
          )
        default:
          return null
      }
    },
  },
  {
    id: "opponent",
    accessorKey: "opponent",
    accessorFn: (row) => (row.opponent ? row.opponent.name : ""),
    header: ({ column }) => <TableColumnHeader column={column} title="Opponent" />,
    cell: ({ row }) => {
      const { opponent } = row.original
      if (opponent) {
        return (
          <div className="flex items-center gap-1">
            <Avatar className="w-7 h-7">
              <AvatarImage src={opponent.avatar} />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <span>{opponent.name}</span>
          </div>
        )
      }
      return null
    },
  },
]
//TODO tf
const getDateFromRow = (row: Row<DeltaTableSegment>): number => {
  return new Date(row.original.created!).getTime()
}
