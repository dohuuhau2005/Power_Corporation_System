import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function PrivateRoute({ children, requiredRole }) {
  const { isAuthenticated, user } = useAuthStore()

  // 1. Nếu chưa đăng nhập -> Đẩy về login (Hợp lý)
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // 2. Đã đăng nhập nhưng check quyền
  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    
    if (!user || !roles.includes(user?.role)) {
      // BẺ GÃY VÒNG LẶP: Không đá về login nữa, in ra lỗi luôn để ứng dụng đứng im.
      return (
        <div style={{ textAlign: 'center', marginTop: '20vh' }}>
          <h2>403 - KHÔNG CÓ QUYỀN TRUY CẬP</h2>
          <p>Tài khoản của bạn (Quyền hiện tại: {user?.role || 'Chưa có'}) không được phép vào trang này.</p>
        </div>
      )
    }
  }

  return children
}