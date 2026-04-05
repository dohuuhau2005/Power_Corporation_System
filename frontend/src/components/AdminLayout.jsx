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
            <img src="https://via.placeholder.com/40" alt="Logo" className="logo" />
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
