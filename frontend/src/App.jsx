import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from './store/authStore'
import { verifyToken } from './services/api'
import LoginPage from './pages/LoginPage'
import AdminDashboard from './pages/AdminDashboard'
import EmployeeDashboard from './pages/EmployeeDashboard'
import PrivateRoute from './components/PrivateRoute'
import './App.css'

export default function App() {
  const { isAuthenticated, setAuthenticated, user } = useAuthStore()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await verifyToken()
        if (response.success) {
          setAuthenticated(true)
        }
      } catch (error) {
        setAuthenticated(false)
      }
    }

    checkAuth()
  }, [setAuthenticated])

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route
          path="/admin/*"
          element={
            <PrivateRoute requiredRole="R_ADMIN">
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        
        <Route
          path="/employee/*"
          element={
            <PrivateRoute requiredRole={['R_STAFF', 'R_MANAGER', 'R_ADMIN']}>
              <EmployeeDashboard />
            </PrivateRoute>
          }
        />
        
        <Route path="/" element={isAuthenticated ? <Navigate to={user?.role === 'R_ADMIN' ? '/admin' : '/employee'} /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  )
}
