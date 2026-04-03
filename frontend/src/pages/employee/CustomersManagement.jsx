import { useEffect, useState } from 'react'
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import Table from '../../components/Table'
import './CustomersManagement.css'

export default function CustomersManagement() {
  const { user } = useAuthStore()
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    maKH: '',
    tenKH: '',
    maCN: user?.chinhanh || 'CN1',
    thanhpho: user?.ThanhPho || 'TP1'
  })

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const response = await getCustomers()
      setCustomers(response.customers || [])
    } catch (err) {
      setError('Không thể tải dữ liệu khách hàng')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async () => {
    try {
      await createCustomer(formData)
      setFormData({ maKH: '', tenKH: '', maCN: user?.chinhanh || 'CN1', thanhpho: user?.ThanhPho || 'TP1' })
      setShowForm(false)
      fetchCustomers()
    } catch (err) {
      setError('Không thể thêm khách hàng: ' + (err.response?.data?.message || err.message))
    }
  }

  const handleDelete = async (maKH) => {
    if (confirm('Bạn có chắc chắn muốn xóa khách hàng này?')) {
      try {
        await deleteCustomer(maKH)
        fetchCustomers()
      } catch (err) {
        setError('Không thể xóa khách hàng')
      }
    }
  }

  const columns = [
    { key: 'maKH', label: 'Mã KH' },
    { key: 'tenKH', label: 'Tên Khách Hàng' },
    { key: 'maCN', label: 'Chi Nhánh' }
  ]

  const actions = [
    {
      label: 'Xóa',
      onClick: (row) => handleDelete(row.maKH)
    }
  ]

  if (loading) return <div className="loading">Đang tải...</div>
  if (error) return <div className="error">{error}</div>

  return (
    <div className="customers-management">
      <div className="management-header">
        <h2>Quản Lý Khách Hàng</h2>
        <button
          className="btn-add"
          onClick={() => setShowForm(!showForm)}
        >
          + Thêm Khách Hàng
        </button>
      </div>

      {showForm && (
        <div className="form-box">
          <h3>Thêm Khách Hàng Mới</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Mã Khách Hàng</label>
              <input
                type="text"
                value={formData.maKH}
                onChange={(e) => setFormData({ ...formData, maKH: e.target.value })}
                placeholder="Nhập mã khách hàng"
              />
            </div>
            <div className="form-group">
              <label>Tên Khách Hàng</label>
              <input
                type="text"
                value={formData.tenKH}
                onChange={(e) => setFormData({ ...formData, tenKH: e.target.value })}
                placeholder="Nhập tên khách hàng"
              />
            </div>
          </div>
          <div className="form-actions">
            <button onClick={handleAdd} className="btn-save">Thêm</button>
            <button onClick={() => setShowForm(false)} className="btn-cancel">Hủy</button>
          </div>
        </div>
      )}

      <Table columns={columns} data={customers} actions={actions} />
    </div>
  )
}
