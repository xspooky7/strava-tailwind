"use client"

import { sharedColumns } from "@/components/table/shared-columns"
import { ColumnId, TableSegment } from "./types/types"
import { ColumnDef } from "@tanstack/react-table"
import { deltaColumns } from "@/features/delta/columns"
import { tailwindColumns } from "@/features/tailwind/columns"

export function getColumns(tableId: "total" | "delta" | "tailwind") {
  switch (tableId) {
    case "delta":
      return {
        star: true,
        name: true,
        city: true,
        terrain: false,
        label: false,
        status: true,
        actions: true,
      }
  }
}
export function getColumn(id: ColumnId): ColumnDef<TableSegment> {
  switch (id) {
    case "name":
      return sharedColumns.name
    case "city":
      return sharedColumns.city
    case "terrain":
      return sharedColumns.terrain
    case "label":
      return sharedColumns.label
    case "actions":
      return sharedColumns.actions
    case "star":
      return sharedColumns.star
    case "status":
      return deltaColumns.status
    case "date":
      return deltaColumns.date
    case "opponent":
      return deltaColumns.opponent
    case "kom":
      return tailwindColumns.kom
    case "tailwind":
      return tailwindColumns.tailwind
    default:
      return sharedColumns.city
  }
}
