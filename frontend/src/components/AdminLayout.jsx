import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { logout as logoutApi } from '../services/api'
import './AdminLayout.css'

export default function AdminLayout({ children }) {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleLogout = async () => {
    try {
      await logoutApi()
    } catch (error) {
      console.error('Lỗi logout:', error)
    } finally {
      logout()
      navigate('/login')
    }
  }

  return (
    <div className="admin-container">
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2>PC Admin</h2>
          <button className="toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            ☰
          </button>
        </div>

        <nav className="sidebar-nav">
          <a href="/admin" className="nav-item">📊 Tổng Quan</a>
          <a href="/admin/sites" className="nav-item">🏢 Chi Nhánh</a>
          <a href="/admin/staffs" className="nav-item">👥 Nhân Viên</a>
          <a href="/admin/contracts" className="nav-item">📄 Hợp Đồng</a>
          <a href="/admin/bills" className="nav-item">📋 Hóa Đơn</a>
          <a href="/admin/work-history" className="nav-item">🕒 Lịch Sử Công Tác</a>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <p><strong>{user?.ten}</strong></p>
            <p className="role-badge">{user?.role}</p>
          </div>
          <button onClick={handleLogout} className="logout-btn">🚪 Đăng Xuất</button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div className="header-left">
            <img src="data:image/jpeg;base64,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" alt="Logo" className="logo" />
            <h1>Power Corporation - Quản Lý Hệ Thống</h1>
          </div>
          <div className="header-right">
            <span className="user-greeting">👋 Xin chào, {user?.ten}</span>
          </div>
        </header>

        <div className="admin-content">
          {children}
        </div>
      </main>
    </div>
  )
}
