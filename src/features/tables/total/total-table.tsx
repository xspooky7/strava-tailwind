"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "../_components/table"
import { getTotalKoms } from "./server/queries"
import { useDataTable } from "../_hooks/use-data-table"
import { TableFilterField } from "../_lib/types"
import { TableToolbar } from "../_components/table-toolbar"
import { BaseTableSegment } from "@/lib/types/types"
import { createBaseColumns } from "../_lib/shared-columns"

interface TableProps {
  dataPromise: ReturnType<typeof getTotalKoms>
}

export function TotalTable({ dataPromise }: TableProps) {
  const { data, pageCount } = React.use(dataPromise)

  // Memoize the columns so they don't re-render on every render
  const columns: ColumnDef<BaseTableSegment>[] = React.useMemo(() => {
    return createBaseColumns<BaseTableSegment>()
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
  //TODO share with other tables
  const filterFields: TableFilterField<BaseTableSegment>[] = [
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
    terrain: true,
    labels: false,
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
      sorting: [{ id: "name", desc: true }],
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
