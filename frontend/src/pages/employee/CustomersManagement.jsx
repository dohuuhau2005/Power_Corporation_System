import { useEffect, useState } from 'react'
import { getCustomers, createCustomer, updateCustomer, deleteCustomer, getCustomerDetail } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
// PERMISSIONS: R_STAFF can create + view, R_MANAGER can edit/delete
import Table from '../../components/Table'
import './CustomersManagement.css'

export default function CustomersManagement() {
  const { user } = useAuthStore()
  const canAdd = user?.role === 'R_STAFF' || user?.role === 'R_MANAGER' || user?.role === 'R_ADMIN'
  const canEdit = user?.role === 'R_MANAGER' || user?.role === 'R_ADMIN'

  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [formData, setFormData] = useState({
    maKH: '',
    tenKH: '',
    maCN: user?.chinhanh || 'CN1',
    thanhpho: user?.ThanhPho || 'TP1',
    SDT: ''
  })

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const response = await getCustomers()
      setCustomers(response.customers || [])
      console.log('✅ Customers loaded:', response.customers?.length || 0)
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

  const handleEdit = (customer) => {
    setFormData({
      maKH: customer.MAKH,
      tenKH: customer.TENKH,
      maCN: customer.MACN || 'CN1',
      thanhpho: customer.THANHPHO || 'TP1',
      SDT: customer.SDT || ''
    })
    setIsEditing(true)
    setShowDetail(false)
  }

  const handleSaveEdit = async () => {
    try {
      await updateCustomer(formData.maKH, {
        tenKH: formData.tenKH,
        maCN: formData.maCN,
        SDT: formData.SDT
      })
      setFormData({ maKH: '', tenKH: '', maCN: user?.chinhanh || 'CN1', thanhpho: user?.ThanhPho || 'TP1', SDT: '' })
      setIsEditing(false)
      fetchCustomers()
      alert('Cập nhật khách hàng thành công!')
    } catch (err) {
      setError('Không thể cập nhật khách hàng: ' + (err.response?.data?.message || err.message))
    }
  }

  const handleViewDetail = async (customer) => {
    try {
      const response = await getCustomerDetail(customer.MAKH)
      setSelectedCustomer(response.customer)
      setShowDetail(true)
    } catch (err) {
      setError('Không thể tải chi tiết: ' + err.message)
    }
  }

  const columns = [
    { key: 'MAKH', label: 'Mã KH' },
    { key: 'TENKH', label: 'Tên Khách Hàng' },
    { key: 'MACN', label: 'Chi Nhánh' }
  ]

  const actions = canEdit ? [
    {
      label: 'Xem Chi Tiết',
      onClick: (row) => handleViewDetail(row)
    },
    {
      label: 'Xóa',
      onClick: (row) => handleDelete(row.MAKH)
    }
  ] : [
    {
      label: 'Xem Chi Tiết',
      onClick: (row) => handleViewDetail(row)
    }
  ]

  if (loading) return <div className="loading">Đang tải...</div>
  if (error) return <div className="error">{error}</div>

  return (
    <div className="customers-management">
      <div className="management-header">
        <h2>Quản Lý Khách Hàng</h2>
        {canAdd && (
          <button
            className="btn-add"
            onClick={() => setShowForm(!showForm)}
          >
            + Thêm Khách Hàng
          </button>
        )}
      </div>

      {showForm && canAdd && (
        <div className="form-box">
          <h3>Thêm Khách Hàng Mới</h3>
          <div className="form-row">

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
          <div className="form-row">
            <div className="form-group">
              <label>Số Điện Thoại</label>
              <input
                type="text"
                value={formData.SDT}
                onChange={(e) => setFormData({ ...formData, SDT: e.target.value })}
                placeholder="Nhập số điện thoại"
              />
            </div>
          </div>
          <div className="form-actions">
            <button onClick={handleAdd} className="btn-save">Thêm</button>
            <button onClick={() => setShowForm(false)} className="btn-cancel">Hủy</button>
          </div>
        </div>
      )}

      {isEditing && (
        <div className="form-box">
          <h3>✎ Chỉnh Sửa Khách Hàng</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Mã Khách Hàng (Không thể sửa)</label>
              <input
                type="text"
                value={formData.maKH}
                disabled
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
          <div className="form-row">
            <div className="form-group">
              <label>Số Điện Thoại</label>
              <input
                type="text"
                value={formData.SDT}
                onChange={(e) => setFormData({ ...formData, SDT: e.target.value })}
                placeholder="Nhập số điện thoại"
              />
            </div>
          </div>
          <div className="form-actions">
            <button onClick={() => { setIsEditing(false); setFormData({ maKH: '', tenKH: '', maCN: user?.chinhanh || 'CN1', thanhpho: user?.ThanhPho || 'TP1', SDT: '' }) }} className="btn-cancel">Hủy</button>
            <button onClick={handleSaveEdit} className="btn-save">Lưu Thay Đổi</button>
          </div>
        </div>
      )}

      {showDetail && selectedCustomer && (
        <div className="detail-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Chi Tiết Khách Hàng</h3>
              <button className="close-btn" onClick={() => { setShowDetail(false); setSelectedCustomer(null) }}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <span className="label">Mã Khách Hàng:</span>
                <span className="value">{selectedCustomer.MAKH}</span>
              </div>
              <div className="detail-row">
                <span className="label">Tên Khách Hàng:</span>
                <span className="value">{selectedCustomer.TENKH}</span>
              </div>
              <div className="detail-row">
                <span className="label">Chi Nhánh:</span>
                <span className="value">{selectedCustomer.TENCN || selectedCustomer.MACN}</span>
              </div>
              <div className="detail-row">
                <span className="label">Thành Phố:</span>
                <span className="value">{selectedCustomer.THANHPHO}</span>
              </div>
              {selectedCustomer.SDT && (
                <div className="detail-row">
                  <span className="label">Số Điện Thoại:</span>
                  <span className="value">{selectedCustomer.SDT}</span>
                </div>
              )}
            </div>
            {canEdit && (
              <div className="modal-footer">
                <button onClick={() => handleEdit(selectedCustomer)} className="btn-edit">
                  ✎ Chỉnh Sửa
                </button>
                <button onClick={() => { setShowDetail(false); setSelectedCustomer(null) }} className="btn-close">
                  Đóng
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <Table columns={columns} data={customers} actions={actions} />
    </div>
  )
}

