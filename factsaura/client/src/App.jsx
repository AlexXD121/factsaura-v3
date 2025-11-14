import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'

// Import pages
import Home from './pages/Home'
import Feed from './pages/Feed'
import Submit from './pages/Submit'
import AboutUs from './pages/AboutUs'
import ComponentTest from './pages/ComponentTest'
import FamilyTreeDemo from './pages/FamilyTreeDemo'
import DemoShowcase from './pages/DemoShowcase'
import DemoPresentation from './pages/DemoPresentation'

// Import Layout and Error Handling
import { Layout } from './components/Layout'
import { ErrorBoundary } from './components/ErrorBoundary'
import PageTransition from './components/Layout/PageTransition'
import { OfflineSupport } from './components/UI'
import PerformanceMonitor from './components/UI/PerformanceMonitor'

function App() {
  return (
    <ErrorBoundary level="page">
      <Router>
        <Layout>
          <OfflineSupport />
          <PerformanceMonitor />
          <PageTransition>
            <Routes>
              <Route path="/" element={
                <ErrorBoundary level="component">
                  <Feed />
                </ErrorBoundary>
              } />
              <Route path="/submit" element={
                <ErrorBoundary level="component">
                  <Submit />
                </ErrorBoundary>
              } />
              <Route path="/about" element={
                <ErrorBoundary level="component">
                  <Home />
                </ErrorBoundary>
              } />
              <Route path="/about-us" element={
                <ErrorBoundary level="component">
                  <AboutUs />
                </ErrorBoundary>
              } />
              <Route path="/test" element={
                <ErrorBoundary level="component">
                  <ComponentTest />
                </ErrorBoundary>
              } />
              <Route path="/family-tree" element={
                <ErrorBoundary level="component">
                  <FamilyTreeDemo />
                </ErrorBoundary>
              } />
              <Route path="/demo" element={
                <ErrorBoundary level="component">
                  <DemoShowcase />
                </ErrorBoundary>
              } />
              <Route path="/demo-presentation" element={
                <ErrorBoundary level="component">
                  <DemoPresentation />
                </ErrorBoundary>
              } />
            </Routes>
          </PageTransition>
        </Layout>
      </Router>
    </ErrorBoundary>
  )
}

export default App
