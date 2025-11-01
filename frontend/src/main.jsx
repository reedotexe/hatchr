import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'

import Login from './pages/Login'
import Signup from './pages/Signup'
import Feed from './pages/Feed'
import Profile from './pages/Profile'
import ProjectPage from './pages/Project'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import { useTheme } from './store/useTheme'
import { useEffect } from 'react'

const queryClient = new QueryClient()

function App() {
  const dark = useTheme(state => state.dark)
  useEffect(() => {
    if (dark) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [dark])

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Navbar />
        <div className="max-w-3xl mx-auto mt-6">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
            <Route path="/profile/:username" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/project/:projectId" element={<ProtectedRoute><ProjectPage /></ProtectedRoute>} />
            <Route path="/" element={<Navigate to="/feed" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

createRoot(document.getElementById('root')).render(<App />)
