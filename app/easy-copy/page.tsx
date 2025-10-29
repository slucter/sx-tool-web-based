"use client"

import { useState, useRef, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Copy, Trash2, Upload, ExternalLink, User, Lock, UserCircle, Search, ArrowUpDown } from "lucide-react"
import { toast } from "sonner"
import { parseULPLines, ParsedULP } from "@/lib/ulp-parser"

interface ULPEntry extends ParsedULP {
  id: string
}

type SearchField = 'all' | 'url' | 'username' | 'password'
type SortField = 'none' | 'url' | 'username' | 'password'
type SortDirection = 'asc' | 'desc'

export default function EasyCopyPage() {
  const [inputText, setInputText] = useState("")
  const [ulpEntries, setUlpEntries] = useState<ULPEntry[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [triedEntries, setTriedEntries] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")
  const [searchField, setSearchField] = useState<SearchField>('all')
  const [sortField, setSortField] = useState<SortField>('none')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processULP = () => {
    const parsed = parseULPLines(inputText)
    
    // Add unique IDs to each entry
    const entries: ULPEntry[] = parsed.map((entry) => ({
      ...entry,
      id: `ulp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }))

    setUlpEntries(entries)
    if (entries.length > 0) {
      toast.success(`Processed ${entries.length} entries`)
    } else {
      toast.error("No valid entries found")
    }
  }

  const copyToClipboard = async (text: string, label: string, entryId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`${label} copied to clipboard!`)
      // Mark entry as tried
      setTriedEntries((prev) => new Set(prev).add(entryId))
    } catch (error) {
      toast.error("Failed to copy")
    }
  }

  const clearAll = () => {
    setInputText("")
    setUlpEntries([])
    setTriedEntries(new Set())
  }

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const validTypes = ["text/plain", "text/txt"]
    const validExtensions = [".txt", ".text"]
    const fileExtension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase()

    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
      toast.error("Please upload a text file (.txt)")
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      return
    }

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

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
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

    const validTypes = ["text/plain", "text/txt"]
    const validExtensions = [".txt", ".text"]
    const fileExtension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase()

    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
      toast.error("Please drop a text file (.txt)")
      return
    }

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

  // Filter and sort entries
  const filteredAndSortedEntries = useMemo(() => {
    let filtered = [...ulpEntries]

    // Filter by search
    if (searchQuery.trim()) {
      filtered = filtered.filter(entry => {
        const query = searchQuery.toLowerCase()
        switch (searchField) {
          case 'url':
            return entry.url.toLowerCase().includes(query)
          case 'username':
            return entry.username.toLowerCase().includes(query)
          case 'password':
            return entry.password.toLowerCase().includes(query)
          case 'all':
          default:
            return (
              entry.url.toLowerCase().includes(query) ||
              entry.username.toLowerCase().includes(query) ||
              entry.password.toLowerCase().includes(query)
            )
        }
      })
    }

    // Sort entries
    if (sortField !== 'none') {
      filtered.sort((a, b) => {
        let compareA = ''
        let compareB = ''

        switch (sortField) {
          case 'url':
            compareA = a.url.toLowerCase()
            compareB = b.url.toLowerCase()
            break
          case 'username':
            compareA = a.username.toLowerCase()
            compareB = b.username.toLowerCase()
            break
          case 'password':
            compareA = a.password.toLowerCase()
            compareB = b.password.toLowerCase()
            break
        }

        if (sortDirection === 'asc') {
          return compareA.localeCompare(compareB)
        } else {
          return compareB.localeCompare(compareA)
        }
      })
    }

    return filtered
  }, [ulpEntries, searchQuery, searchField, sortField, sortDirection])

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Easy Copy</h1>
        <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
          Quick access and copy utilities for your credentials
        </p>
      </div>

      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">Input Data List</CardTitle>
          <CardDescription className="text-sm">
            Paste your data list or import from a text file. Supports formats: url:user:pass or user:pass:url (delimiter: : or |)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative transition-all ${
              isDragging ? "ring-2 ring-primary ring-offset-2 rounded-md" : ""
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
              <Button onClick={processULP} disabled={!inputText.trim()}>
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
              Supports: url:user:pass or user:pass:url • Delimiters: : or | • Only text files (.txt)
            </p>
          </div>
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

      {ulpEntries.length > 0 && (
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-semibold">
              Credentials ({filteredAndSortedEntries.length} of {ulpEntries.length})
            </h2>
          </div>

          {/* Search and Sort Bar - Sticky */}
          <div className="sticky top-[-10px] sm:top-[-20px] z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border rounded-lg p-3 sm:p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="flex-1 flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search credentials..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9"
                  />
                </div>
                <Select value={searchField} onValueChange={(value) => setSearchField(value as SearchField)}>
                  <SelectTrigger className="w-full sm:w-[140px] h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Fields</SelectItem>
                    <SelectItem value="url">URL</SelectItem>
                    <SelectItem value="username">Username</SelectItem>
                    <SelectItem value="password">Password</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort */}
              <div className="flex gap-2">
                <Select value={sortField} onValueChange={(value) => setSortField(value as SortField)}>
                  <SelectTrigger className="w-full sm:w-[140px] h-9">
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Sort</SelectItem>
                    <SelectItem value="url">Sort by URL</SelectItem>
                    <SelectItem value="username">Sort by User</SelectItem>
                    <SelectItem value="password">Sort by Pass</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-3"
                  onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                  disabled={sortField === 'none'}
                >
                  <ArrowUpDown className="h-4 w-4 mr-1" />
                  {sortDirection === 'asc' ? 'A→Z' : 'Z→A'}
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 sm:space-y-2 overflow-hidden">
            {filteredAndSortedEntries.length === 0 ? (
              <Card className="p-8 text-center">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Search className="h-8 w-8" />
                  <p className="text-sm">No credentials found matching your search.</p>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => {
                      setSearchQuery("")
                      setSearchField('all')
                    }}
                  >
                    Clear search
                  </Button>
                </div>
              </Card>
            ) : (
              filteredAndSortedEntries.map((entry, index) => {
              const isTried = triedEntries.has(entry.id)
              return (
              <Card 
                key={entry.id} 
                className={`transition-colors ${
                  isTried 
                    ? 'border-black dark:border-white bg-black dark:bg-black hover:bg-black/90 dark:hover:bg-black/90' 
                    : 'hover:bg-accent/30'
                }`}
              >
                <CardContent className="py-2 px-3 sm:py-3 sm:px-4">
                  <div className="flex flex-col gap-2 sm:gap-3">
                    {/* URL */}
                    <div className="flex items-start gap-1.5 min-w-0">
                      <ExternalLink className={`h-3 w-3 shrink-0 mt-0.5 ${
                        isTried ? 'text-white dark:text-white' : 'text-primary'
                      }`} />
                      <a
                        href={entry.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`text-xs font-medium hover:underline cursor-pointer break-all min-w-0 ${
                          isTried ? 'text-white dark:text-white' : 'text-primary'
                        }`}
                        title={entry.url}
                      >
                        {entry.url}
                      </a>
                    </div>
                    
                    {/* Username and Password */}
                    <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-3 text-xs min-w-0">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <User className={`h-3 w-3 shrink-0 ${
                          isTried ? 'text-white dark:text-white' : 'text-blue-600 dark:text-blue-400'
                        }`} />
                        <span className={`font-mono break-all ${
                          isTried ? 'text-white dark:text-white' : 'text-blue-600 dark:text-blue-400'
                        }`}>
                          {entry.username}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Lock className={`h-3 w-3 shrink-0 ${
                          isTried ? 'text-white dark:text-white' : 'text-orange-600 dark:text-orange-400'
                        }`} />
                        <span className={`font-mono break-all ${
                          isTried ? 'text-white dark:text-white' : 'text-orange-600 dark:text-orange-400'
                        }`}>
                          {entry.password}
                        </span>
                      </div>
                    </div>

                    {/* Copy Buttons */}
                    <div className="flex flex-wrap gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs flex-shrink-0 whitespace-nowrap"
                        onClick={() =>
                          copyToClipboard(
                            `${entry.url}:${entry.username}:${entry.password}`,
                            "URL:User:Pass",
                            entry.id
                          )
                        }
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        URL:User:Pass
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs flex-shrink-0 whitespace-nowrap"
                        onClick={() =>
                          copyToClipboard(
                            `${entry.username}:${entry.password}`,
                            "Username & Password",
                            entry.id
                          )
                        }
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        User:Pass
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs flex-shrink-0 whitespace-nowrap"
                        onClick={() => copyToClipboard(entry.username, "Username", entry.id)}
                      >
                        <User className="h-3 w-3 mr-1" />
                        User
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs flex-shrink-0 whitespace-nowrap"
                        onClick={() => copyToClipboard(entry.password, "Password", entry.id)}
                      >
                        <Lock className="h-3 w-3 mr-1" />
                        Pass
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              )
            })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

