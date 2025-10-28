"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Copy, Trash2, Upload, ExternalLink, User, Lock, UserCircle } from "lucide-react"
import { toast } from "sonner"
import { parseULPLines, ParsedULP } from "@/lib/ulp-parser"

interface ULPEntry extends ParsedULP {
  id: string
}

export default function EasyCopyPage() {
  const [inputText, setInputText] = useState("")
  const [ulpEntries, setUlpEntries] = useState<ULPEntry[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [triedEntries, setTriedEntries] = useState<Set<string>>(new Set())
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
        <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
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
              Credentials ({ulpEntries.length})
            </h2>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            {ulpEntries.map((entry, index) => {
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
                  <div className="flex flex-col gap-3 sm:gap-4">
                    {/* URL and Credentials in one line */}
                    <div className="flex items-center gap-2 text-xs">
                      <a
                        href={entry.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-1 font-medium hover:underline cursor-pointer ${
                          isTried ? 'text-white dark:text-white' : 'text-primary'
                        }`}
                        title="Open in new tab"
                      >
                        <ExternalLink className="h-3 w-3 shrink-0" />
                        <span>{entry.url}</span>
                      </a>
                      
                      <span className={isTried ? 'text-white dark:text-white' : 'text-muted-foreground'}>|</span>
                      
                      <span className={`font-mono ${
                        isTried ? 'text-white dark:text-white' : 'text-blue-600 dark:text-blue-400'
                      }`}>
                        {entry.username}
                      </span>
                      
                      <span className={isTried ? 'text-white dark:text-white' : 'text-muted-foreground'}>|</span>
                      
                      <span className={`font-mono ${
                        isTried ? 'text-white dark:text-white' : 'text-orange-600 dark:text-orange-400'
                      }`}>
                        {entry.password}
                      </span>
                    </div>

                    {/* Copy Buttons */}
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() =>
                          copyToClipboard(
                            `${entry.url}:${entry.username}:${entry.password}`,
                            "URL:User:Pass",
                            entry.id
                          )
                        }
                      >
                        Copy URL:User:Pass
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() =>
                          copyToClipboard(
                            `${entry.username}:${entry.password}`,
                            "Username & Password",
                            entry.id
                          )
                        }
                      >
                        Copy User:Pass
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => copyToClipboard(entry.username, "Username", entry.id)}
                      >
                        Copy Username
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => copyToClipboard(entry.password, "Password", entry.id)}
                      >
                        Copy Password
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

