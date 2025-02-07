import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ArrowUpIcon, CrownIcon, InfoIcon, PlusCircleIcon } from "lucide-react"

function ProgressBox() {
  return (
    <Card className="col-span-6 lg:col-span-3 p-5">
      <div className="flex text-muted-foreground justify-between items-center mb-4">
        <PlusCircleIcon strokeWidth={1} size={18} />

        <h6 className="ml-1 text-sm font-light">GAINED ACTIVE</h6>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className=" ml-auto">
              <InfoIcon size={18} strokeWidth={2} />
            </TooltipTrigger>
            <TooltipContent>
              <p>Tooltip</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="flex items-center mb-2">
        <CrownIcon className="text-primary mr-1" size={20} />
        <span className="text-primary font-semibold text-2xl">25</span>
      </div>
      <div className="flex items-center tracking-tight text-success">
        <ArrowUpIcon size={16} />
        <span className="ml-0.5">6%</span>
        <span className="ml-1 text-muted-foreground text-sm">vs last 30 days</span>
      </div>
    </Card>
  )
}

export function ProgressBoxes() {
  return (
    <>
      <Card className="col-span-6 lg:col-span-3 p-5 bg-accent border-primary">
        <div className="flex text-primary justify-between items-center mb-4">
          <CrownIcon strokeWidth={1} size={18} />

          <h6 className="ml-1 text-sm font-light">TOTAL KOMS</h6>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="text-muted-foreground ml-auto">
                <InfoIcon size={18} strokeWidth={2} />
              </TooltipTrigger>
              <TooltipContent>
                <p>Tooltip</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex text-primary items-center mb-2">
          <CrownIcon className=" mr-1" size={20} />
          <span className="font-semibold text-2xl">4022</span>
        </div>
        <div className="flex items-center tracking-tight text-success">
          <ArrowUpIcon size={16} />
          <span className="ml-0.5">+0.5</span>
          <span className="ml-1 text-muted-foreground text-sm">weekly Avg. 2025</span>
        </div>
      </Card>
      <ProgressBox />
      <ProgressBox />
      <ProgressBox />
    </>
  )
}
