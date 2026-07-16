import { ArrowRight, FileSpreadsheet, Type, Database, Folder, Terminal } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { TOOLS_CONFIG } from '../../config/tools'

export const HomeDashboard = () => {
  const { setActiveTool } = useAppStore()

  // Check if a release date is in the current calendar quarter of the current year
  const isCurrentQuarterTool = (releaseDate: string): boolean => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentQuarter = Math.floor(now.getMonth() / 3) // 0: Q1, 1: Q2, 2: Q3, 3: Q4

    const release = new Date(releaseDate)
    const releaseYear = release.getFullYear()
    const releaseQuarter = Math.floor(release.getMonth() / 3)

    return releaseYear === currentYear && releaseQuarter === currentQuarter
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-16 relative overflow-hidden w-full select-none">
      
      {/* Decorative premium ambient glowing washes */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-violet-500/8 via-fuchsia-500/5 to-blue-500/8 dark:from-violet-500/4 dark:via-fuchsia-500/2 dark:to-blue-500/4 rounded-full blur-[120px] pointer-events-none z-0" />
      
      {/* Dot matrix grid layer */}
      <div className="absolute inset-0 bg-grid-pattern opacity-70 dark:opacity-60 pointer-events-none z-0" />

      <div className="relative z-10 flex flex-col items-center w-full max-w-4xl px-4">
        
        {/* Hero Header */}
        <div className="text-center space-y-5 max-w-2xl mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-md border border-neutral-250 dark:border-neutral-800/80 rounded-full shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
            </span>
            <span className="text-[10px] font-bold text-neutral-550 dark:text-neutral-455 uppercase tracking-widest font-mono">
              Privacy-First Workspace
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-neutral-905 dark:text-white tracking-tight leading-none">
            Your everyday workspace <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-blue-655 dark:from-violet-400 dark:via-fuchsia-400 dark:to-blue-400 bg-clip-text text-transparent">
              for data and files.
            </span>
          </h1>

          <p className="text-sm md:text-base text-neutral-555 dark:text-neutral-400 max-w-xl mx-auto leading-relaxed">
            All processing happens locally in the browser. Your data stays on your device.
          </p>
        </div>

        {/* Main Active Tools Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8">
          {TOOLS_CONFIG.map((tool) => {
            const Icon = tool.icon
            const isNew = isCurrentQuarterTool(tool.releaseDate)
            
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                className={`group text-left p-8 bg-white/70 hover:bg-white dark:bg-neutral-950/50 dark:hover:bg-neutral-950/80 border border-neutral-200/80 dark:border-neutral-800/80 ${tool.hoverCardBorder} rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.015)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.03)] dark:hover:shadow-[0_20px_40px_rgb(0,0,0,0.4)] hover:-translate-y-1.5 hover:scale-[1.01] transition-all duration-300 relative overflow-hidden flex flex-col h-[260px] cursor-pointer outline-none`}
              >
                {/* Radial glow wash behind card that pops on hover */}
                <div className={`absolute top-0 right-0 w-44 h-44 bg-gradient-to-br ${tool.glowColor} blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                {/* Metallic light reflecting edge line (inner border effect) */}
                <div className="absolute inset-[1px] rounded-[23px] border border-white/50 dark:border-neutral-900/50 pointer-events-none group-hover:border-white/80 dark:group-hover:border-neutral-800/50 transition-colors duration-300" />

                {/* Card Header Info */}
                <div className="flex items-center justify-between mb-6 relative z-10">
                  <div className={`p-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl ${tool.hoverIconBorder} transition-all duration-300 shrink-0`}>
                    <Icon className={`h-5 w-5 text-neutral-555 dark:text-neutral-455 transition-colors duration-300 ${tool.hoverIcon}`} />
                  </div>
                  
                  {isNew && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-violet-500/10 border border-violet-500/20 rounded-full shrink-0">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-violet-500"></span>
                      </span>
                      <span className="text-[9px] font-bold text-violet-650 dark:text-violet-400 uppercase tracking-widest font-mono">
                        New tool
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div className="relative z-10 flex-grow flex flex-col mb-4">
                  <h3 className={`text-xl font-bold text-neutral-905 dark:text-white mb-2.5 tracking-tight transition-colors duration-300 ${tool.hoverText}`}>
                    {tool.title}
                  </h3>
                  
                  <p className="text-xs text-neutral-505 dark:text-neutral-455 leading-relaxed font-normal flex-grow line-clamp-3">
                    {tool.description}
                  </p>
                </div>

                {/* Bottom Action Footer */}
                <div className="relative z-10 flex items-center justify-between mt-auto w-full">
                  <div className={`flex items-center gap-1.5 text-xs font-bold text-neutral-550 dark:text-neutral-455 transition-colors duration-300 ${tool.hoverText}`}>
                    <span>Launch Workspace</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              </button>
            )
          })}
          
          {/* Coming Soon Cards */}
          {[
            { title: 'CSV Workspace', description: 'Explore and transform CSV data.', icon: FileSpreadsheet },
            { title: 'Text Tools', description: 'Format and manipulate raw text.', icon: Type },
            { title: 'SQL Tools', description: 'Format and lint SQL queries locally.', icon: Database },
            { title: 'File Tools', description: 'Compress and encode files.', icon: Folder },
            { title: 'Developer Tools', description: 'Local generation tools and decoders.', icon: Terminal }
          ].map((item, index) => {
            const Icon = item.icon
            return (
              <div
                key={`coming-soon-${index}`}
                className="group text-left p-8 bg-neutral-50/50 dark:bg-neutral-900/30 border border-neutral-200 border-dashed dark:border-neutral-800 rounded-3xl flex flex-col h-[260px] opacity-70"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shrink-0">
                    <Icon className="h-5 w-5 text-neutral-400 dark:text-neutral-500" />
                  </div>
                  
                  <div className="flex items-center px-2.5 py-1 bg-neutral-200/50 dark:bg-neutral-800/50 rounded-full shrink-0">
                    <span className="text-[9px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest font-mono">
                      Coming Soon
                    </span>
                  </div>
                </div>

                <div className="flex-grow flex flex-col mb-4">
                  <h3 className="text-xl font-bold text-neutral-600 dark:text-neutral-400 mb-2.5 tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-500 leading-relaxed font-normal flex-grow line-clamp-3">
                    {item.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
