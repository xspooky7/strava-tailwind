"use client"

import { useState, useEffect, useMemo } from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import { Check, Loader, AlertCircle } from "lucide-react"
import { TailwindTableSegment } from "@/lib/types/types"
import { DataTable } from "../_components/table"
import { TableFilterField } from "../_lib/types"
import { TableToolbar } from "../_components/table-toolbar"
import { createBaseColumns } from "../_lib/shared-columns"
import { tailwindTableColumns } from "./columns"
import { Process, StatusState } from "./types"

export default function TailwindTable() {
  const [status, setStatus] = useState<StatusState>({ step: "fetch" })
  const [segments, setSegments] = useState<TailwindTableSegment[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(0)
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    name: true,
    city: true,
    terrain: false,
    labels: false,
    tailwind: true,
    actions: true,
  })
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([])

  // Define the process steps
  const processes: Process[] = [
    {
      id: "fetch",
      name: "Fetching Starred Segments",
      description: "Retrieving a list of starred Strava segments",
    },
    {
      id: "process",
      name: "Processing Segments",
      description: "Retrieving detailed data for cached & newly fetched segments",
    },
    {
      id: "update",
      name: "Updating Cache",
      description: "Updating database cache with newly added segments",
    },

    {
      id: "weather",
      name: "Calculating Tailwind",
      description: "Calculating tailwind percentages and metrics",
    },
  ]

  // Memoize the columns so they don't re-render on every render
  const columns: ColumnDef<TailwindTableSegment>[] = useMemo(() => {
    const baseColumns = createBaseColumns<TailwindTableSegment>()
    return [...baseColumns, ...tailwindTableColumns]
  }, [])

  const filterFields: TableFilterField<TailwindTableSegment>[] = [
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

  useEffect(() => {
    // Map status step to process index
    if (status.step === "fetch") setCurrentStep(0)
    else if (status.step === "process") setCurrentStep(1)
    else if (status.step === "update") setCurrentStep(2)
    else if (status.step === "weather") setCurrentStep(3)
    else if (status.step === "complete") setCurrentStep(4)
  }, [status.step])

  useEffect(() => {
    // Set up SSE connection
    const eventSource = new EventSource("/api/tailwind")

    // Listen for status updates
    eventSource.addEventListener("status", (event) => {
      const data = JSON.parse((event as MessageEvent).data) as StatusState
      setStatus(data)

      // If processing is complete, update segments and stop loading
      if (data.step === "complete" && data.data?.segments) {
        setSegments(data.data.segments)
        setLoading(false)
        eventSource.close()
      }
    })

    // Listen for errors
    eventSource.addEventListener("error", (event) => {
      try {
        const data = JSON.parse((event as MessageEvent).data)
        setError("An error occurred")
      } catch (e) {
        setError("An error occurred")
      }
      setLoading(false)
      eventSource.close()
    })

    // Handle connection errors
    eventSource.onerror = () => {
      setError("Connection error")
      setLoading(false)
      eventSource.close()
    }

    // Clean up on unmount
    return () => {
      eventSource.close()
    }
  }, [])

  const table = useReactTable({
    data: segments,
    columns,
    initialState: {
      columnOrder: Object.keys(columnVisibility),
      pagination: {
        pageSize: 30,
      },
      sorting: [{ id: "tailwind", desc: true }],
    },
    state: { columnVisibility, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <>
      {error && (
        <div className="w-full p-4 mb-4 bg-red-50 border border-red-300 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-800">{error || "An error occurred"}</p>
          </div>
        </div>
      )}

      {loading && (
        <div className="mx-auto w-full max-w-2xl py-4 px-4 md:px-6 space-y-4">
          {processes.map((process, index) => {
            const isComplete = currentStep > index
            const isActive = currentStep === index
            return (
              <div
                key={process.id}
                className={`p-4 border rounded-lg transition-all ${
                  isComplete
                    ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                    : isActive
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                    : "border-gray-200 dark:border-gray-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      isComplete ? "bg-green-500" : isActive ? "bg-blue-500" : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  >
                    {isComplete ? (
                      <Check className="h-5 w-5 text-white" />
                    ) : isActive ? (
                      <Loader className="h-5 w-5 text-white animate-spin" />
                    ) : (
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{index + 1}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">{process.name}</h3>
                    <p className="text-sm text-muted-foreground">{process.description}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {!loading && !error && segments.length > 0 && (
        <DataTable table={table}>
          <TableToolbar table={table} filterFields={filterFields} />
        </DataTable>
      )}

      {!loading && !error && segments.length === 0 && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 w-full">
          <p className="font-bold">No segments found</p>
          <p>Try starring some segments on Strava and check back here.</p>
        </div>
      )}
    </>
  )
}
