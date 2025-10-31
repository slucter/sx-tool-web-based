"use client"

import { useEffect } from "react"

export function AdScripts() {
  useEffect(() => {
    // Social Bar Script
    const socialBarScript = document.createElement("script")
    socialBarScript.type = "text/javascript"
    socialBarScript.src = "//pl27959969.effectivegatecpm.com/e6/30/2e/e6302ed55f05741a8a8abacf868bf996.js"
    socialBarScript.async = true
    document.head.appendChild(socialBarScript)

    // Native Banner Ad Script
    const nativeBannerScript = document.createElement("script")
    nativeBannerScript.async = true
    nativeBannerScript.setAttribute("data-cfasync", "false")
    nativeBannerScript.src = "//pl27959999.effectivegatecpm.com/c3444bda6face84b8217b377ca435100/invoke.js"
    document.head.appendChild(nativeBannerScript)

    // Cleanup function
    return () => {
      if (document.head.contains(socialBarScript)) {
        document.head.removeChild(socialBarScript)
      }
      if (document.head.contains(nativeBannerScript)) {
        document.head.removeChild(nativeBannerScript)
      }
    }
  }, [])

  return null
}
