import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { TotalKomCount } from "@/components/total-kom-count"
import { CrownIcon } from "lucide-react"
import { Suspense } from "react"
import { getKomCount } from "@/lib/get-kom-count"

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  const timeseriesRecordPromise = getKomCount("")
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex px-4 h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 ">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">App Name</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Dashboard</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex space-x-2">
            <div className="flex mx-auto space-x-2 justify-evenly items-center px-2 py-1 rounded bg-secondary text-secondary-foreground font-medium">
              <CrownIcon height={17} width={17} />
              <Suspense fallback={<span>0</span>}>
                <TotalKomCount timeSeriesPromise={timeseriesRecordPromise} />
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
