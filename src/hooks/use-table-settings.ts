"use client"

import { useLocalStorage } from "usehooks-ts"
import { DEFAULT_TABLE_SETTINGS, TableId, TableSettings } from "@/lib/table-settings"

// Custom hook to manage table settings with local storage
export function useTableSettings<T extends TableId>(tableId: T) {
  const storageKey = `table-settings-${tableId}`

  const [settings, setSettings, removeSettings] = useLocalStorage<TableSettings<T>>(
    storageKey,
    DEFAULT_TABLE_SETTINGS[tableId]
  )

  // Update specific parts of the settings
  const updateSettings = (updates: Partial<TableSettings<T>>) => {
    setSettings((current) => ({
      ...current,
      ...updates,
    }))
  }

  const updateVisibility = (columnId: keyof TableSettings<T>["visibility"], isVisible: boolean) => {
    setSettings((current) => ({
      ...current,
      visibility: {
        ...current.visibility,
        [columnId]: isVisible,
      },
    }))
  }

  const updateSort = (id: TableSettings<T>["sort"]["id"], desc: boolean) => {
    setSettings((current) => ({
      ...current,
      sort: {
        id,
        desc,
      },
    }))
  }

  const addFilter = (filter: TableSettings<T>["filters"][number]) => {
    setSettings((current) => ({
      ...current,
      filters: [...current.filters, filter],
    }))
  }

  const removeFilter = (index: number) => {
    setSettings((current) => ({
      ...current,
      filters: current.filters.filter((_, i) => i !== index),
    }))
  }

  const clearFilters = () => {
    setSettings((current) => ({
      ...current,
      filters: [],
    }))
  }

  const resetToDefaults = () => {
    setSettings(DEFAULT_TABLE_SETTINGS[tableId])
  }

  return {
    settings,
    updateSettings,
    updateVisibility,
    updateSort,
    addFilter,
    removeFilter,
    clearFilters,
    resetToDefaults,
    removeSettings,
  }
}
