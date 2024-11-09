"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ColumnDef } from "@tanstack/react-table"
import {
  ChevronsLeftRightEllipsisIcon,
  ChevronsUpDownIcon,
  CrownIcon,
  MoreHorizontal,
  MountainIcon,
  PercentIcon,
  SquareChevronRight,
  StarOffIcon,
  WindIcon,
} from "lucide-react"
import Image from "next/image"
import { DetailedSegment, Label } from "../../../../../types"
import { unstarSegment } from "@/lib/unstar-segment"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export const columns: ColumnDef<DetailedSegment>[] = [
  {
    accessorKey: "isOwnedKom",
    header: "",
    cell: ({ row }) => {
      let crownColor = "text-muted"
      if (row.original.isOwnedKom) crownColor = "text-amber-400"
      else if (!row.original.xoms.qom) crownColor = "text-pink-300"
      return (
        <div className="flex justify-center">
          <CrownIcon className={"h-5 w-5 " + crownColor} />
        </div>
      )
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          className="-ml-4"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ChevronsUpDownIcon className="h-2 w-2" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          {row.original.labels &&
            row.original.labels.slice(0, 2).map((c: Label) => (
              <Badge key={c} variant="outline">
                {c}
              </Badge>
            ))}
          <span>{row.original.name}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "city",
    header: ({ column }) => {
      return (
        <Button
          className="-ml-4"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          City
          <ChevronsUpDownIcon className="h-2 w-2" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return <span>{row.original.city ? row.original.city : "-"}</span>
    },
  },
  {
    accessorKey: "terrain",
    header: ({ column }) => {
      return (
        <Button
          className="-ml-4"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Terrain
          <ChevronsUpDownIcon className="h-2 w-2" />
        </Button>
      )
    },
    cell: ({ row }) => {
      let distance = Math.round(row.original.distance) + "m"
      if (distance.length > 4)
        distance = Math.round(row.original.distance / 100) / 10 + "km"
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
    header: "Profile",
    cell: ({ row }) => {
      return (
        row.original.elevation_profiles && (
          <Image
            src={row.original.elevation_profiles.light_url}
            alt="nig"
            width={112}
            height={32}
          />
        )
      )
    },
  },
  {
    accessorKey: "tail",
    header: ({ column }) => {
      return (
        <Button
          className="-ml-4"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Tailwind
          <ChevronsUpDownIcon className="h-2 w-2" />
        </Button>
      )
    },
    accessorFn: (row) => row.wind.tail,
    cell: ({ row }) => {
      const color = row.original.wind.tail >= 90 ? "" : ""
      return (
        <div className="flex space-x-2 items-center">
          <WindIcon className="h-4 w-4 text-muted-foreground" />
          <span>{Math.round(row.original.wind.avgTailwindSpeed)}km/h</span>
          <Separator orientation="vertical" className="h-4" />
          <PercentIcon className={"h-4 w-4 text-muted-foreground" + color} />
          <span className={"ml-3 text-primary" + color}>
            {Math.round(row.original.wind.tail)}
          </span>
        </div>
      )
    },
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      const payment = row.original
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() =>
                window.open(
                  "https://www.strava.com/segments/" + row.original.id,
                  "_blank",
                  "noopener,noreferrer"
                )
              }
            >
              <SquareChevronRight className="h-4 w-4" />
              View on Strava
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => unstarSegment(row.original.id)}>
              <StarOffIcon className="h-4 w-4" />
              Unstar Segment
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
