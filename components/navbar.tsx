"use client"

import { ThemeToggle } from "@/components/theme-toggle"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex-shrink-0">
      <div className="flex h-14 items-center px-4 gap-4 min-w-0">
        <SidebarTrigger className="cursor-pointer hover:bg-gradient-to-r hover:from-gray-50 hover:to-maroon-50 dark:hover:from-gray-950 dark:hover:to-maroon-950 transition-all duration-200 flex-shrink-0" />
        <div className="flex flex-1 items-center justify-between min-w-0 gap-4">
          <h1 className="text-lg font-semibold bg-gradient-to-r from-black to-maroon-700 dark:from-white dark:to-maroon-200 bg-clip-text text-transparent truncate">
            SX Tools Dashboard
          </h1>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}

