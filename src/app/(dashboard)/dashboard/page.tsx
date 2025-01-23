import { Separator } from "@/components/ui/separator"
import { StatusChart } from "@/features/charts/status-chart"

const DashboradPage = async () => {
  return (
    <div className="h-full w-full px-5">
      <h1 className="text-2xl font-bold">Welcome Back, Sport Angie</h1>
      <p className="text-sm text-muted-foreground">Let's see what changed since your last visit</p>
      <Separator className="my-4 flex-none" />
    </div>
  )
}

export default DashboradPage
