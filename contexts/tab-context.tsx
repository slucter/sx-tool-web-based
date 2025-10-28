"use client"

import React, { createContext, useContext, useState, ReactNode } from "react"

export interface Tab {
  id: string
  title: string
  path: string
  icon?: React.ComponentType<{ className?: string }>
}

interface TabContextType {
  tabs: Tab[]
  activeTabId: string | null
  addTab: (tab: Omit<Tab, "id">) => void
  removeTab: (tabId: string) => void
  setActiveTab: (tabId: string) => void
  getTabById: (tabId: string) => Tab | undefined
}

const TabContext = createContext<TabContextType | undefined>(undefined)

export function TabProvider({ children }: { children: ReactNode }) {
  const [tabs, setTabs] = useState<Tab[]>([])
  const [activeTabId, setActiveTabId] = useState<string | null>(null)

  React.useEffect(() => {
    // Initialize with Home tab after component mounts (client-side only)
    if (tabs.length === 0) {
      const homeTab: Tab = {
        id: `tab-home-${Date.now()}`,
        title: "Home",
        path: "/",
      }
      setTabs([homeTab])
      setActiveTabId(homeTab.id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const addTab = (tab: Omit<Tab, "id">) => {
    // Check if tab with same path already exists
    const existingTab = tabs.find((t) => t.path === tab.path)
    
    if (existingTab) {
      // If tab exists, just activate it
      setActiveTabId(existingTab.id)
    } else {
      // Create new tab with unique ID
      const newTab: Tab = {
        ...tab,
        id: `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      }
      setTabs((prev) => [...prev, newTab])
      setActiveTabId(newTab.id)
    }
  }

  const removeTab = (tabId: string) => {
    setTabs((prev) => {
      const newTabs = prev.filter((t) => t.id !== tabId)
      
      // If removing active tab, activate another tab
      if (activeTabId === tabId && newTabs.length > 0) {
        const removedIndex = prev.findIndex((t) => t.id === tabId)
        const newActiveIndex = removedIndex > 0 ? removedIndex - 1 : 0
        setActiveTabId(newTabs[newActiveIndex]?.id || null)
      } else if (newTabs.length === 0) {
        setActiveTabId(null)
      }
      
      return newTabs
    })
  }

  const setActiveTab = (tabId: string) => {
    if (tabs.find((t) => t.id === tabId)) {
      setActiveTabId(tabId)
    }
  }

  const getTabById = (tabId: string) => {
    return tabs.find((t) => t.id === tabId)
  }

  return (
    <TabContext.Provider
      value={{
        tabs,
        activeTabId,
        addTab,
        removeTab,
        setActiveTab,
        getTabById,
      }}
    >
      {children}
    </TabContext.Provider>
  )
}

export function useTab() {
  const context = useContext(TabContext)
  if (context === undefined) {
    throw new Error("useTab must be used within a TabProvider")
  }
  return context
}

