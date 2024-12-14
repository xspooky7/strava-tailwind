import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList } from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { CrownIcon } from "lucide-react"
import { Breadcrumbs } from "../../../components/breadcrumbs"
import { cookies } from "next/headers"
import { getCachedKomCount } from "@/data-access/segments"
import { checkAuth } from "@/auth/actions"

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn, pbAuth } = await checkAuth()
  const timeSeriesPromise = await getCachedKomCount(isLoggedIn, pbAuth!)
  const cookieStore = await cookies()
  const sidebarOpen = cookieStore.get("sidebar:state")?.value ?? "true"

  return (
    <SidebarProvider defaultOpen={sidebarOpen === "true"}>
      <AppSidebar />
      <SidebarInset>
        <header className="flex px-4 h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 ">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">Strava Tools</BreadcrumbLink>
                </BreadcrumbItem>
                <Breadcrumbs />
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex space-x-2">
            <div className="flex mx-auto space-x-2 justify-evenly items-center px-2 py-1 rounded bg-secondary text-secondary-foreground font-medium">
              <CrownIcon height={17} width={17} />
              <span>{timeSeriesPromise.amount}</span>
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
