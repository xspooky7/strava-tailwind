"use client"

import { TrendingUp } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { use } from "react"

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export function TotalKomChart({
  chartDataPromise,
}: {
  chartDataPromise: Promise<{ date: string; desktop: number }[]>
}) {
  const chartData = use(chartDataPromise)
  console.log(chartData)
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] max-h-[400px] w-full">
      <AreaChart margin={{ left: -20 }} accessibilityLayer data={chartData} height={200}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="date" tickMargin={5} tickLine={false} axisLine={false} tickFormatter={formatDateAxis} />
        <YAxis
          type="number"
          tickFormatter={(value) => value.toLocaleString()}
          domain={["dataMin - 100", "dataMax + 100"]}
          tickCount={7}
        />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <defs>
          <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-desktop)" stopOpacity={0.8} />
            <stop offset="95%" stopColor="var(--color-desktop)" stopOpacity={0.1} />
          </linearGradient>
        </defs>

        <Area
          dataKey="desktop"
          type="natural"
          fill="url(#fillDesktop)"
          fillOpacity={0.4}
          stroke="var(--color-desktop)"
        />
      </AreaChart>
    </ChartContainer>
  )
}

function formatDateAxis(tickItem: string) {
  const dateSplit = new Date(tickItem).toDateString().slice(4).split(" ")
  return dateSplit[0] + " " + dateSplit[2].slice(2)
}
