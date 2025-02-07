"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { TableColumnHeader } from "./table-column-header"
import { TableRowActions } from "./table-row-action"
import { ChevronsLeftRightEllipsisIcon, MountainIcon, StarIcon, StarOffIcon } from "lucide-react"
import { TableSegment, Label } from "@/lib/types/types"
import { Separator } from "../ui/separator"
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
} from "../ui/alert-dialog"
import LabelsTooltip from "../label-tooltip"
import { ColumnHelper } from "@tanstack/react-table"

export type SharedData = {
  id: string
  name: string
  city: string
  terrain: string
  labels: Label[]
}

export function createSharedColumns<T extends SharedData>(columnHelper: ColumnHelper<T>) {
  return [
    columnHelper.accessor((x) => x.name, {
      id: "name",
      filterFn: (row, id: string, filterValue: string) =>
        row.original.name.toLowerCase().includes(filterValue.toLowerCase()) ||
        row.original.city.toLowerCase().includes(filterValue.toLowerCase()),
      header: ({ column }) => <TableColumnHeader column={column} title="Name" />,
      cell: ({ row }) => {
        const labels = row.original.labels
        const name = row.original.name

        return (
          <div className="flex flex-wrap gap-2 items-center md:flex-nowrap">
            {labels && labels.length > 0 && <LabelsTooltip labels={labels} />}
            <div className="xl:flex hidden flex-wrap gap-2 ">
              {labels &&
                labels.map((c: Label) => (
                  <Badge
                    key={c}
                    variant="outline"
                    className="text-primary bg-card dark:text-secondary border-primary dark:border-secondary"
                  >
                    {c}
                  </Badge>
                ))}
            </div>

            <span className="font-medium">{name}</span>
          </div>
        )
      },
    }),
  ]
}
export const sharedColumns: Record<string, ColumnDef<TableSegment>> = {
  name: {
    id: "name",
    accessorKey: "name",
    filterFn: (row, id: string, filterValue: string) =>
      row.original.name.toLowerCase().includes(filterValue.toLowerCase()) ||
      row.original.city.toLowerCase().includes(filterValue.toLowerCase()),
    header: ({ column }) => <TableColumnHeader column={column} title="Name" />,
    cell: ({ row }) => {
      const labels = row.original.labels
      const name = row.original.name

      return (
        <div className="flex flex-wrap gap-2 items-center md:flex-nowrap">
          {labels && labels.length > 0 && <LabelsTooltip labels={labels} />}
          <div className="xl:flex hidden flex-wrap gap-2 ">
            {labels &&
              labels.map((c: Label) => (
                <Badge
                  key={c}
                  variant="outline"
                  className="text-primary bg-card dark:text-secondary border-primary dark:border-secondary"
                >
                  {c}
                </Badge>
              ))}
          </div>

          <span className="font-medium">{name}</span>
        </div>
      )
    },
  },
  label: {
    id: "label",
    accessorKey: "label",
    filterFn: (row, id, value) => {
      if (row.original.labels) return value.every((element: Label) => row.original.labels!.includes(element))
      return false
    },
    header: ({ column }) => null,
    cell: ({ row }) => null,
    enableSorting: false,
    enableHiding: false,
  },
  city: {
    id: "city",
    accessorKey: "city",
    header: ({ column }) => <TableColumnHeader column={column} title="City" />,
    cell: ({ row }) => {
      return <span>{row.original.city}</span>
    },
  },
  terrain: {
    id: "terrain",
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
  actions: {
    id: "actions",
    cell: ({ row }) => <TableRowActions row={row} />,
    enableSorting: false,
    enableHiding: false,
  },
  star: {
    id: "star",
    cell: ({ row }) => {
      const starred = row.original.is_starred
      return (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <div className="flex justify-center items-center cursor-pointer group">
              <StarIcon
                className={
                  "h-5 w-5 translate-y-[2px] cursor-pointer" +
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
              <AlertDialogAction onClick={() => console.log(row.original.segment_id, starred)}>
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
}
