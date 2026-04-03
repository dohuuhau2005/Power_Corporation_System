import { useEffect, useState } from 'react'
import { getStaffs, createStaff, updateStaff, deleteStaff } from '../../services/api'
import Table from '../../components/Table'
import './StaffsManagement.css'

export default function StaffsManagement() {
  const [staffs, setStaffs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
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
      setError('Không thể tải dữ liệu nhân viên')
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
      setError('Không thể thêm nhân viên: ' + (err.response?.data?.message || err.message))
    }
  }

  const handleDelete = async (maNV) => {
    if (confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) {
      try {
        await deleteStaff(maNV)
        fetchStaffs()
      } catch (err) {
        setError('Không thể xóa nhân viên')
      }
    }
  }

  const columns = [
    { key: 'maNV', label: 'Mã NV' },
    { key: 'hoten', label: 'Họ Tên' },
    { key: 'maCN', label: 'Chi Nhánh' },
    { key: 'role', label: 'Vai Trò' },
    { key: 'status', label: 'Trạng Thái' }
  ]

  const actions = [
    {
      label: 'Xóa',
      onClick: (row) => handleDelete(row.maNV)
    }
  ]

  if (loading) return <div className="loading">Đang tải...</div>
  if (error) return <div className="error">{error}</div>

  return (
    <div className="staffs-management">
      <div className="management-header">
        <h2>Quản Lý Nhân Viên</h2>
        <button
          className="btn-add"
          onClick={() => setShowForm(!showForm)}
        >
          + Thêm Nhân Viên
        </button>
      </div>

      {showForm && (
        <div className="form-box">
          <h3>Thêm Nhân Viên Mới</h3>
          <div className="form-group">
            <label>Mã NV</label>
            <input
              type="text"
              value={formData.maNV}
              onChange={(e) => setFormData({ ...formData, maNV: e.target.value })}
              placeholder="Nhập mã nhân viên"
            />
          </div>
          <div className="form-group">
            <label>Họ Tên</label>
            <input
              type="text"
              value={formData.hoten}
              onChange={(e) => setFormData({ ...formData, hoten: e.target.value })}
              placeholder="Nhập họ tên"
            />
          </div>
          <div className="form-group">
            <label>Chi Nhánh</label>
            <select
              value={formData.maCN}
              onChange={(e) => setFormData({ ...formData, maCN: e.target.value })}
            >
              <option value="CN1">CN1</option>
              <option value="CN2">CN2</option>
              <option value="CN3">CN3</option>
              <option value="CN4">CN4</option>
            </select>
          </div>
          <div className="form-group">
            <label>Vai Trò</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="R_STAFF">Nhân Viên</option>
              <option value="R_MANAGER">Quản Lý</option>
              <option value="R_ADMIN">Admin</option>
            </select>
          </div>
          <div className="form-actions">
            <button onClick={handleAdd} className="btn-save">Thêm</button>
            <button onClick={() => setShowForm(false)} className="btn-cancel">Hủy</button>
          </div>
        </div>
      )}

      <Table columns={columns} data={staffs} actions={actions} />
    </div>
  )
}
