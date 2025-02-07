/*import { DEFAULT_TABLE_SETTINGS } from "@/lib/constants"
import { ColumnId, TableId } from "@/lib/types/types"

import { useSessionStorage } from "usehooks-ts"

type TableVisibility = {
  [T in TableId]: {
    [C in ColumnId<T>]: boolean
  }
}

const DEFAULT_VISIBILITY: TableVisibility = Object.fromEntries(
  Object.entries(DEFAULT_TABLE_SETTINGS).map(([tableId, settings]) => [tableId, settings.visibility])
) as TableVisibility

export const useColumnVisibility = <T extends TableId>(tableId: T, columnId: ColumnId<T>) => {
  const [visibility, setVisibility] = useSessionStorage<TableVisibility>("visibility", DEFAULT_VISIBILITY)

  const setValue = (value: boolean) => {
    setVisibility((prev) => ({
      ...prev,
      [tableId]: {
        ...prev[tableId],
        [columnId]: value,
      },
    }))
  }

  return [visibility[tableId][columnId] ?? DEFAULT_TABLE_SETTINGS[tableId].visibility, setValue] as const
}
*/
