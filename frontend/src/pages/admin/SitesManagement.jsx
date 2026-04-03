import { useEffect, useState } from 'react'
import { getSites, updateSite } from '../../services/api'
import Table from '../../components/Table'
import './SitesManagement.css'

export default function SitesManagement() {
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
      setError('Không thể tải dữ liệu chi nhánh')
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
      setError('Không thể cập nhật chi nhánh')
    }
  }

  const columns = [
    { key: 'maCN', label: 'Mã Chi Nhánh' },
    { key: 'tenCN', label: 'Tên Chi Nhánh' },
    { key: 'thanhpho', label: 'Thành Phố' }
  ]

  const actions = [
    {
      label: 'Sửa',
      onClick: (row) => handleEdit(row.maCN, row.tenCN)
    }
  ]

  if (loading) return <div className="loading">Đang tải...</div>
  if (error) return <div className="error">{error}</div>

  return (
    <div className="sites-management">
      <h2>Quản Lý Chi Nhánh</h2>

      {editingId && (
        <div className="edit-modal">
          <div className="modal-content">
            <h3>Cập Nhật Chi Nhánh</h3>
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              placeholder="Nhập tên chi nhánh"
            />
            <div className="modal-actions">
              <button onClick={() => handleSave(editingId)} className="btn-save">Lưu</button>
              <button onClick={() => setEditingId(null)} className="btn-cancel">Hủy</button>
            </div>
          </div>
        </div>
      )}

      <Table columns={columns} data={sites} actions={actions} />
    </div>
  )
}
