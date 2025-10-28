"use client"

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Globe, Copy, List } from "lucide-react"
import { useTab } from "@/contexts/tab-context"

export default function Home() {
  const { addTab } = useTab()

  const tools = [
    {
      title: "Domain Listing",
      description: "Extract and organize domains from your data lists",
      icon: Globe,
      path: "/domain-listing",
    },
    {
      title: "Easy Copy",
      description: "Quick copy utilities for your workflow",
      icon: Copy,
      path: "/easy-copy",
    },
    {
      title: "List Format",
      description: "Format and transform lists easily",
      icon: List,
      path: "/list-format",
    },
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Welcome to SX Tools</h1>
        <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
          Your productivity suite for data processing and management
        </p>
      </div>

      <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <Card 
            key={tool.title} 
            className="hover:bg-accent transition-colors cursor-pointer h-full"
            onClick={() => addTab({ title: tool.title, path: tool.path, icon: tool.icon })}
          >
            <CardHeader className="p-4 sm:p-6">
              <tool.icon className="h-7 w-7 sm:h-8 sm:w-8 mb-2" />
              <CardTitle className="text-base sm:text-lg">{tool.title}</CardTitle>
              <CardDescription className="text-sm">{tool.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}
