"use client"

import { NavUser } from "./nav-user"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail, useSidebar } from "../ui/sidebar"
import { Icons } from "@/components/icons"
import { NavGroup } from "./nav-group"
import { sidebarData } from "./sidebar-data"
import { Jost } from "next/font/google"
import { cn } from "@/lib/utils"

const jost = Jost({
  subsets: ["latin"], // Specify character subsets
})

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const sidebar = useSidebar()
  const isOpen = sidebar.open
  return (
    <Sidebar collapsible="icon" variant="sidebar" {...props}>
      <SidebarHeader className="flex flex-row justify-evenly items-center stroke-secondary fill-secondary">
        <Icons.logo />
        {isOpen && <h1 className={cn(jost.className, "text-primary font-bold text-3xl")}>Strava App</h1>}
      </SidebarHeader>
      <SidebarContent>
        {sidebarData.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarData.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
