import { DataTableSkeleton } from "../table-components/table-skeleton"

function SettingsPage() {
  return (
    <DataTableSkeleton
      columnCount={5}
      searchableColumnCount={1}
      filterableColumnCount={1}
      cellWidths={["4rem", "35rem", "14rem", "14rem", "5rem"]}
    />
  )
}

export default SettingsPage
