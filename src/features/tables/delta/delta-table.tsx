"use client"

import * as React from "react"

import { ColumnDef } from "@tanstack/react-table"
import { DeltaTableSegment } from "@/lib/types/types"
import { DataTable } from "../_components/table"
import { getDeltaSegments } from "./server/queries"
import { useDataTable } from "../_hooks/use-data-table"
import { TableFilterField } from "../_lib/types"
import { TableToolbar } from "../_components/table-toolbar"
import { createBaseColumns } from "../_lib/shared-columns"
import { deltaTableColumns } from "./columns"

interface DeltaTableProps {
  dataPromise: ReturnType<typeof getDeltaSegments>
}

export function DeltaTable({ dataPromise }: DeltaTableProps) {
  const { data, pageCount } = React.use(dataPromise)

  // Memoize the columns so they don't re-render on every render
  const columns: ColumnDef<DeltaTableSegment>[] = React.useMemo(() => {
    const baseColumns = createBaseColumns<DeltaTableSegment>()
    return [...baseColumns, ...deltaTableColumns]
  }, [])

  /**
   * This component can render either a faceted filter or a search filter based on the `options` prop.
   *
   * @prop options - An array of objects, each representing a filter option. If provided, a faceted filter is rendered. If not, a search filter is rendered.
   *
   * Each `option` object has the following properties:
   * @prop {string} label - The label for the filter option.
   * @prop {string} value - The value for the filter option.
   * @prop {React.ReactNode} [icon] - An optional icon to display next to the label.
   * @prop {boolean} [withCount] - An optional boolean to display the count of the filter option.
   */
  const filterFields: TableFilterField<DeltaTableSegment>[] = [
    {
      label: "Name",
      value: "name",
      placeholder: "Filter names...",
    },
    {
      label: "Labels",
      value: "labels",
      options: [
        "Hazardous",
        "Circuit",
        "Curvy",
        "Straight",
        "Climb",
        "Downhill",
        "Overlong",
        "Contested",
        "Uncontested",
      ].map((label) => ({
        label: label[0]?.toUpperCase() + label.slice(1),
        value: label,
      })),
    },
  ]

  const columnVisibility = {
    name: true,
    city: true,
    terrain: false,
    labels: false,
    opponent: true,
    status: true,
    created: true,
    actions: true,
  }
  const columnOrder = Object.keys(columnVisibility)

  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    filterFields,
    initialState: {
      columnOrder,
      columnVisibility,
      sorting: [{ id: "created", desc: true }],
      columnPinning: { right: ["actions"] },
    },
    shallow: false,
    clearOnDefault: true,
  })

  return (
    <DataTable table={table}>
      <TableToolbar table={table} filterFields={filterFields} />
    </DataTable>
  )
}
