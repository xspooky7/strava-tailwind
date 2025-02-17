"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRightIcon } from "lucide-react"
import Image from "next/image"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { Mockup, MockupFrame } from "./components/mockup"
import { Glow } from "./components/glow"
import { Icons } from "@/components/icons"

interface HeroAction {
  text: string
  href: string
  icon?: React.ReactNode
  variant?: "default" | "ghost"
}

interface HeroProps {
  badge?: {
    text: string
    action: {
      text: string
      href: string
    }
  }
  title: string
  description: string
  actions: HeroAction[]
  image: {
    light: string
    dark: string
    alt: string
  }
}

export function HeroSection() {
  const { resolvedTheme } = useTheme()

  const badge = {
    text: "Introducing our new components",
    action: {
      text: "Learn more",
      href: "/docs",
    },
  }
  const title = "Advanced Insights for Strava KOMs"
  const description =
    "Track your lost and gained KOMs, analyze competition, and leverage real-time wind data to optimize your efforts and maintain your top spots."

  const githubUrl = "https://github.com/xspooky7/strava-tailwind/"

  const image = {
    light: "/images/hero-preview.png",
    dark: "/images/hero-preview.png",
    alt: "UI Components Preview",
  }
  const imageSrc = resolvedTheme === "light" ? image.light : image.dark
  return (
    <section className={cn("bg-background text-foreground", "p-4", "fade-bottom overflow-hidden pb-0")}>
      <div className="mx-auto flex max-w-container flex-col gap-12 pt-16 sm:gap-24">
        <div className="flex flex-col items-center gap-6 text-center sm:gap-12">
          {/* Badge
          {badge && (
            <Badge variant="outline" className="animate-appear gap-2">
              <span className="text-muted-foreground">{badge.text}</span>
              <a href={badge.action.href} className="flex items-center gap-1">
                {badge.action.text}
                <ArrowRightIcon className="h-3 w-3" />
              </a>
            </Badge>
          )} */}

          <h1 className="lg:mx-20 relative z-10 inline-block animate-appear bg-gradient-to-r from-primary to-muted-foreground bg-clip-text text-4xl font-semibold leading-tight text-transparent drop-shadow-2xl sm:text-6xl sm:leading-tight md:text-8xl md:leading-tight">
            {title}
          </h1>

          <p className="text-md relative z-10 max-w-[550px] animate-appear font-medium text-muted-foreground opacity-0 delay-100 sm:text-xl">
            {description}
          </p>

          <div className="relative z-10 flex animate-appear justify-center gap-4 opacity-0 delay-300">
            <div className="relative z-10 flex animate-appear justify-center gap-4 opacity-0 delay-300">
              <Button size="lg" asChild>
                <a href="#contact" className="flex items-center">
                  Get Access
                </a>
              </Button>
              <Button variant="ghost" size="lg" asChild>
                <a href={githubUrl} className="flex items-center gap-2">
                  <Icons.gitHub className="h-5 w-5" />
                  GitHub
                </a>
              </Button>
            </div>
          </div>

          <div className="relative pt-12">
            <MockupFrame className="animate-appear opacity-0 delay-700" size="small">
              <Mockup type="responsive">
                <Image src={imageSrc} alt={image.alt} width={1248} height={765} priority />
              </Mockup>
            </MockupFrame>
            <Glow variant="top" className="animate-appear-zoom opacity-0 delay-1000" />
          </div>
        </div>
      </div>
    </section>
  )
}
