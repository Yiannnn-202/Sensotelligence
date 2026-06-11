import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import MonitorPage from './pages/MonitorPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/monitor" element={<MonitorPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
