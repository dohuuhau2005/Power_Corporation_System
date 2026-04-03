import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import './EmployeeLayout.css'

export default function EmployeeLayout({ children }) {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="employee-container">
      <aside className={`employee-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2>PC App</h2>
          <button className="toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            ☰
          </button>
        </div>
        
        <nav className="sidebar-nav">
          <a href="/employee" className="nav-item">📊 Tổng Quan</a>
          <a href="/employee/customers" className="nav-item">👥 Khách Hàng</a>
          <a href="/employee/bills" className="nav-item">📋 Hóa Đơn</a>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <p><strong>{user?.ten}</strong></p>
            <p className="role-badge">{user?.role}</p>
            <p className="branch-info">{user?.chinhanh}</p>
          </div>
          <button onClick={handleLogout} className="logout-btn">🚪 Đăng Xuất</button>
        </div>
      </aside>

      <main className="employee-main">
        <header className="employee-header">
          <div className="header-left">
            <img src="https://via.placeholder.com/40" alt="Logo" className="logo" />
            <h1>Power Corporation - Ứng Dụng Nhân Viên</h1>
          </div>
          <div className="header-right">
            <span className="user-greeting">👋 Xin chào, {user?.ten}</span>
          </div>
        </header>

        <div className="employee-content">
          {children}
        </div>
      </main>
    </div>
  )
}
