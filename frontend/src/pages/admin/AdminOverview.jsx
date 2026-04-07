import { useEffect, useState } from 'react'
import { getCountSites, getCountCustomers, getCountStaff } from '../../services/api'
import StatCard from '../../components/StatCard'
import './AdminOverview.css'

export default function AdminOverview() {
  const [stats, setStats] = useState({
    sites: 0,
    customers: 0,
    staff: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Lấy ngày hiện tại cho Dashboard
  const currentDate = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [sitesRes, customersRes, staffRes] = await Promise.all([
          getCountSites(),
          getCountCustomers(),
          getCountStaff()
        ])

        setStats({
          sites: sitesRes.totalCount || 0,
          customers: customersRes.totalCount || 0,
          staff: staffRes.totalCount || 0
        })
      } catch (err) {
        setError('Lỗi kết nối: Không thể tải dữ liệu thống kê từ máy chủ.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) return (
    <div className="state-container">
      <div className="loader-pulse"></div>
      <p>Đang phân tích dữ liệu tổng quan...</p>
    </div>
  )
  
  if (error) return (
    <div className="state-container error">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
      <p>{error}</p>
    </div>
  )

  /* Các Icon SVG truyền vào StatCard */
  const SiteIcon = <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18"></path><path d="M9 8h1"></path><path d="M9 12h1"></path><path d="M9 16h1"></path><path d="M14 8h1"></path><path d="M14 12h1"></path><path d="M14 16h1"></path><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"></path></svg>;
  const CustomerIcon = <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
  const StaffIcon = <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;

  return (
    <div className="admin-overview">
      <div className="overview-header">
        <div className="header-content">
          <h2>Trung Tâm Điều Hành</h2>
          <p className="overview-subtitle">Hệ thống quản lý lưới điện quốc gia • <strong>{currentDate}</strong></p>
        </div>
        <div className="status-badge">
          <span className="dot pulse"></span>
          Hệ thống hoạt động ổn định
        </div>
      </div>
      
      <div className="stats-grid">
        <StatCard
          title="Trạm Phân Phối"
          value={stats.sites}
          icon={SiteIcon}
          color="var(--power-secondary)"
          link="/admin/sites"
        />
        <StatCard
          title="Hộ Tiêu Thụ Điện"
          value={stats.customers}
          icon={CustomerIcon}
          color="var(--power-accent)"
          link="/admin/customers"
        />
        <StatCard
          title="Cán Bộ Nhân Viên"
          value={stats.staff}
          icon={StaffIcon}
          color="#10b981" /* Màu xanh lá (Green) cho nhân sự */
          link="/admin/staffs"
        />
      </div>

      <div className="info-section">
        <div className="info-header">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
          <h3>Thông Số Hạ Tầng Server</h3>
        </div>
        
        <div className="info-grid">
          <div className="info-card">
            <div className="card-icon blue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>
            </div>
            <div className="card-content">
              <h4>Cấu Trúc CSDL</h4>
              <p>Tổng Bộ → TP1/TP2 → CN1...CN4</p>
            </div>
          </div>
          
          <div className="info-card">
            <div className="card-icon yellow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            </div>
            <div className="card-content">
              <h4>Đồng Bộ Dữ Liệu</h4>
              <p>Tự động & Real-time qua RabbitMQ</p>
            </div>
          </div>
          
          <div className="info-card">
            <div className="card-icon green">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </div>
            <div className="card-content">
              <h4>Bảo Mật Kênh Truyền</h4>
              <p>JWT + RSA + AES-256-CBC</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}