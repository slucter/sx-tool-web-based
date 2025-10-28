"use client"

import { useTab } from "@/contexts/tab-context"
import { Suspense, lazy } from "react"

// Lazy load pages to preserve their state when switching tabs
const DomainListingPage = lazy(() => import("@/app/domain-listing/page"))
const EasyCopyPage = lazy(() => import("@/app/easy-copy/page"))
const ListFormatPage = lazy(() => import("@/app/list-format/page"))
const HomePage = lazy(() => import("@/app/page"))

const pageComponents: Record<string, React.LazyExoticComponent<any>> = {
  "/": HomePage,
  "/domain-listing": DomainListingPage,
  "/easy-copy": EasyCopyPage,
  "/list-format": ListFormatPage,
}

export function TabContent() {
  const { tabs, activeTabId } = useTab()

  if (!tabs || tabs.length === 0) {
    return <div className="flex items-center justify-center h-full text-muted-foreground">Loading...</div>
  }

  return (
    <div className="relative h-full">
      {tabs.map((tab) => {
        const PageComponent = pageComponents[tab.path] || HomePage
        const isActive = tab.id === activeTabId

        return (
          <div
            key={tab.id}
            className={isActive ? "block" : "hidden"}
            style={{ height: "100%" }}
          >
            <Suspense fallback={<div className="flex items-center justify-center p-6">Loading...</div>}>
              <PageComponent />
            </Suspense>
          </div>
        )
      })}
    </div>
  )
}

