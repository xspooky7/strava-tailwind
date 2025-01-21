import { cn } from "@/lib/utils"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronLeftIcon, ChevronRightIcon, LoaderIcon, RefreshCwIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DoubleArrowLeftIcon, DoubleArrowRightIcon, PlusCircledIcon } from "@radix-ui/react-icons"
import { Select, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DataTableSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The number of columns in the table.
   * @type number
   */
  columnCount: number

  /**
   * The number of rows in the table.
   * @default 10
   * @type number | undefined
   */
  rowCount?: number

  /**
   * The number of searchable columns in the table.
   * @default 0
   * @type number | undefined
   */
  searchableColumnCount?: number

  /**
   * The number of filterable columns in the table.
   * @default 0
   * @type number | undefined
   */
  filterableColumnCount?: number

  /**
   * Flag to show the table view options.
   * @default undefined
   * @type boolean | undefined
   */
  showViewOptions?: boolean

  /**
   * The width of each cell in the table.
   * The length of the array should be equal to the columnCount.
   * Any valid CSS width value is accepted.
   * @default ["auto"]
   * @type string[] | undefined
   */
  cellWidths?: string[]

  /**
   * Flag to show the pagination bar.
   * @default true
   * @type boolean | undefined
   */
  withPagination?: boolean

  /**
   * Flag to prevent the table cells from shrinking.
   * @default false
   * @type boolean | undefined
   */
  shrinkZero?: boolean
}

export function CustomTableSkeleton(props: DataTableSkeletonProps) {
  const spinner = (
    <div className="rounded-md border bg-card w-fill h-[400px] flex justify-center items-center">
      <LoaderIcon className="size-6 animate-spin text-muted-foreground" />
    </div>
  )
  const skeleton = (
    <DataTableSkeleton
      withPagination={false}
      showViewOptions={false}
      columnCount={4}
      cellWidths={["4rem", "40rem", "14rem", "5rem"]}
    />
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-1 items-center space-x-2">
        <Input placeholder="Filter segments..." disabled className="h-8 w-[150px] lg:w-[250px]" />
        <Button disabled className="h-8 w-8" variant="outline" size="icon">
          <RefreshCwIcon className="h-4 w-4" />
        </Button>

        <Button disabled variant="outline" size="sm" className="h-8 border-dashed">
          <PlusCircledIcon className="mr-2 h-4 w-4" />
          Label
        </Button>
      </div>

      {skeleton}

      <div className="flex items-center justify-between px-2">
        <div className="flex-1 text-sm text-muted-foreground">0 of 0 row(s) selected.</div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2 text-muted-foreground">
            <p className="text-sm font-medium">Rows per page</p>
            <Select value={"10"} disabled>
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={20} />
              </SelectTrigger>
            </Select>
          </div>
          <div className="flex w-[100px] items-center justify-center text-sm text-muted-foreground font-medium">
            Page 0 of 0
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" className="hidden h-8 w-8 p-0 lg:flex" disabled>
              <DoubleArrowLeftIcon className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="h-8 w-8 p-0" disabled>
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="h-8 w-8 p-0" disabled>
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="hidden h-8 w-8 p-0 lg:flex" disabled>
              <DoubleArrowRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function DataTableSkeleton(props: DataTableSkeletonProps) {
  const {
    columnCount,
    rowCount = 10,
    searchableColumnCount = 0,
    filterableColumnCount = 0,
    showViewOptions = true,
    cellWidths = ["auto"],
    withPagination = true,
    shrinkZero = false,
    className,
    ...skeletonProps
  } = props

  return (
    <div className={cn("w-full overflow-auto", className)} {...skeletonProps}>
      {showViewOptions && (
        <div className="flex w-full items-center justify-between space-x-2 overflow-auto p-1">
          <div className="flex flex-1 items-center space-x-2">
            {searchableColumnCount > 0
              ? Array.from({ length: searchableColumnCount }).map((_, i) => (
                  <Skeleton key={i} className="h-7 w-40 lg:w-60" />
                ))
              : null}
            {filterableColumnCount > 0
              ? Array.from({ length: filterableColumnCount }).map((_, i) => (
                  <Skeleton key={i} className="h-7 w-[4.5rem] border-dashed" />
                ))
              : null}
          </div>
          {showViewOptions ? <Skeleton className="ml-auto hidden h-7 w-[4.5rem] lg:flex" /> : null}
        </div>
      )}
      <div className="rounded-md border background bg-card">
        <Table>
          <TableHeader>
            {Array.from({ length: 1 }).map((_, i) => (
              <TableRow key={i} className="hover:bg-transparent">
                {Array.from({ length: columnCount }).map((_, j) => (
                  <TableHead
                    key={j}
                    style={{
                      width: cellWidths[j],
                      minWidth: shrinkZero ? cellWidths[j] : "auto",
                    }}
                  >
                    <Skeleton className="h-6 w-full" />
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {Array.from({ length: rowCount }).map((_, i) => (
              <TableRow key={i} className="hover:bg-transparent">
                {Array.from({ length: columnCount }).map((_, j) => (
                  <TableCell
                    key={j}
                    style={{
                      width: cellWidths[j],
                      minWidth: shrinkZero ? cellWidths[j] : "auto",
                    }}
                  >
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {withPagination ? (
        <div className="flex w-full items-center justify-between gap-4 overflow-auto p-1 sm:gap-8">
          <Skeleton className="h-7 w-40 shrink-0" />
          <div className="flex items-center gap-4 sm:gap-6 lg:gap-8">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-7 w-24" />
              <Skeleton className="h-7 w-[4.5rem]" />
            </div>
            <div className="flex items-center justify-center text-sm font-medium">
              <Skeleton className="h-7 w-20" />
            </div>
            <div className="flex items-center space-x-2">
              <Skeleton className="hidden size-7 lg:block" />
              <Skeleton className="size-7" />
              <Skeleton className="size-7" />
              <Skeleton className="hidden size-7 lg:block" />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
