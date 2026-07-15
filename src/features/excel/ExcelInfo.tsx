import { 
  Layers, 
  FileSpreadsheet, 
  Rows, 
  Columns, 
  HelpCircle 
} from 'lucide-react'
import type { ExcelStats } from '../../utils/excelHelper'

interface ExcelInfoProps {
  stats: ExcelStats | null
}

export const ExcelInfo = ({ stats }: ExcelInfoProps) => {
  if (!stats) {
    return (
      <div className="bg-neutral-100/60 dark:bg-neutral-900/40 border border-neutral-250 dark:border-neutral-800 rounded-xl p-4 flex items-center justify-center text-xs text-neutral-500 italic select-none">
        Upload a file to display spreadsheet stats
      </div>
    )
  }

  const statItems = [
    { 
      label: 'Sheets count', 
      value: stats.sheetCount.toLocaleString(), 
      icon: Layers, 
      color: 'text-violet-600 dark:text-violet-400 bg-violet-500/10 border border-violet-500/20' 
    },
    { 
      label: 'Active Sheet', 
      value: stats.currentSheetName, 
      icon: FileSpreadsheet, 
      color: 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border border-blue-500/20' 
    },
    { 
      label: 'Rows Count', 
      value: stats.rowCount.toLocaleString(), 
      icon: Rows, 
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' 
    },
    { 
      label: 'Columns Count', 
      value: stats.colCount.toLocaleString(), 
      icon: Columns, 
      color: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20' 
    },
    { 
      label: 'Empty Cells', 
      value: stats.emptyCellCount.toLocaleString(), 
      icon: HelpCircle, 
      color: 'text-neutral-600 dark:text-neutral-450 bg-neutral-100 dark:bg-neutral-800 border border-neutral-250 dark:border-neutral-700' 
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
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider truncate">
                {item.label}
              </p>
              <p className="text-sm font-bold text-neutral-905 dark:text-white font-mono mt-0.5 truncate" title={item.value}>
                {item.value}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
