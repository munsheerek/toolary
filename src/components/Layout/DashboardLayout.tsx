import React from 'react'
import { Sidebar } from '../Sidebar/Sidebar'
import { Header } from '../Header/Header'
import { CommandPalette } from '../CommandPalette/CommandPalette'
import { useAppStore } from '../../store/useAppStore'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast, clearToast } = useAppStore()

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-neutral-50 dark:bg-neutral-950 text-neutral-950 dark:text-neutral-100 font-sans select-none">
      <Sidebar />
      
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header />
        
        {/* Main Workspace Area */}
        <main className="flex-1 overflow-auto bg-neutral-50 dark:bg-neutral-950 p-6 flex flex-col">
          <div className="flex-1 flex flex-col max-w-[1400px] w-full mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
      
      <CommandPalette />

      {/* Global Toast Notifications */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-white dark:bg-neutral-900 border border-neutral-250 dark:border-neutral-805 rounded-xl shadow-2xl animate-fade-in max-w-md select-none">
          {toast.type === 'success' && (
            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
          )}
          {toast.type === 'error' && (
            <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />
          )}
          {toast.type === 'info' && (
            <Info className="h-5 w-5 text-blue-500 shrink-0" />
          )}
          <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 pr-4 break-all">
            {toast.message}
          </div>
          <button 
            onClick={clearToast}
            className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded text-neutral-450 hover:text-neutral-800 dark:hover:text-neutral-300 ml-auto shrink-0 cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}
