"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Copy, Trash2, Upload, FileText } from "lucide-react"
import { toast } from "sonner"
import { parseULPLines } from "@/lib/ulp-parser"
import { AdBanner } from "@/components/ad-banner"

type Delimiter = ':' | '|' | ',' | ';' | 'tab' | 'space'

export default function ListFormatPage() {
  const [inputText, setInputText] = useState("")
  const [resultText, setResultText] = useState("")
  const [delimiter, setDelimiter] = useState<Delimiter>(':')
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getDelimiterString = (del: Delimiter): string => {
    switch (del) {
      case 'tab': return '\t'
      case 'space': return ' '
      default: return del
    }
  }

  const generateUsernamePassword = () => {
    if (!inputText.trim()) {
      toast.error("Please enter data list")
      return
    }

    const parsed = parseULPLines(inputText)
    
    if (parsed.length === 0) {
      toast.error("No valid entries found")
      return
    }

    // Filter out entries with empty username or password
    const validEntries = parsed.filter(entry => {
      const hasUsername = entry.username && entry.username.trim() !== ''
      const hasPassword = entry.password && entry.password.trim() !== ''
      return hasUsername && hasPassword
    })

    if (validEntries.length === 0) {
      toast.error("No valid username:password pairs found")
      return
    }

    // Remove duplicates based on username:password combination
    const seen = new Set<string>()
    const uniqueEntries = validEntries.filter(entry => {
      const key = `${entry.username}:${entry.password}`
      if (seen.has(key)) {
        return false
      }
      seen.add(key)
      return true
    })

    // Store parsed entries for later use
    setResultText(JSON.stringify(uniqueEntries))
    
    const skipped = parsed.length - validEntries.length
    const duplicates = validEntries.length - uniqueEntries.length
    
    const messages = []
    if (skipped > 0) {
      messages.push(`${skipped} skipped (missing data)`)
    }
    if (duplicates > 0) {
      messages.push(`${duplicates} duplicates removed`)
    }
    
    if (messages.length > 0) {
      toast.success(`Generated ${uniqueEntries.length} entries (${messages.join(', ')})`)
    } else {
      toast.success(`Generated ${uniqueEntries.length} entries`)
    }
  }

  const copyResult = async () => {
    if (!resultText) {
      toast.error("No result to copy")
      return
    }

    try {
      // Parse the stored entries and format with selected delimiter
      const entries = JSON.parse(resultText)
      const delimiterStr = getDelimiterString(delimiter)
      const formatted = entries.map((entry: any) => `${entry.username}${delimiterStr}${entry.password}`).join('\n')
      
      await navigator.clipboard.writeText(formatted)
      toast.success(`Copied ${entries.length} entries with "${delimiter}" delimiter!`)
    } catch (error) {
      toast.error("Failed to copy")
    }
  }

  const clearAll = () => {
    setInputText("")
    setResultText("")
  }

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

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

    const validTypes = ['text/plain', 'text/txt']
    const validExtensions = ['.txt', '.text']
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()

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
      <AdBanner />
      
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">List Format</h1>
        <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
          Extract username and password with custom delimiter
        </p>
      </div>

      {/* Input Section */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">Input Data List</CardTitle>
          <CardDescription className="text-sm">
            Paste your data list or import from a text file (.txt)
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

          {/* Action Buttons */}
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <Button onClick={generateUsernamePassword} disabled={!inputText.trim()}>
                <FileText className="h-4 w-4 mr-2" />
                Get Username:Password
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

      {/* Result Section */}
      {resultText && (
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex-1">
                <CardTitle className="text-lg sm:text-xl">Result</CardTitle>
                <CardDescription className="text-sm">
                  {JSON.parse(resultText).length} username:password pairs
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="delimiter-result" className="text-xs">Delimiter</Label>
                  <Select value={delimiter} onValueChange={(value) => setDelimiter(value as Delimiter)}>
                    <SelectTrigger id="delimiter-result" className="w-[140px] h-8">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=":">Colon (:)</SelectItem>
                      <SelectItem value="|">Pipe (|)</SelectItem>
                      <SelectItem value=",">Comma (,)</SelectItem>
                      <SelectItem value=";">Semicolon (;)</SelectItem>
                      <SelectItem value="tab">Tab</SelectItem>
                      <SelectItem value="space">Space</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs opacity-0">Action</Label>
                  <Button onClick={copyResult} size="sm" className="h-8">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <Textarea
              value={(() => {
                try {
                  const entries = JSON.parse(resultText)
                  const delimiterStr = getDelimiterString(delimiter)
                  return entries.map((entry: any) => `${entry.username}${delimiterStr}${entry.password}`).join('\n')
                } catch {
                  return ''
                }
              })()}
              readOnly
              className="min-h-[300px] font-mono text-sm resize-y"
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}

