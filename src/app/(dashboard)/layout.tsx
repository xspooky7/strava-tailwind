import { AppSidebar } from "@/components/layout/app-sidebar"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList } from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { CrownIcon } from "lucide-react"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { cookies } from "next/headers"
import { Suspense } from "react"
import { TotalKomCount } from "@/components/total-kom-count"
import { unstable_cache } from "next/cache"
import { ConfettiMaker } from "@/components/confetti-maker"
import { verifySession } from "@/app/auth/actions/verify-session"
import { getKomCount } from "@/lib/get-kom-count"

const getSidebarState = async () => {
  const cookieStore = await cookies()
  const sidebarOpen = cookieStore.get("sidebar:state")?.value ?? "true"

  return sidebarOpen === "true"
}

const getCachedKomCount = unstable_cache(async (session) => getKomCount(session), ["count"], { revalidate: 60 })

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  const sidebarIsOpen = await getSidebarState()
  const session = await verifySession()
  const komCount = getCachedKomCount(session)

  return (
    <SidebarProvider defaultOpen={sidebarIsOpen}>
      <Suspense fallback={null}>
        <ConfettiMaker komCount={komCount} />
      </Suspense>
      <AppSidebar />
      <SidebarInset>
        <header className="flex px-4 h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 ">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">Strava App</BreadcrumbLink>
                </BreadcrumbItem>
                <Breadcrumbs />
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex space-x-2">
            <div className="flex mx-auto space-x-2 justify-evenly items-center px-2 py-1 rounded bg-secondary text-secondary-foreground font-medium">
              <CrownIcon height={17} width={17} />
              <Suspense fallback={<span>0</span>}>
                <TotalKomCount komCount={komCount} />
              </Suspense>
            </div>
            <ThemeToggle />
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}

export default DashboardLayout
