import { create } from 'zustand'

export interface ToastState {
  message: string
  type: 'success' | 'info' | 'error'
}

interface AppState {
  theme: 'dark' | 'light'
  sidebarOpen: boolean
  activeTool: 'home' | 'json' | 'excel'
  commandPaletteOpen: boolean
  formatTrigger: number
  toast: ToastState | null
  
  toggleTheme: () => void
  setTheme: (theme: 'dark' | 'light') => void
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  setActiveTool: (tool: 'home' | 'json' | 'excel') => void
  setCommandPaletteOpen: (open: boolean) => void
  toggleCommandPalette: () => void
  triggerFormat: () => void
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void
  clearToast: () => void
}

export const useAppStore = create<AppState>((set) => {
  // Migrate old key if exists
  const legacyTheme = localStorage.getItem('devbox-theme')
  if (legacyTheme) {
    localStorage.setItem('toolary-theme', legacyTheme)
    localStorage.removeItem('devbox-theme')
  }

  // Load initial theme from localStorage or system preference, default to dark
  const savedTheme = localStorage.getItem('toolary-theme') as 'dark' | 'light' | null
  const initialTheme = savedTheme || 'dark'

  // Apply initial theme class to HTML element
  if (initialTheme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }

  let toastTimeout: ReturnType<typeof setTimeout> | null = null

  return {
    theme: initialTheme,
    sidebarOpen: true,
    activeTool: 'home',
    commandPaletteOpen: false,
    formatTrigger: 0,
    toast: null,
    
    toggleTheme: () => set((state) => {
      const nextTheme = state.theme === 'dark' ? 'light' : 'dark'
      localStorage.setItem('toolary-theme', nextTheme)
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      return { theme: nextTheme }
    }),

    setTheme: (theme) => {
      localStorage.setItem('toolary-theme', theme)
      if (theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      set({ theme })
    },

    setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
    
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    
    setActiveTool: (activeTool) => set({ activeTool }),
    
    setCommandPaletteOpen: (commandPaletteOpen) => set({ commandPaletteOpen }),
    
    toggleCommandPalette: () => set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),
    
    triggerFormat: () => set((state) => ({ 
      activeTool: 'json', 
      formatTrigger: state.formatTrigger + 1,
      commandPaletteOpen: false
    })),

    showToast: (message, type = 'success') => {
      if (toastTimeout) clearTimeout(toastTimeout)
      
      set({ toast: { message, type } })
      
      toastTimeout = setTimeout(() => {
        set({ toast: null })
      }, 3000)
    },

    clearToast: () => {
      if (toastTimeout) clearTimeout(toastTimeout)
      set({ toast: null })
    }
  }
})
