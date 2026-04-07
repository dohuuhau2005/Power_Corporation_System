import { useEffect, useState } from 'react'
import { getSites, updateSite } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import Table from '../../components/Table'
import './SitesManagement.css'

export default function SitesManagement() {
  const { user } = useAuthStore()
  const canEdit = user?.role === 'R_ADMIN' || user?.role === 'R_MANAGER'
  
  const [sites, setSites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState('')

  useEffect(() => {
    fetchSites()
  }, [])

  const fetchSites = async () => {
    try {
      setLoading(true)
      const response = await getSites()
      setSites(response.sites || [])
    } catch (err) {
      setError('Lỗi kết nối: Không thể tải dữ liệu chi nhánh điện lực.')
      console.error(err)
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
      fetchSites()
    } catch (err) {
      setError('Lỗi hệ thống: Không thể cập nhật chi nhánh.')
    }
  }

  const columns = [
    { key: 'MACN', label: 'Mã Chi Nhánh' },
    { key: 'TENCN', label: 'Tên Chi Nhánh (Điện Lực)' },
    { key: 'THANHPHO', label: 'Thành Phố / Khu Vực' }
  ]

  const actions = canEdit ? [
    {
      label: 'Cập nhật',
      onClick: (row) => handleEdit(row.MACN, row.TENCN)
    }
  ] : []

  if (loading) return (
    <div className="state-container">
      <div className="loader-pulse"></div>
      <p>Đang đồng bộ dữ liệu trạm điện...</p>
    </div>
  )
  
  if (error) return (
    <div className="state-container error">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
      <p>{error}</p>
      <button onClick={fetchSites} className="btn-retry">Thử lại</button>
    </div>
  )

  return (
    <div className="sites-management">
      <div className="sm-header">
        <div className="sm-title-group">
          <div className="icon-wrapper">
            {/* Icon tia chớp (Điện) */}
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
            </svg>
          </div>
          <div>
            <h2>Hệ Thống Phân Phối</h2>
            <p className="sm-subtitle">Quản lý danh sách các chi nhánh điện lực</p>
          </div>
        </div>
        <div className="sm-stats">
          <span className="stat-badge">Tổng số: <strong>{sites.length}</strong> trạm</span>
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
        <Table columns={columns} data={sites} actions={actions} />
      </div>
    </div>
  )
}