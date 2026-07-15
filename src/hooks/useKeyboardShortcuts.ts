import { useEffect, useRef } from 'react'

type ShortcutHandler = (e: KeyboardEvent) => void

interface ShortcutConfig {
  key: string // e.g., 'k', 'enter', 'c'
  ctrlOrCmd?: boolean
  shift?: boolean
  alt?: boolean
  disabled?: boolean
}

export function useKeyboardShortcut(
  config: ShortcutConfig,
  handler: ShortcutHandler
) {
  const handlerRef = useRef<ShortcutHandler>(handler)
  
  // Keep the handler ref updated so we don't re-bind event listeners unnecessarily
  useEffect(() => {
    handlerRef.current = handler
  }, [handler])

  useEffect(() => {
    if (config.disabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      
      const targetModifier = config.ctrlOrCmd
        ? (isMac ? e.metaKey : e.ctrlKey)
        : (!e.ctrlKey && !e.metaKey)
        
      const targetShift = !!config.shift === e.shiftKey
      const targetAlt = !!config.alt === e.altKey
      const targetKey = e.key.toLowerCase() === config.key.toLowerCase()

      if (targetKey && targetModifier && targetShift && targetAlt) {
        e.preventDefault()
        handlerRef.current(e)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [config.key, config.ctrlOrCmd, config.shift, config.alt, config.disabled])
}
