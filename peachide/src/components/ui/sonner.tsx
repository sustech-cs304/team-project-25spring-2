"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps, toast } from "sonner"
import userActionLogger from '@/lib/userActionLogger'
import { useEffect } from "react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  useEffect(() => {
    // Wrap toast API to log programmatic toasts
    const original = { ...toast } as any
    const wrap = (level: 'info' | 'success' | 'error' | 'warning' | 'message') =>
      (message: React.ReactNode, opts?: any) => {
        try {
          const text = typeof message === 'string' ? message : (opts?.description || '')
          userActionLogger.logAction({
            actionType: 'toast',
            functionDescription: `Toast: ${level}`,
            elementText: text || undefined,
            actionDetails: { level, opts }
          })
        } catch { /* ignore */ }
        return (original as any)[level]?.(message as any, opts)
      }
    ;(toast as any).success = wrap('success')
    ;(toast as any).error = wrap('error')
    ;(toast as any).warning = wrap('warning')
    ;(toast as any).info = wrap('info')
    ;(toast as any).message = wrap('message')

    // Observe DOM to catch non-wrapped toasts
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.addedNodes.forEach((node) => {
          const el = node as HTMLElement
          if (el && el.nodeType === 1 && el.classList?.contains('sonner-toast')) {
            const text = el.textContent?.trim().slice(0, 200)
            userActionLogger.logAction({ actionType: 'toast', functionDescription: 'Toast shown', elementText: text })
          }
        })
      }
    })
    if (typeof window !== 'undefined') {
      const root = document.body
      observer.observe(root, { childList: true, subtree: true })
    }
    return () => observer.disconnect()
  }, [])

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
