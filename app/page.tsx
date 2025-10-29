"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Globe, Copy, List, MessageCircle, Wrench } from "lucide-react"
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
    <div className="space-y-6 sm:space-y-8 max-w-5xl">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-black to-maroon-700 dark:from-white dark:to-maroon-200 bg-clip-text text-transparent">
            SX Tools
          </h1>
          <Badge variant="outline" className="text-xs border-maroon-500/50 text-maroon-700 dark:text-maroon-200">
            In Development
          </Badge>
        </div>
        <p className="text-muted-foreground text-sm sm:text-base">
          Web-based toolkit for security research and data intelligence
        </p>
      </div>

      {/* Status Info Card */}
      <Card className="border-l-4 border-l-maroon-600 dark:border-l-maroon-400">
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-base sm:text-lg mb-2">Development Status</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                This web tool is currently in active development. We're continuously improving existing features 
                and building new tools to enhance your workflow.
              </p>
            </div>
            
            <div className="pt-4 border-t">
              <h4 className="font-medium text-sm mb-3">Have suggestions or tool requests?</h4>
              <Button 
                variant="outline" 
                size="sm"
                className="group"
                onClick={() => window.open('https://t.me/xlcert', '_blank')}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Contact via Telegram
                <span className="ml-2 text-muted-foreground group-hover:text-foreground transition-colors">@xlcert</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Update Info */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-2">
            <Wrench className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Next Special Update</CardTitle>
          </div>
          <CardDescription className="text-sm leading-relaxed">
            Upcoming features we're working on
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="h-1.5 w-1.5 rounded-full bg-maroon-600 dark:bg-maroon-400 mt-2 shrink-0" />
              <div>
                <p className="font-medium text-sm">ULP Search Feature</p>
                <p className="text-sm text-muted-foreground">Helper tools for data intelligence research</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="h-1.5 w-1.5 rounded-full bg-maroon-600 dark:bg-maroon-400 mt-2 shrink-0" />
              <div>
                <p className="font-medium text-sm">Additional Security Research Tools</p>
                <p className="text-sm text-muted-foreground">Simple yet powerful utilities for security researchers</p>
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Available Tools */}
      <div>
        <h2 className="text-lg sm:text-xl font-semibold mb-4">Available Tools</h2>
        <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
          {tools.map((tool) => (
            <Card 
              key={tool.title} 
              className="hover:border-maroon-500/50 hover:shadow-sm transition-all cursor-pointer group"
              onClick={() => addTab({ title: tool.title, path: tool.path, icon: tool.icon })}
            >
              <CardHeader className="p-4 sm:p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-muted group-hover:bg-maroon-50 dark:group-hover:bg-maroon-950/30 transition-colors">
                    <tool.icon className="h-5 w-5 text-muted-foreground group-hover:text-maroon-600 dark:group-hover:text-maroon-400 transition-colors" />
                  </div>
                  <CardTitle className="text-sm sm:text-base">{tool.title}</CardTitle>
                </div>
                <CardDescription className="text-xs sm:text-sm">{tool.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
