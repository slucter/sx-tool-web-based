"use client"

import { ReactNode } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { TabProvider } from "@/contexts/tab-context"
import { TabBar } from "@/components/tab-bar"
import { TabContent } from "@/components/tab-content"

export function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <TabProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <div className="flex flex-1 flex-col min-w-0 h-screen overflow-hidden">
            <Navbar />
            <TabBar />
            <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-y-auto overflow-x-hidden">
              <TabContent />
            </main>
            <Footer />
          </div>
        </div>
      </SidebarProvider>
    </TabProvider>
  )
}

