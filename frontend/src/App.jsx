import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react' // Nhớ import useState
import { useAuthStore } from './store/authStore'
import { verifyToken } from './services/api'
import LoginPage from './pages/LoginPage'
import AdminDashboard from './pages/AdminDashboard'
import EmployeeDashboard from './pages/EmployeeDashboard'
import PrivateRoute from './components/PrivateRoute'
import './App.css'

export default function App() {
  const { isAuthenticated, setAuthenticated, user, setUser } = useAuthStore()
  
  // 1. Thêm State này
  const [isChecking, setIsChecking] = useState(true) 

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await verifyToken()
        if (response.success) {
          setAuthenticated(true)
          // 2. PHẢI CẬP NHẬT LẠI USER Ở ĐÂY (Điều chỉnh response.data.data tùy theo API của bạn)
          setUser(response.data.data) 
        } else {
          setAuthenticated(false)
          setUser(null)
        }
      } catch (error) {
        setAuthenticated(false)
        setUser(null)
      } finally {
        setIsChecking(false) // 3. Tắt trạng thái checking
      }
    }

    checkAuth() 
  }, [setAuthenticated, setUser])

  // 4. CHẶN RENDER ROUTER: Nếu đang check, hiển thị màn hình chờ
  if (isChecking) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <h3>Đang kiểm tra đăng nhập...</h3>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} 
        />
        
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
        
        <Route 
          path="/" 
          element={
            isAuthenticated && user 
              ? <Navigate to={user.role === 'R_ADMIN' ? '/admin' : '/employee'} replace /> 
              : <Navigate to="/login" replace />
          } 
        />
      </Routes>
    </Router>
  )
}