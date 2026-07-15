import { useState } from 'react'
import { useAppStore } from '../../store/useAppStore'

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useAppStore()
  const [isPulling, setIsPulling] = useState(false)

  const isDark = theme === 'dark'

  const handlePull = () => {
    if (isPulling) return
    setIsPulling(true)
    
    // Toggle theme state
    toggleTheme()
    
    // Reset animation trigger
    setTimeout(() => {
      setIsPulling(false)
    }, 450)
  }

  return (
    <div className="relative flex flex-col items-center h-16 w-12 select-none">
      {/* The Chain & Knob Container */}
      <div 
        onClick={handlePull}
        className={`flex flex-col items-center cursor-pointer group origin-top ${
          isPulling ? 'animate-pull' : 'hover:translate-y-1'
        } transition-transform duration-200`}
        title={isDark ? 'Pull to switch to Light Mode' : 'Pull to switch to Dark Mode'}
      >
        {/* Ball Chain (beads representation using dotted vertical line) */}
        <div className="w-0.5 border-l-2 border-dotted border-neutral-400 dark:border-neutral-600 h-9 transition-colors duration-300" />
        
        {/* Metallic Pull Knob */}
        <div className={`w-3.5 h-6 rounded-full border shadow-sm transition-all duration-300 relative ${
          isDark 
            ? 'bg-neutral-800 border-neutral-700 shadow-violet-500/20' 
            : 'bg-neutral-100 border-neutral-300 shadow-amber-500/10'
        }`}>
          {/* Glowing element at the tip of the knob */}
          <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full transition-all duration-300 ${
            isDark 
              ? 'bg-violet-400 shadow-[0_0_8px_2px_rgba(167,139,250,0.6)] animate-pulse' 
              : 'bg-amber-400 shadow-[0_0_6px_1px_rgba(251,191,36,0.5)]'
          }`} />

          {/* Grip lines on the knob */}
          <div className="absolute top-1.5 left-1/2 -translate-x-1/2 flex flex-col gap-0.5 opacity-40">
            <div className="w-1.5 h-[1px] bg-neutral-500 dark:bg-neutral-400" />
            <div className="w-1.5 h-[1px] bg-neutral-500 dark:bg-neutral-400" />
            <div className="w-1.5 h-[1px] bg-neutral-500 dark:bg-neutral-400" />
          </div>
        </div>
      </div>
    </div>
  )
}
