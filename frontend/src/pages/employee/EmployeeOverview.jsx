import { useEffect, useState } from 'react'
import { getEmployeeInfo } from '../../services/api'
import './EmployeeOverview.css'

export default function EmployeeOverview() {
  const [employeeInfo, setEmployeeInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const response = await getEmployeeInfo()
        if (response.success && response.staff && response.staff.length > 0) {
          setEmployeeInfo(response.staff[0])
        }
      } catch (err) {
        setError('Không thể tải thông tin nhân viên')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchInfo()
  }, [])

  if (loading) return <div className="loading">Đang tải...</div>
  if (error) return <div className="error">{error}</div>

  return (
    <div className="employee-overview">
      <h2>Thông Tin Cá Nhân</h2>

      {employeeInfo && (
        <div className="info-card">
          <div className="info-row">
            <label>Họ Tên:</label>
            <span>{employeeInfo.hoten}</span>
          </div>
          <div className="info-row">
            <label>Chi Nhánh:</label>
            <span>{employeeInfo.tenCN}</span>
          </div>
          <div className="info-row">
            <label>Mã Chi Nhánh:</label>
            <span>{employeeInfo.maCN}</span>
          </div>
          <div className="info-row">
            <label>Thành Phố:</label>
            <span>{employeeInfo.thanhpho}</span>
          </div>
          <div className="info-row">
            <label>Vai Trò:</label>
            <span className="role-badge">{employeeInfo.role}</span>
          </div>
        </div>
      )}

      <div className="quick-actions">
        <h3>Hành Động Nhanh</h3>
        <div className="actions-grid">
          <a href="/employee/customers" className="action-card">
            <div className="action-icon">👥</div>
            <div className="action-text">
              <h4>Quản Lý Khách Hàng</h4>
              <p>Xem và quản lý danh sách khách hàng</p>
            </div>
          </a>
          <a href="/employee/bills" className="action-card">
            <div className="action-icon">📊</div>
            <div className="action-text">
              <h4>Quản Lý Hóa Đơn</h4>
              <p>Tạo và xem hóa đơn điện</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  )
}
