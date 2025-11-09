import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'

// Import pages
import Home from './pages/Home'
import Feed from './pages/Feed'
import Submit from './pages/Submit'
import ComponentTest from './pages/ComponentTest'

// Import Layout
import { Layout } from './components/Layout'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/submit" element={<Submit />} />
          <Route path="/about" element={<Home />} />
          <Route path="/test" element={<ComponentTest />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
