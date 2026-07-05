import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AppShell from './components/AppShell'
import DevicePage from './pages/DevicePage'
import HistoryPage from './pages/HistoryPage'
import HomePage from './pages/HomePage'
import MonitorPage from './pages/MonitorPage'
import NotFoundPage from './pages/NotFoundPage'
import ReportsPage from './pages/ReportsPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/monitor" element={<MonitorPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/device" element={<DevicePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
