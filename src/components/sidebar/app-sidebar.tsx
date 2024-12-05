"use client"

import * as React from "react"
import { BikeIcon, CrownIcon, LayoutDashboardIcon, Settings2, WindIcon } from "lucide-react"

import { NavMain } from "./nav-main"
import { NavUser } from "./nav-user"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "../ui/sidebar"
import { Icons } from "@/components/icons"

// This is sample data.
const data = {
  user: {
    name: "Sporty Angie",
    email: "nosey-angie@example.com",
    avatar: "https://dgalywyr863hv.cloudfront.net/pictures/athletes/21856708/12405558/1/large.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboardIcon,
    },
    {
      title: "Koms",
      url: "/koms",
      icon: CrownIcon,

      items: [
        {
          title: "Overview",
          url: "/koms",
        },
        {
          title: "Total",
          url: "/koms/total",
        },
        {
          title: "Delta",
          url: "/koms/delta",
        },
      ],
    },
    {
      title: "Tailwind",
      url: "/tailwind",
      icon: WindIcon,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar className="bg-card" collapsible="icon" {...props}>
      <SidebarHeader>
        <Icons.logo color="#FFF" />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
