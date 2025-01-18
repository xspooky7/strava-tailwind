import {
  ArrowRightLeftIcon,
  ChartLineIcon,
  CrownIcon,
  LayoutDashboardIcon,
  ListIcon,
  MailIcon,
  PaletteIcon,
  Settings2Icon,
  SquareMousePointerIcon,
  UserIcon,
  WindIcon,
  WrenchIcon,
} from "lucide-react"
import { SidebarData } from "./types"

export const sidebarData: SidebarData = {
  user: {
    name: "Sporty Angie",
    email: "nosey-angie@example.com",
    avatar: "https://dgalywyr863hv.cloudfront.net/pictures/athletes/21856708/12405558/1/large.jpg",
  },
  navGroups: [
    {
      title: "General",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: LayoutDashboardIcon,
        },
        {
          title: "Koms",
          icon: CrownIcon,
          items: [
            {
              title: "Overview",
              icon: ChartLineIcon,
              url: "/koms",
            },
            {
              title: "Delta",
              url: "/koms/delta",
              icon: ArrowRightLeftIcon,
            },
            {
              title: "Total",
              url: "/koms/total",
              icon: ListIcon,
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
          icon: Settings2Icon,
          items: [
            {
              title: "Profile",
              icon: UserIcon,
              url: "/settings",
            },
            {
              title: "Account",
              icon: WrenchIcon,
              url: "/settings/account",
            },
            {
              title: "Appearance",
              icon: PaletteIcon,
              url: "/settings/appearance",
            },
            {
              title: "Notifications",
              icon: MailIcon,
              url: "/settings/notifications",
            },
            {
              title: "Display",
              icon: SquareMousePointerIcon,
              url: "/settings/display",
            },
          ],
        },
      ],
    },
  ],
}
