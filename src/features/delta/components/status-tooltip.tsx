"use client"
import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface StatusTooltipProps {
  color: string
  icon: React.ElementType
  title: string
  description: string
}

export default function StatusTooltip({ color, icon: Icon, title, description }: StatusTooltipProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger className="h-full cursor-default" asChild>
        <div
          className={cn(color, "py-1 flex items-center")}
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          <Icon size="1.25em" className="mr-1" />
          <span>{title}</span>
        </div>
      </PopoverTrigger>
      <PopoverContent
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="w-auto p-2 bg-background border-border"
      >
        <div className={cn(color, "flex space-x-1")}>
          <h4 className="text-sm font-semibold">{title}</h4>
          <p className="text-primary text-sm">{description}</p>
        </div>
      </PopoverContent>
    </Popover>
  )
}
