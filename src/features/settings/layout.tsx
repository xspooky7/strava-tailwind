import { Separator } from "@/components/ui/separator"
import SidebarNav from "./components/sidebar-nav"
import { MailIcon, PaletteIcon, SquareMousePointerIcon, UserIcon, WrenchIcon } from "lucide-react"

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="px-4 py-6">
      <div className="space-y-0.5">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and set e-mail preferences.</p>
      </div>
      <Separator className="my-4 lg:my-6" />
      <div className="flex flex-1 flex-col space-y-2 md:space-y-2 overflow-hidden lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="top-0 lg:sticky lg:w-1/5">
          <SidebarNav items={settingNav} />
        </aside>
        <div className="flex w-full p-1 pr-4 overflow-y-hidden">{children}</div>
      </div>
    </main>
  )
}

const settingNav = [
  {
    title: "Profile",
    icon: <UserIcon size={18} />,
    href: "/settings",
  },
  {
    title: "Account",
    icon: <WrenchIcon size={18} />,
    href: "/settings/account",
  },
  {
    title: "Appearance",
    icon: <PaletteIcon size={18} />,
    href: "/settings/appearance",
  },
  {
    title: "Notifications",
    icon: <MailIcon size={18} />,
    href: "/settings/notifications",
  },
  {
    title: "Display",
    icon: <SquareMousePointerIcon size={18} />,
    href: "/settings/display",
  },
]
