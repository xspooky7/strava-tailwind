import { GainLossChart } from "@/features/dashboard/components/gain-loss-chart"
import { ProgressBoxes } from "@/features/dashboard/components/progress-boxes"

const DashboradPage = async () => {
  return (
    <div className="grid px-5 w-full grid-cols-12 gap-2 lg:gap-3 xl:gap-5 grid-rows-none">
      <ProgressBoxes />
      <GainLossChart />
    </div>
  )
}

export default DashboradPage
