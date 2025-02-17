"use client"

import { Icons } from "@/components/icons"
import { ContactSection } from "@/features/hero/contact-section"
import { HeroSection } from "@/features/hero/hero-section"
import { LoginDrawer } from "@/features/hero/login-drawer"

export default function LandingPage() {
  return (
    <>
      <div className="flex w-full justify-end">
        <LoginDrawer />
      </div>
      <HeroSection
        badge={{
          text: "Introducing our new components",
          action: {
            text: "Learn more",
            href: "/docs",
          },
        }}
        title="Advanced Insights for Strava KOMs"
        description="Track your lost and gained KOMs, analyze competition, and leverage real-time wind data to optimize your efforts and maintain your top spots."
        actions={[
          {
            text: "Get Access",
            href: "mailto:c.eissler@me.com",
            variant: "default",
          },
          {
            text: "GitHub",
            href: "https://github.com/xspooky7/strava-tailwind/",
            variant: "ghost",
            icon: <Icons.gitHub className="h-5 w-5" />,
          },
        ]}
        image={{
          light: "/images/hero-preview.png",
          dark: "/images/hero-preview.png",
          alt: "UI Components Preview",
        }}
      />
      <ContactSection />
    </>
  )
}
