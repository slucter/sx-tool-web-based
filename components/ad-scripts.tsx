"use client"

import { useEffect } from "react"

export function AdScripts() {
  useEffect(() => {
    // Native Banner Ad Script
    const nativeBannerScript = document.createElement("script")
    nativeBannerScript.async = true
    nativeBannerScript.setAttribute("data-cfasync", "false")
    nativeBannerScript.src = "//pl27959999.effectivegatecpm.com/c3444bda6face84b8217b377ca435100/invoke.js"
    document.head.appendChild(nativeBannerScript)

    // Cleanup function
    return () => {
      if (document.head.contains(nativeBannerScript)) {
        document.head.removeChild(nativeBannerScript)
      }
    }
  }, [])

  return null
}
