import { 
  HardDrive, 
  FileText, 
  KeyRound, 
  Braces, 
  Layers 
} from 'lucide-react'
import { formatByteSize } from '../../utils/jsonHelper'
import type { JsonStats } from '../../utils/jsonHelper'

interface JsonInfoProps {
  stats: JsonStats | null
}

export const JsonInfo = ({ stats }: JsonInfoProps) => {
  if (!stats) {
    return (
      <div className="bg-neutral-100/60 dark:bg-neutral-900/40 border border-neutral-250 dark:border-neutral-800 rounded-xl p-4 flex items-center justify-center text-xs text-neutral-500 italic select-none">
        Enter valid JSON to display metadata
      </div>
    )
  }

  const statItems = [
    { 
      label: 'Size', 
      value: formatByteSize(stats.byteSize), 
      icon: HardDrive, 
      color: 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border border-blue-500/20' 
    },
    { 
      label: 'Characters', 
      value: stats.charCount.toLocaleString(), 
      icon: FileText, 
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' 
    },
    { 
      label: 'Total Keys', 
      value: stats.keyCount.toLocaleString(), 
      icon: KeyRound, 
      color: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20' 
    },
    { 
      label: 'Objects', 
      value: stats.objectCount.toLocaleString(), 
      icon: Braces, 
      color: 'text-purple-600 dark:text-purple-400 bg-purple-500/10 border border-purple-500/20' 
    },
    { 
      label: 'Arrays', 
      value: stats.arrayCount.toLocaleString(), 
      icon: Layers, 
      color: 'text-pink-600 dark:text-pink-400 bg-pink-500/10 border border-pink-500/20' 
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 select-none">
      {statItems.map((item, idx) => {
        const Icon = item.icon
        return (
          <div 
            key={idx} 
            className="bg-white dark:bg-neutral-900 border border-neutral-250 dark:border-neutral-800 rounded-xl p-3.5 flex items-center gap-3 shadow-sm"
          >
            <div className={`p-2 rounded-lg ${item.color} shrink-0`}>
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                {item.label}
              </p>
              <p className="text-sm font-bold text-neutral-905 dark:text-white font-mono mt-0.5">
                {item.value}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
