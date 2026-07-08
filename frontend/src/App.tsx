import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
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
          <Route path="/detect" element={<MonitorPage />} />
          <Route path="/monitor" element={<Navigate to="/detect" replace />} />
          <Route path="/results" element={<ReportsPage />} />
          <Route path="/reports" element={<Navigate to="/results" replace />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/professional" element={<DevicePage />} />
          <Route path="/device" element={<Navigate to="/professional" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
