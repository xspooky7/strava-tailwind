"use client"
import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "../../../components/ui/badge"

interface LabelsTooltipProps {
  labels: string[]
}

export default function LabelsTooltip({ labels }: LabelsTooltipProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger className="h-full cursor-default" asChild>
        <Badge
          variant="outline"
          className="xl:hidden text-secondary flex items-center justify-center leading-none font-medium border border-primary dark:border-secondary"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          {labels.length}
        </Badge>
      </PopoverTrigger>
      <PopoverContent
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="w-auto p-2 bg-background border-border text-sm text-primary font-medium"
      >
        {labels.join(", ")}
      </PopoverContent>
    </Popover>
  )
}
