import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import QAPage from './pages/QAPage'
import ProblemsPage from './pages/ProblemsPage'
import RecommendPage from './pages/RecommendPage'
import NotFound from './pages/NotFound'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/qa" element={<QAPage />} />
        <Route path="/problems" element={<ProblemsPage />} />
        <Route path="/recommend" element={<RecommendPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  )
}

export default App

