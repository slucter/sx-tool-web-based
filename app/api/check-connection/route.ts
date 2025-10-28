import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    // Build base URL without path
    let testUrl = url
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      testUrl = 'https://' + url
    }

    const urlObj = new URL(testUrl)
    const baseUrl = `${urlObj.protocol}//${urlObj.host}`

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    try {
      const response = await fetch(baseUrl, {
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        redirect: 'follow',
      })

      clearTimeout(timeoutId)

      return NextResponse.json({
        success: true,
        statusCode: response.status,
        statusText: response.statusText,
        ok: response.ok,
        reachable: true,
      })
    } catch (fetchError: any) {
      clearTimeout(timeoutId)

      if (fetchError.name === 'AbortError') {
        return NextResponse.json({
          success: false,
          statusCode: 408,
          statusText: 'Request Timeout',
          error: 'Connection timeout after 10 seconds',
          reachable: false,
        })
      }

      // Try to determine if it's a network error or other error
      return NextResponse.json({
        success: false,
        statusCode: 0,
        statusText: 'Network Error',
        error: fetchError.message || 'Failed to connect',
        reachable: false,
      })
    }
  } catch (error: any) {
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Internal server error',
        reachable: false,
      },
      { status: 500 }
    )
  }
}

