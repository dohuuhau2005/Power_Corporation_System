import { useEffect, useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import Table from '../../components/Table'
import './BillsManagement.css'

export default function BillsManagement() {
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'R_ADMIN'
  
  const [bills, setBills] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showDetail, setShowDetail] = useState(false)
  const [selectedBill, setSelectedBill] = useState(null)

  useEffect(() => {
    fetchBills()
  }, [])

  const fetchBills = async () => {
    try {
      setLoading(true)
      // Simulate API call - thực tế cần endpoint admin xem tất cả bills
      // const response = await api.get('/admin/bills')
      // setBills(response.bills || [])
      
      // Mock data for demo
      setBills([
        {
          SOHDN: 'HDN001',
          THANG: 4,
          NAM: 2026,
          SOHD: 'HD001',
          MANV: 'NV_101',
          SOTIEN: 2500000,
          TENKH: 'Khách Hàng A',
          TENNV: 'Nhân Viên 1'
        }
      ])
    } catch (err) {
      setError('Không thể tải dữ liệu hóa đơn')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetail = (bill) => {
    setSelectedBill(bill)
    setShowDetail(true)
  }

  const columns = [
    { key: 'SOHDN', label: 'Số Hóa Đơn' },
    { key: 'SOHD', label: 'Số Hợp Đồng' },
    { key: 'TENKH', label: 'Tên Khách Hàng' },
    { key: 'THANG', label: 'Tháng' },
    { key: 'NAM', label: 'Năm' },
    {
      key: 'SOTIEN',
      label: 'Số Tiền (VNĐ)',
      render: (value) => new Intl.NumberFormat('vi-VN').format(value)
    }
  ]

  const actions = [
    {
      label: 'Xem Chi Tiết',
      onClick: (row) => handleViewDetail(row)
    }
  ]

  if (loading) return (
    <div className="state-container">
      <div className="loader-pulse"></div>
      <p>Đang tải dữ liệu hóa đơn...</p>
    </div>
  )

  if (error) return (
    <div className="state-container error">
      <p>{error}</p>
      <button onClick={fetchBills} className="btn-retry">Thử lại</button>
    </div>
  )

  return (
    <div className="bills-management">
      <div className="management-header">
        <div className="sm-title-group">
          <div className="icon-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="12" y1="19" x2="12" y2="12"></line>
              <line x1="9" y1="16" x2="15" y2="16"></line>
            </svg>
          </div>
          <div>
            <h2>Quản Lý Hóa Đơn</h2>
            <p className="sm-subtitle">Danh sách toàn bộ hóa đơn thanh toán trong hệ thống</p>
          </div>
        </div>
      </div>

      {showDetail && selectedBill && (
        <div className="detail-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Chi Tiết Hóa Đơn</h3>
              <button className="close-btn" onClick={() => { setShowDetail(false); setSelectedBill(null) }}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <span className="label">Số Hóa Đơn:</span>
                <span className="value">{selectedBill.SOHDN}</span>
              </div>
              <div className="detail-row">
                <span className="label">Số Hợp Đồng:</span>
                <span className="value">{selectedBill.SOHD}</span>
              </div>
              <div className="detail-row">
                <span className="label">Tên Khách Hàng:</span>
                <span className="value">{selectedBill.TENKH}</span>
              </div>
              <div className="detail-row">
                <span className="label">Nhân Viên:</span>
                <span className="value">{selectedBill.TENNV || selectedBill.MANV}</span>
              </div>
              <div className="detail-row">
                <span className="label">Tháng / Năm:</span>
                <span className="value">{selectedBill.THANG}/{selectedBill.NAM}</span>
              </div>
              <div className="detail-row highlight">
                <span className="label">Số Tiền:</span>
                <span className="value">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedBill.SOTIEN)}</span>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => { setShowDetail(false); setSelectedBill(null) }} className="btn-close">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="table-container">
        <Table columns={columns} data={bills} actions={actions} />
      </div>
    </div>
  )
}
