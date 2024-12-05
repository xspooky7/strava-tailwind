"use client"

import { BreadcrumbItem, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { usePathname } from "next/navigation"
import { Fragment } from "react"

export function Breadcrumbs() {
  const paths = usePathname()
  const pathNames = paths.split("/").filter((path) => path)
  const breadcrumbs = pathNames.map((path) => {
    return (
      <Fragment key={path}>
        <BreadcrumbSeparator className="hidden md:block" />
        <BreadcrumbItem>
          <BreadcrumbPage>{path.charAt(0).toUpperCase() + path.slice(1)}</BreadcrumbPage>
        </BreadcrumbItem>
      </Fragment>
    )
  })
  return breadcrumbs
}
