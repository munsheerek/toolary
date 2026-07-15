import { DashboardLayout } from './components/Layout/DashboardLayout'
import { HomeDashboard } from './components/HomeDashboard/HomeDashboard'
import { JsonWorkspace } from './features/json/JsonWorkspace'
import { ExcelWorkspace } from './features/excel/ExcelWorkspace'
import { useAppStore } from './store/useAppStore'

function App() {
  const { activeTool } = useAppStore()

  const renderActiveTool = () => {
    switch (activeTool) {
      case 'json':
        return <JsonWorkspace />
      case 'excel':
        return <ExcelWorkspace />
      case 'home':
      default:
        return <HomeDashboard />
    }
  }

  return (
    <DashboardLayout>
      {renderActiveTool()}
    </DashboardLayout>
  )
}

export default App
