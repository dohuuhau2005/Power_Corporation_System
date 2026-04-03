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
        setError('Không thể tải dữ liệu thống kê')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) return <div className="loading">Đang tải...</div>
  if (error) return <div className="error">{error}</div>

  return (
    <div className="admin-overview">
      <h2>Tổng Quan Hệ Thống</h2>
      
      <div className="stats-grid">
        <StatCard
          title="Chi Nhánh"
          value={stats.sites}
          icon="🏢"
          color="#667eea"
          link="/admin/sites"
        />
        <StatCard
          title="Khách Hàng"
          value={stats.customers}
          icon="👥"
          color="#764ba2"
          link="/admin/customers"
        />
        <StatCard
          title="Nhân Viên"
          value={stats.staff}
          icon="👨‍💼"
          color="#f093fb"
          link="/admin/staffs"
        />
      </div>

      <div className="info-section">
        <h3>Thông Tin Hệ Thống</h3>
        <div className="info-grid">
          <div className="info-card">
            <h4>Cấu Trúc Cơ Sở Dữ Liệu</h4>
            <p>Tổng Bộ - TP1 - TP2 - CN1, CN2, CN3, CN4</p>
          </div>
          <div className="info-card">
            <h4>Khôi Phục Dữ Liệu</h4>
            <p>Tự động đồng bộ qua RabbitMQ</p>
          </div>
          <div className="info-card">
            <h4>Bảo Mật</h4>
            <p>JWT + RSA + AES-256-CBC</p>
          </div>
        </div>
      </div>
    </div>
  )
}
