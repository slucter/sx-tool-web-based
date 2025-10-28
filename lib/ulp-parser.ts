export interface ParsedULP {
  url: string
  username: string
  password: string
  originalLine: string
}

/**
 * Detect delimiter used in the line (: or |)
 */
export function detectDelimiter(line: string): string {
  // Count occurrences of : and |
  const colonCount = (line.match(/:/g) || []).length
  const pipeCount = (line.match(/\|/g) || []).length
  
  // If has |, likely using pipe as delimiter
  if (pipeCount >= 2) return "|"
  
  // Default to colon
  return ":"
}

/**
 * Check if a string is an email
 */
function isEmail(text: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)
}

/**
 * Check if a string is a URL (not email)
 */
function isUrl(text: string): boolean {
  // Not an email
  if (isEmail(text)) {
    return false
  }
  
  // Check if starts with protocol
  if (text.startsWith("http://") || text.startsWith("https://")) {
    return true
  }
  
  // Check if looks like IP address
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(text)) {
    return true
  }
  
  // Check if looks like domain (has dot but not email)
  if (/^[\w.-]+\.\w+/.test(text)) {
    return true
  }
  
  return false
}

/**
 * Extract domain from URL
 */
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url.startsWith("http") ? url : "http://" + url)
    return urlObj.hostname
  } catch {
    return url
  }
}

/**
 * Normalize delimiter to colon for consistent parsing
 */
function normalizeDelimiter(line: string, delimiter: string): string {
  if (delimiter === "|") {
    return line.replace(/\|/g, ":")
  }
  return line
}

/**
 * Parse ULP line into URL, username, and password
 * Supports formats:
 * - url:user:pass
 * - user:pass:url
 * - With | as delimiter
 * - URLs with/without protocol
 * - URLs with ports
 * - URLs with paths
 */
export function parseULPLine(line: string): ParsedULP | null {
  const trimmedLine = line.trim().replace(/^@/, "")
  if (!trimmedLine) return null

  // Detect and normalize delimiter
  const delimiter = detectDelimiter(trimmedLine)
  const normalized = normalizeDelimiter(trimmedLine, delimiter)
  
  const parts = normalized.split(":")
  if (parts.length < 2) return null

  let url = ""
  let username = ""
  let password = ""

  // Strategy: Try to find the URL part first
  // URL usually starts with http://, https://, or is a domain/IP
  
  // Check if starts with protocol
  if (parts[0].startsWith("http") || parts[0].startsWith("https")) {
    // Format: http(s)://domain/path:user@email.com:pass
    let urlParts = [parts[0]]
    let i = 1
    
    // Add domain part (after ://)
    if (i < parts.length) {
      urlParts.push(parts[i])
      i++
    }
    
    // Check for port (numeric after domain)
    if (i < parts.length && /^\d+$/.test(parts[i])) {
      urlParts.push(parts[i])
      i++
    }
    
    // Check for path (contains /)
    while (i < parts.length && parts[i].includes("/")) {
      urlParts.push(parts[i])
      i++
    }
    
    url = urlParts.join(":")
    
    // Now find username (could be email with @)
    // Username is the part before the last colon
    if (i < parts.length) {
      // If next part looks like email or username
      if (isEmail(parts[i]) || !isUrl(parts[i])) {
        username = parts[i]
        i++
        // Rest is password
        password = parts.slice(i).join(":") || ""
      } else {
        // If not email, might be user:pass or pass only
        username = parts[i]
        password = parts.slice(i + 1).join(":") || ""
      }
    }
  } 
  // Check if first part is domain/IP (no protocol)
  else if (isUrl(parts[0]) && !isEmail(parts[0])) {
    // Format: domain.com/path:user@email.com:pass
    let urlParts = [parts[0]]
    let i = 1
    
    // Check for port
    if (i < parts.length && /^\d+$/.test(parts[i])) {
      urlParts.push(parts[i])
      i++
    }
    
    // Check for path
    while (i < parts.length && parts[i].includes("/")) {
      urlParts.push(parts[i])
      i++
    }
    
    url = urlParts.join(":")
    
    // Now find username (could be email)
    if (i < parts.length) {
      if (isEmail(parts[i]) || !isUrl(parts[i])) {
        username = parts[i]
        i++
        password = parts.slice(i).join(":") || ""
      } else {
        username = parts[i]
        password = parts.slice(i + 1).join(":") || ""
      }
    }
  }
  // Check if first part is email (user@email.com:pass:url)
  else if (isEmail(parts[0])) {
    username = parts[0]
    password = parts[1]
    
    // Rest is URL
    if (parts.length > 2) {
      url = parts.slice(2).join(":")
    }
  }
  // Otherwise, assume format: user:pass:url
  else {
    username = parts[0]
    password = parts[1]
    
    // Rest is URL
    if (parts.length > 2) {
      url = parts.slice(2).join(":")
    }
  }

  // Ensure URL has protocol
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    // Check if it's likely https (common domains)
    if (url.includes("login") || url.includes("admin") || url.includes("secure")) {
      url = "https://" + url
    } else {
      url = "http://" + url
    }
  }

  // Validate we have all parts
  if (!url || !username || !password) return null

  return {
    url,
    username,
    password,
    originalLine: trimmedLine,
  }
}

/**
 * Parse multiple ULP lines
 */
export function parseULPLines(text: string): ParsedULP[] {
  const lines = text.split("\n").filter((line) => line.trim())
  const results: ParsedULP[] = []

  lines.forEach((line) => {
    const parsed = parseULPLine(line)
    if (parsed) {
      results.push(parsed)
    }
  })

  return results
}

