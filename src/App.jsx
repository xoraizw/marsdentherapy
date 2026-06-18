import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import WebsitePage from './pages/WebsitePage'
import DashboardPage from './pages/DashboardPage'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WebsitePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </Router>
  )
}

export default App
