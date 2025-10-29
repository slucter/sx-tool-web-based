"use client"

import { useTab } from "@/contexts/tab-context"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect, useRef } from "react"

export function TabBar() {
  const { tabs, activeTabId, setActiveTab, removeTab } = useTab()
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Auto scroll to active tab when it changes
  useEffect(() => {
    if (scrollContainerRef.current && activeTabId) {
      const activeTabElement = scrollContainerRef.current.querySelector(
        `[data-tab-id="${activeTabId}"]`
      ) as HTMLElement
      
      if (activeTabElement) {
        activeTabElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        })
      }
    }
  }, [activeTabId])

  if (!tabs || tabs.length === 0) {
    return <div className="sticky top-14 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 h-[42px] shadow-sm" />
  }

  return (
    <div className="sticky top-14 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 overflow-hidden shadow-sm transition-shadow">
      <div 
        ref={scrollContainerRef}
        className="flex items-center gap-0.5 px-2 py-1.5 overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground/20 transition-colors"
        style={{
          scrollbarWidth: 'thin',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <div className="flex items-center gap-0.5 min-w-max">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId
            const Icon = tab.icon

            return (
              <div
                key={tab.id}
                data-tab-id={tab.id}
                className={cn(
                  "group relative flex items-center gap-2 px-4 py-2 rounded-t-lg transition-all min-w-[140px] max-w-[220px] flex-shrink-0",
                  isActive
                    ? "bg-background shadow-sm"
                    : "bg-transparent hover:bg-muted/50"
                )}
              >
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-black to-maroon-600 dark:from-white dark:to-maroon-400" />
                )}
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className="flex items-center gap-2 flex-1 min-w-0 text-left"
                >
                  {Icon && <Icon className="h-4 w-4 shrink-0" />}
                  <span className="text-sm font-medium truncate">
                    {tab.title}
                  </span>
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 md:transition-opacity hover:bg-muted md:opacity-0 opacity-100"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeTab(tab.id)
                  }}
                >
                  <X className="h-3.5 w-3.5" />
                  <span className="sr-only">Close tab</span>
                </Button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

