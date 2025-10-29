"use client"

import { useState, useRef, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Copy, Trash2, Upload, Globe, ArrowUpDown, FolderTree } from "lucide-react"
import { toast } from "sonner"
import { parseULPLines } from "@/lib/ulp-parser"

interface DomainGroup {
  domain: string
  urls: string[]
  count: number
  connectionStatus?: 'idle' | 'checking' | 'success' | 'error'
  statusCode?: number
  statusMessage?: string
}

type SortOption = 'domain-asc' | 'domain-desc' | 'count-desc' | 'count-asc'

export default function DomainListingPage() {
  const [inputText, setInputText] = useState("")
  const [domainGroups, setDomainGroups] = useState<DomainGroup[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [sortOption, setSortOption] = useState<SortOption>('domain-asc')
  const [selectedDomainForPaths, setSelectedDomainForPaths] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const extractDomain = (line: string): string | null => {
    try {
      // Remove @ at the start if present
      let url = line.trim().replace(/^@/, "")
      
      // Extract just the URL part (before credentials which come after the URL)
      // Format can be: URL:username:password or URL
      let urlPart = url
      
      // If it starts with http:// or https://, extract protocol and domain
      if (url.match(/^https?:\/\//)) {
        const protocolMatch = url.match(/^(https?:\/\/[^/:]+(?::\d+)?(?:\/[^:]*)?)/i)
        if (protocolMatch) {
          urlPart = protocolMatch[1]
        }
      } else {
        // Handle cases without protocol
        const match = url.match(/^([^:]+(?::\d+)?)(?::.*)?/)
        if (match) {
          urlPart = "http://" + match[1]
        }
      }

      // Parse URL to get hostname and port
      const urlObj = new URL(urlPart)
      let domain = urlObj.hostname
      
      // Add port if present and not default
      if (urlObj.port && urlObj.port !== "80" && urlObj.port !== "443") {
        domain += `:${urlObj.port}`
      }

      return domain || null
    } catch (error) {
      // Fallback: try to extract domain manually
      try {
        const match = line.match(/(?:https?:\/\/)?(?:www\.)?([^/:?\s]+)/)
        if (match) {
          return match[1]
        }
      } catch (e) {
        return null
      }
      return null
    }
  }

  const processUrls = () => {
    const lines = inputText.split("\n").filter(line => line.trim())
    const domainMap = new Map<string, string[]>()

    lines.forEach(line => {
      const domain = extractDomain(line)

      if (domain) {
        if (!domainMap.has(domain)) {
          domainMap.set(domain, [])
        }
        // Store original line if not duplicate
        if (!domainMap.get(domain)!.includes(line)) {
          domainMap.get(domain)!.push(line)
        }
      }
    })

    const groups: DomainGroup[] = Array.from(domainMap.entries()).map(([domain, urls]) => ({
      domain,
      urls,
      count: urls.length,
    }))

    setDomainGroups(groups)
  }

  // Sort domain groups based on selected option
  const sortedDomainGroups = useMemo(() => {
    const sorted = [...domainGroups]
    
    switch (sortOption) {
      case 'domain-asc':
        return sorted.sort((a, b) => a.domain.localeCompare(b.domain))
      case 'domain-desc':
        return sorted.sort((a, b) => b.domain.localeCompare(a.domain))
      case 'count-asc':
        return sorted.sort((a, b) => a.count - b.count)
      case 'count-desc':
        return sorted.sort((a, b) => b.count - a.count)
      default:
        return sorted
    }
  }, [domainGroups, sortOption])

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success("Copied to clipboard!")
    } catch (error) {
      toast.error("Failed to copy")
    }
  }

  const copyDomainUrls = (urls: string[]) => {
    copyToClipboard(urls.join("\n"))
  }

  // Extract unique paths from URLs
  const extractPaths = (urls: string[]): string[] => {
    const pathSet = new Set<string>()

    urls.forEach(line => {
      try {
        // Remove @ at the start if present
        let url = line.trim().replace(/^@/, "")
        
        // Extract URL part before credentials
        let urlPart = url
        
        // Handle URLs with credentials (format: URL:username:password)
        if (url.match(/^https?:\/\//)) {
          const protocolMatch = url.match(/^(https?:\/\/[^/:]+(?::\d+)?(?:\/[^:]*)?)/i)
          if (protocolMatch) {
            urlPart = protocolMatch[1]
          }
        } else {
          const match = url.match(/^([^:]+(?::\d+)?)(?::.*)?/)
          if (match) {
            urlPart = "http://" + match[1]
          }
        }

        const urlObj = new URL(urlPart)
        let path = urlObj.pathname || '/'
        
        // Add query string if exists
        if (urlObj.search) {
          path += urlObj.search
        }
        
        // Only add if not just root
        pathSet.add(path)
      } catch (error) {
        // If parsing fails, try to extract path manually
        const pathMatch = line.match(/\/([^:?]*(?:\?[^:]*)?)/)
        if (pathMatch) {
          pathSet.add('/' + pathMatch[1])
        }
      }
    })

    return Array.from(pathSet).sort()
  }

  const getPathsForDomain = (domain: string): string[] => {
    const group = domainGroups.find(g => g.domain === domain)
    return group ? extractPaths(group.urls) : []
  }

  const checkConnection = async (domain: string) => {
    // Update status to checking
    setDomainGroups(prev => prev.map(group => 
      group.domain === domain 
        ? { ...group, connectionStatus: 'checking' as const, statusCode: undefined, statusMessage: undefined }
        : group
    ))

    try {
      // Call API route to check connection from server side
      const response = await fetch('/api/check-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: domain }),
      })

      const data = await response.json()

      if (data.reachable) {
        // Success - domain is reachable
        const statusMessage = data.ok 
          ? 'OK' 
          : data.statusCode >= 400 && data.statusCode < 500
          ? 'Client Error'
          : data.statusCode >= 500
          ? 'Server Error'
          : data.statusText || 'Reachable'

        setDomainGroups(prev => prev.map(group => 
          group.domain === domain 
            ? { 
                ...group, 
                connectionStatus: data.ok ? 'success' as const : 'error' as const,
                statusCode: data.statusCode,
                statusMessage
              }
            : group
        ))
        
        if (data.ok) {
          toast.success(`${domain} is reachable! (${data.statusCode})`)
        } else {
          toast.warning(`${domain} returned ${data.statusCode} ${data.statusText}`)
        }
      } else {
        // Error - domain is not reachable
        setDomainGroups(prev => prev.map(group => 
          group.domain === domain 
            ? { 
                ...group, 
                connectionStatus: 'error' as const, 
                statusCode: data.statusCode || 0,
                statusMessage: data.error || 'Connection failed'
              }
            : group
        ))
        
        toast.error(`${domain}: ${data.error || 'Connection failed'}`)
      }
    } catch (error: any) {
      setDomainGroups(prev => prev.map(group => 
        group.domain === domain 
          ? { 
              ...group, 
              connectionStatus: 'error' as const, 
              statusCode: 0,
              statusMessage: 'Request failed'
            }
          : group
      ))
      
      toast.error(`${domain}: Request failed`)
    }
  }

  const clearAll = () => {
    setInputText("")
    setDomainGroups([])
  }

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type - only accept text files
    const validTypes = ['text/plain', 'text/txt']
    const validExtensions = ['.txt', '.text']
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()

    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
      toast.error("Please upload a text file (.txt)")
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }

    // Read file content
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      if (content) {
        setInputText(content)
        toast.success(`File "${file.name}" imported successfully!`)
      }
    }
    reader.onerror = () => {
      toast.error("Failed to read file")
    }
    reader.readAsText(file)

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['text/plain', 'text/txt']
    const validExtensions = ['.txt', '.text']
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()

    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
      toast.error("Please drop a text file (.txt)")
      return
    }

    // Read file content
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      if (content) {
        setInputText(content)
        toast.success(`File "${file.name}" imported successfully!`)
      }
    }
    reader.onerror = () => {
      toast.error("Failed to read file")
    }
    reader.readAsText(file)
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Domain Listing</h1>
        <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
          Extract and organize domains from your data lists
        </p>
      </div>

      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">Input Data List</CardTitle>
          <CardDescription className="text-sm">
            Paste your data list below or import from a text file (.txt). Each line should contain a URL with credentials.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative transition-all ${
              isDragging ? 'ring-2 ring-primary ring-offset-2 rounded-md' : ''
            }`}
          >
            <Textarea
              placeholder="Paste your data list here or drag & drop a .txt file..."
              className="min-h-[180px] sm:min-h-[200px] max-h-[400px] font-mono text-xs sm:text-sm resize-y"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            {isDragging && (
              <div className="absolute inset-0 bg-primary/10 rounded-md flex items-center justify-center pointer-events-none">
                <div className="text-primary font-semibold flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Drop file here
                </div>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <Button onClick={processUrls} disabled={!inputText.trim()}>
                Process
              </Button>
              <Button variant="outline" onClick={handleImportClick}>
                <Upload className="h-4 w-4 mr-2" />
                Import File
              </Button>
              <Button variant="outline" onClick={clearAll}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Only text files (.txt) are accepted for import
            </p>
          </div>
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.text,text/plain"
            onChange={handleFileImport}
            className="hidden"
            aria-label="Import data file"
          />
        </CardContent>
      </Card>

      {domainGroups.length > 0 && (
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3 sm:mb-4">
            <h2 className="text-xl sm:text-2xl font-semibold">
              Extracted Domains ({sortedDomainGroups.length})
            </h2>
            
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              <Select value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
                <SelectTrigger className="w-[180px] h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="domain-asc">Domain A→Z</SelectItem>
                  <SelectItem value="domain-desc">Domain Z→A</SelectItem>
                  <SelectItem value="count-desc">Count High→Low</SelectItem>
                  <SelectItem value="count-asc">Count Low→High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sortedDomainGroups.map((group) => (
              <Card key={group.domain} className="relative">
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-sm sm:text-base break-all">
                        {group.domain}
                      </CardTitle>
                    </div>
                    <Badge variant="secondary" className="shrink-0 text-xs">
                      {group.count}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 p-4 sm:p-6 pt-0">
                  {/* Connection Status */}
                  {group.connectionStatus && group.connectionStatus !== 'idle' && (
                    <div className={`text-xs p-2 rounded-md ${
                      group.connectionStatus === 'checking' 
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : group.connectionStatus === 'success'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : group.statusCode && group.statusCode >= 400 && group.statusCode < 500
                        ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                    }`}>
                      {group.connectionStatus === 'checking' ? (
                        <span className="flex items-center gap-2">
                          <div className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          Checking...
                        </span>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">
                            {group.connectionStatus === 'success' ? '✓' : '✗'} 
                            {' '}
                            {group.statusMessage}
                          </span>
                          {group.statusCode !== undefined && group.statusCode > 0 && (
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                group.statusCode >= 200 && group.statusCode < 300
                                  ? 'border-green-600 dark:border-green-400'
                                  : group.statusCode >= 400 && group.statusCode < 500
                                  ? 'border-orange-600 dark:border-orange-400'
                                  : 'border-red-600 dark:border-red-400'
                              }`}
                            >
                              {group.statusCode}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 min-w-[100px]"
                      onClick={() => copyDomainUrls(group.urls)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy URLs
                    </Button>
                    
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 min-w-[100px]"
                        >
                          <FolderTree className="h-4 w-4 mr-2" />
                          Paths
                        </Button>
                      </SheetTrigger>
                      <SheetContent className="w-full sm:max-w-md overflow-y-auto px-6">
                        <SheetHeader className="px-0">
                          <SheetTitle className="break-all">{group.domain}</SheetTitle>
                          <SheetDescription>
                            Unique paths found ({getPathsForDomain(group.domain).length})
                          </SheetDescription>
                        </SheetHeader>
                        <div className="mt-6 space-y-2">
                          {getPathsForDomain(group.domain).map((path, idx) => (
                            <div key={idx} className="group relative">
                              <div className="flex items-start gap-2 p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors">
                                <Globe className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
                                <code className="flex-1 text-sm break-all">{path}</code>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => copyToClipboard(path)}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                          {getPathsForDomain(group.domain).length === 0 && (
                            <div className="text-center p-8 text-muted-foreground">
                              <Globe className="h-8 w-8 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">No paths found</p>
                            </div>
                          )}
                        </div>
                        <div className="mt-6 pt-4 border-t sticky bottom-0 bg-background pb-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => {
                              const paths = getPathsForDomain(group.domain)
                              copyToClipboard(paths.join('\n'))
                            }}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy All Paths
                          </Button>
                        </div>
                      </SheetContent>
                    </Sheet>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 min-w-[100px]"
                      onClick={() => checkConnection(group.domain)}
                      disabled={group.connectionStatus === 'checking'}
                    >
                      <Globe className="h-4 w-4 mr-2" />
                      Check
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

