import { useEffect, useState } from 'react'
import { getStaffs, createStaff, updateStaff, deleteStaff, getStaffDetail } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import Table from '../../components/Table'
import './StaffsManagement.css'

export default function StaffsManagement() {
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'R_ADMIN'
  
  const [staffs, setStaffs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState(null)
  const [formData, setFormData] = useState({
    maNV: '',
    hoten: '',
    maCN: 'CN1',
    role: 'R_STAFF'
  })

  useEffect(() => {
    fetchStaffs()
  }, [])

  const fetchStaffs = async () => {
    try {
      setLoading(true)
      const response = await getStaffs()
      setStaffs(response.staffs || [])
    } catch (err) {
      setError('Lỗi kết nối: Không thể tải dữ liệu nhân sự.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async () => {
    try {
      await createStaff(formData)
      setFormData({ maNV: '', hoten: '', maCN: 'CN1', role: 'R_STAFF' })
      setShowForm(false)
      fetchStaffs()
    } catch (err) {
      setError('Lỗi hệ thống: Không thể thêm nhân viên. ' + (err.response?.data?.message || err.message))
    }
  }

  const handleDelete = async (maNV) => {
    if (confirm('Cảnh báo: Bạn có chắc chắn muốn xóa hồ sơ nhân viên này khỏi hệ thống?')) {
      try {
        await deleteStaff(maNV)
        fetchStaffs()
      } catch (err) {
        setError('Lỗi phân quyền: Không thể xóa nhân viên này.')
      }
    }
  }

  const handleEdit = (staff) => {
    setFormData({
      maNV: staff.MANV,
      hoten: staff.HOTEN,
      maCN: staff.MACN || 'CN1',
      role: staff.ROLE || 'R_STAFF'
    })
    setIsEditing(true)
    setShowDetail(false)
  }

  const handleSaveEdit = async () => {
    try {
      await updateStaff(formData.maNV, {
        hoten: formData.hoten,
        maCN: formData.maCN,
        role: formData.role
      })
      setFormData({ maNV: '', hoten: '', maCN: 'CN1', role: 'R_STAFF' })
      setIsEditing(false)
      fetchStaffs()
      alert('Cập nhật nhân viên thành công!')
    } catch (err) {
      setError('Lỗi hệ thống: Không thể cập nhật nhân viên. ' + (err.response?.data?.message || err.message))
    }
  }

  const handleViewDetail = async (staff) => {
    try {
      const response = await getStaffDetail(staff.MANV)
      setSelectedStaff(response.staff)
      setShowDetail(true)
    } catch (err) {
      setError('Không thể tải chi tiết: ' + err.message)
    }
  }

  const columns = [
    { key: 'MANV', label: 'Mã Cán Bộ' },
    { key: 'HOTEN', label: 'Họ Tên Nhân Viên' },
    { key: 'MACN', label: 'Trạm / Chi Nhánh' },
    { key: 'ROLE', label: 'Cấp Bậc (Vai Trò)' },
    { key: 'STATUS', label: 'Trạng Thái Hoạt Động' }
  ]

  const actions = isAdmin ? [
    {
      label: 'Xem Chi Tiết',
      onClick: (row) => handleViewDetail(row)
    },
    {
      label: 'Xóa hồ sơ',
      onClick: (row) => handleDelete(row.MANV)
    }
  ] : []

  if (loading) return (
    <div className="state-container">
      <div className="loader-pulse"></div>
      <p>Đang đồng bộ hồ sơ nhân sự...</p>
    </div>
  )
  
  if (error) return (
    <div className="state-container error">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
      <p>{error}</p>
      <button onClick={fetchStaffs} className="btn-retry">Thử lại</button>
    </div>
  )

  return (
    <div className="staffs-management">
      <div className="management-header">
        <div className="sm-title-group">
          <div className="icon-wrapper">
            {/* Icon Group Users */}
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div>
            <h2>Quản Trị Nhân Sự</h2>
            <p className="sm-subtitle">Danh sách cán bộ và nhân viên điện lực</p>
          </div>
        </div>
        
        {isAdmin && (
          <button className="btn-add" onClick={() => setShowForm(!showForm)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            {showForm ? 'Đóng Biểu Mẫu' : 'Thêm Nhân Sự'}
          </button>
        )}
      </div>

      {showForm && isAdmin && (
        <div className="form-box fade-in-down">
          <div className="form-box-header">
            <h3>Đăng Ký Nhân Sự Mới</h3>
          </div>
          
          <div className="form-grid">
            <div className="form-group">
              <label>Mã Nhân Viên (ID)</label>
              <input
                type="text"
                value={formData.maNV}
                onChange={(e) => setFormData({ ...formData, maNV: e.target.value })}
                placeholder="VD: NV10234..."
                autoFocus
              />
            </div>
            
            <div className="form-group">
              <label>Họ và Tên</label>
              <input
                type="text"
                value={formData.hoten}
                onChange={(e) => setFormData({ ...formData, hoten: e.target.value })}
                placeholder="Nhập đầy đủ họ tên..."
              />
            </div>
            
            <div className="form-group">
              <label>Đơn Vị Công Tác (Chi Nhánh)</label>
              <select
                value={formData.maCN}
                onChange={(e) => setFormData({ ...formData, maCN: e.target.value })}
              >
                <option value="CN1">CN1 - Điện lực Trung Tâm</option>
                <option value="CN2">CN2 - Điện lực Phía Bắc</option>
                <option value="CN3">CN3 - Điện lực Phía Nam</option>
                <option value="CN4">CN4 - Điện lực Ngoại Ô</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Chức Vụ / Phân Quyền</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="R_STAFF">Nhân Viên Thu Tiền / Kỹ Thuật</option>
                <option value="R_MANAGER">Quản Lý Trạm</option>
                <option value="R_ADMIN">Quản Trị Viên Hệ Thống</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button onClick={() => setShowForm(false)} className="btn-cancel">Hủy thao tác</button>
            <button onClick={handleAdd} className="btn-save">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
              Lưu Hồ Sơ
            </button>
          </div>
        </div>
      )}

      {isEditing && (
        <div className="form-box fade-in-down">
          <div className="form-box-header">
            <h3>✎ Chỉnh Sửa Thông Tin Nhân Viên</h3>
          </div>
          
          <div className="form-grid">
            <div className="form-group">
              <label>Mã Nhân Viên (ID) - Không thể sửa</label>
              <input
                type="text"
                value={formData.maNV}
                disabled
              />
            </div>
            
            <div className="form-group">
              <label>Họ và Tên</label>
              <input
                type="text"
                value={formData.hoten}
                onChange={(e) => setFormData({ ...formData, hoten: e.target.value })}
                placeholder="Nhập đầy đủ họ tên..."
              />
            </div>
            
            <div className="form-group">
              <label>Đơn Vị Công Tác (Chi Nhánh)</label>
              <select
                value={formData.maCN}
                onChange={(e) => setFormData({ ...formData, maCN: e.target.value })}
              >
                <option value="CN1">CN1 - Điện lực Trung Tâm</option>
                <option value="CN2">CN2 - Điện lực Phía Bắc</option>
                <option value="CN3">CN3 - Điện lực Phía Nam</option>
                <option value="CN4">CN4 - Điện lực Ngoại Ô</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Chức Vụ / Phân Quyền</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="R_STAFF">Nhân Viên Thu Tiền / Kỹ Thuật</option>
                <option value="R_MANAGER">Quản Lý Trạm</option>
                <option value="R_ADMIN">Quản Trị Viên Hệ Thống</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button onClick={() => { setIsEditing(false); setFormData({ maNV: '', hoten: '', maCN: 'CN1', role: 'R_STAFF' }) }} className="btn-cancel">Hủy thao tác</button>
            <button onClick={handleSaveEdit} className="btn-save">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
              Lưu Thay Đổi
            </button>
          </div>
        </div>
      )}

      {showDetail && selectedStaff && (
        <div className="detail-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Chi Tiết Nhân Viên</h3>
              <button className="close-btn" onClick={() => { setShowDetail(false); setSelectedStaff(null) }}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <span className="label">Mã Nhân Viên:</span>
                <span className="value">{selectedStaff.MANV}</span>
              </div>
              <div className="detail-row">
                <span className="label">Họ Tên:</span>
                <span className="value">{selectedStaff.HOTEN}</span>
              </div>
              <div className="detail-row">
                <span className="label">Chi Nhánh:</span>
                <span className="value">{selectedStaff.TENCN || selectedStaff.MACN}</span>
              </div>
              <div className="detail-row">
                <span className="label">Thành Phố:</span>
                <span className="value">{selectedStaff.THANHPHO}</span>
              </div>
              <div className="detail-row">
                <span className="label">Vai Trò:</span>
                <span className="value" style={{ color: selectedStaff.ROLE === 'R_ADMIN' ? 'red' : selectedStaff.ROLE === 'R_MANAGER' ? 'orange' : 'blue' }}>
                  {selectedStaff.ROLE}
                </span>
              </div>
              <div className="detail-row">
                <span className="label">Trạng Thái:</span>
                <span className="value" style={{ color: selectedStaff.STATUS === 1 ? 'green' : 'red' }}>
                  {selectedStaff.STATUS === 1 ? '✓ Hoạt Động' : '✗ Không Hoạt Động'}
                </span>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => handleEdit(selectedStaff)} className="btn-edit">
                ✎ Chỉnh Sửa
              </button>
              <button onClick={() => { setShowDetail(false); setSelectedStaff(null) }} className="btn-close">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="table-container">
        <Table columns={columns} data={staffs} actions={actions} />
      </div>
    </div>
  )
}