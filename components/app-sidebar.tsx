"use client"

import * as React from "react"
import Image from "next/image"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Globe, Copy, List, Home } from "lucide-react"
import { useTab } from "@/contexts/tab-context"

const menuItems = [
  {
    title: "Tools",
    items: [
      {
        title: "Domain Listing",
        path: "/domain-listing",
        icon: Globe,
      },
      {
        title: "Easy Copy",
        path: "/easy-copy",
        icon: Copy,
      },
      {
        title: "List Format",
        path: "/list-format",
        icon: List,
      },
    ],
  },
]

export function AppSidebar() {
  const { addTab } = useTab()

  const handleMenuClick = (item: { title: string; path: string; icon: any }) => {
    addTab({
      title: item.title,
      path: item.path,
      icon: item.icon,
    })
  }

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="border-b p-4 group-data-[collapsible=icon]:p-2">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          {/* Logo saat expanded */}
          <div className="flex h-10 w-10 items-center justify-center rounded-lg overflow-hidden shadow-lg ring-2 ring-maroon-500/20 group-data-[collapsible=icon]:hidden transition-all duration-200">
            <Image 
              src="/sx-128.png" 
              alt="SX Tools Logo" 
              width={40} 
              height={40}
              className="object-contain"
              priority
            />
          </div>
          
          {/* Logo saat collapsed - hanya teks SX */}
          <div className="hidden group-data-[collapsible=icon]:flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-black to-maroon-800 shadow-lg ring-2 ring-maroon-500/30 transition-all duration-200">
            <span className="text-sm font-bold text-white">SX</span>
          </div>
          
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <h2 className="text-lg font-bold bg-gradient-to-r from-black to-maroon-700 bg-clip-text text-transparent">
              SX Tools
            </h2>
            <p className="text-xs text-muted-foreground">Your Productivity Suite</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-2">
        <SidebarGroup className="pt-2">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => addTab({ title: "Home", path: "/", icon: Home })}
                  tooltip="Home"
                  className="cursor-pointer hover:bg-gradient-to-r hover:from-gray-50 hover:to-maroon-50 dark:hover:from-gray-950 dark:hover:to-maroon-950 group-data-[collapsible=icon]:justify-center"
                >
                  <Home className="h-5 w-5" />
                  <span className="font-medium">Home</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {menuItems.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel className="px-2 text-xs font-semibold uppercase tracking-wider">
              {group.title}
            </SidebarGroupLabel>
            <SidebarSeparator className="group-data-[collapsible=icon]:block hidden" />
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      onClick={() => handleMenuClick(item)}
                      tooltip={item.title}
                      className="cursor-pointer hover:bg-gradient-to-r hover:from-gray-50 hover:to-maroon-50 dark:hover:from-gray-950 dark:hover:to-maroon-950 transition-all duration-200 group-data-[collapsible=icon]:justify-center"
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      
      <SidebarFooter className="border-t p-4 group-data-[collapsible=icon]:p-2">
        <div className="group-data-[collapsible=icon]:hidden">
          <p className="text-xs text-center text-muted-foreground">© 2025 SX Tools</p>
          <p className="text-xs text-center text-muted-foreground/60 mt-1">v1.0.0</p>
        </div>
        <div className="hidden group-data-[collapsible=icon]:flex items-center justify-center">
          <div className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-black to-maroon-600"></div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

