import { useEffect, useState } from 'react'
import { getWorkHistory, updateSite } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import Table from '../../components/Table'
import './SitesManagement.css'

export default function WorkHistory() {
  const { user } = useAuthStore()
  const canEdit = user?.role === 'R_ADMIN' || user?.role === 'R_MANAGER'

  const [lichSuNhanVien, setLichSuNhanVien] = useState([])
  const [lichSuKhachHang, setLichSuKhachHang] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState('')

  useEffect(() => {
    fetchWorkHistory()
  }, [])

  const fetchWorkHistory = async () => {
    try {
      setLoading(true)
      const response = await getWorkHistory()
      console.log('Full response from API:', response)

      // Handle different response formats
      if (response && response.lichSuNhanVien && response.lichSuKhachHang) {
        setLichSuNhanVien(response.lichSuNhanVien || [])
        setLichSuKhachHang(response.lichSuKhachHang || [])
        console.log('✅ Data loaded successfully:', response.lichSuNhanVien.length, 'staff records,', response.lichSuKhachHang.length, 'customer records')
      } else if (response && Array.isArray(response)) {
        setLichSuNhanVien(response)
        console.log('✅ Data is array:', response.length, 'records')
      } else {
        console.warn('⚠️ Unexpected response format:', response)
        setLichSuNhanVien([])
        setLichSuKhachHang([])
      }
    } catch (err) {
      setError('Lỗi kết nối: Không thể tải dữ liệu lịch sử công tác. ' + (err.response?.data?.message || err.message))
      console.error('❌ Error fetching work history:', err.response?.data || err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (id, currentName) => {
    setEditingId(id)
    setEditValue(currentName)
  }

  const handleSave = async (id) => {
    try {
      await updateSite(id, { tenCN: editValue })
      setEditingId(null)
      fetchWorkHistory()
    } catch (err) {
      setError('Lỗi hệ thống: Không thể cập nhật chi nhánh.')
    }
  }

  const staffColumns = [
    { key: 'MACNCU', label: 'Chi Nhánh Cũ' },
    { key: 'MACNMOI', label: 'Chi Nhánh Mới' },
    { key: 'MANV', label: 'Mã Nhân Viên' },
    { key: 'NGAYCHUYEN', label: 'Ngày Chuyển' }
  ]

  const customerColumns = [
    { key: 'MACNCU', label: 'Chi Nhánh Cũ' },
    { key: 'MACNMOI', label: 'Chi Nhánh Mới' },
    { key: 'MAKH', label: 'Mã Khách Hàng' },
    { key: 'NGAYCHUYEN', label: 'Ngày Chuyển' }
  ]

  const actions = []

  if (loading) return (
    <div className="state-container">
      <div className="loader-pulse"></div>
      <p>Đang đồng bộ dữ liệu lịch sử công tác...</p>
    </div>
  )

  if (error) return (
    <div className="state-container error">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
      <p>{error}</p>
      <button onClick={fetchWorkHistory} className="btn-retry">Thử lại</button>
    </div>
  )

  return (
    <div className="sites-management">
      {/* Staff Work History Section */}
      <div className="sm-header">
        <div className="sm-title-group">
          <div className="icon-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <div>
            <h2>Lịch Sử Công Tác - Nhân Viên</h2>
            <p className="sm-subtitle">Theo dõi các chuyển công tác của nhân viên</p>
          </div>
        </div>
        <div className="sm-stats">
          <span className="stat-badge">Tổng số: <strong>{lichSuNhanVien.length}</strong> bản ghi</span>
        </div>
      </div>

      <div className="table-container">
        <Table columns={staffColumns} data={lichSuNhanVien} />
      </div>

      {/* Customer Work History Section */}
      <div className="sm-header" style={{ marginTop: '40px' }}>
        <div className="sm-title-group">
          <div className="icon-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-5-3.87m-4 0a4 4 0 0 0-5 3.87v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <circle cx="15" cy="11" r="3"></circle>
            </svg>
          </div>
          <div>
            <h2>Lịch Sử Công Tác - Khách Hàng</h2>
            <p className="sm-subtitle">Theo dõi các chuyển công tác của khách hàng</p>
          </div>
        </div>
        <div className="sm-stats">
          <span className="stat-badge">Tổng số: <strong>{lichSuKhachHang.length}</strong> bản ghi</span>
        </div>
      </div>

      {editingId && (
        <div className="edit-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Cấu Hình Chi Nhánh</h3>
              <button className="btn-close" onClick={() => setEditingId(null)}>&times;</button>
            </div>

            <div className="modal-body">
              <label>Tên chi nhánh mới</label>
              <div className="input-group">
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  placeholder="Nhập tên chi nhánh điện lực..."
                  autoFocus
                />
              </div>
            </div>

            <div className="modal-actions">
              <button onClick={() => setEditingId(null)} className="btn-cancel">Hủy bỏ</button>
              <button onClick={() => handleSave(editingId)} className="btn-save">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                Lưu Thay Đổi
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="table-container">
        <Table columns={customerColumns} data={lichSuKhachHang} />
      </div>
    </div>
  )
}