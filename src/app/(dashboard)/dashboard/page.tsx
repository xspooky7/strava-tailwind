import { CustomTableSkeleton } from "@/components/table/table-skeleton"

const DashboradPage = async () => {
  return (
    <>
      <div className="flex space-between">
        <h3>Welcome back (user)!</h3>
      </div>
    </>
  )
  return (
    <div className="grid items-center gap-8 py-5 px-2 lg:px-4">
      <CustomTableSkeleton
        columnCount={5}
        searchableColumnCount={1}
        filterableColumnCount={2}
        cellWidths={["10rem", "40rem", "12rem", "12rem", "8rem"]}
        shrinkZero
      />
    </div>
  )
}

export default DashboradPage
