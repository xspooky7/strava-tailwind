"use client"

import * as React from "react"
import { BikeIcon, CrownIcon, LayoutDashboardIcon, Settings2, WindIcon } from "lucide-react"

import { NavMain } from "./nav-main"
import { NavUser } from "./nav-user"
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarHeader, SidebarRail } from "../ui/sidebar"
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
      isActive: true,
    },
    {
      title: "Koms",
      url: "/koms",
      icon: CrownIcon,
      items: [
        {
          title: "All",
          url: "/koms",
        },
        {
          title: "Delta",
          url: "/koms",
        },
      ],
    },
    {
      title: "Tailwind",
      url: "/tailwind",
      icon: WindIcon,
      items: [],
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
    <Sidebar collapsible="icon" {...props}>
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
