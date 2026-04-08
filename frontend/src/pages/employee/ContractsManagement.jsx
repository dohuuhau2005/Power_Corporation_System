import { useEffect, useState } from 'react'
import {
  getContracts,
  getContractDetail,
  createContract,
  updateContract,
  deleteContract,
  payContract,
  getCustomers
} from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import Table from '../../components/Table'
import './ContractsManagement.css'

export default function ContractsManagement() {
  const { user } = useAuthStore()
  const canAdd = user?.role === 'R_STAFF' || user?.role === 'R_MANAGER' || user?.role === 'R_ADMIN'
  const canEdit = user?.role === 'R_MANAGER' || user?.role === 'R_ADMIN'

  const [contracts, setContracts] = useState([])
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedContract, setSelectedContract] = useState(null)
  const [formData, setFormData] = useState({
    maKH: '',
    soDienKe: '',
    kwDinhMuc: '',
    dongiaKW: ''
  })
  const [editData, setEditData] = useState({
    soDienKe: '',
    kwDinhMuc: '',
    dongiaKW: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [contractsRes, customersRes] = await Promise.all([
        getContracts(),
        getCustomers(),

      ])
      setContracts(contractsRes.contracts || [])
      setCustomers(customersRes.customers || [])
    } catch (err) {
      setError('Không thể tải dữ liệu')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddContract = async () => {
    if (!formData.maKH || !formData.soDienKe || !formData.kwDinhMuc || !formData.dongiaKW) {
      setError('Vui lòng điền đầy đủ thông tin')
      return
    }
    try {
      await createContract(formData)
      setFormData({
        maKH: '',
        soDienKe: '',
        kwDinhMuc: '',
        dongiaKW: ''
      })
      setShowForm(false)
      setError('')
      alert('Tạo hợp đồng thành công!')
      window.location.reload()
    } catch (err) {
      setError('Không thể thêm hợp đồng: ' + (err.response?.data?.message || err.message))
    }
  }

  const handleDeleteContract = async (soHD) => {
    if (confirm('Bạn có chắc chắn muốn xóa hợp đồng này?')) {
      try {
        await deleteContract(soHD)
        alert('Xóa hợp đồng thành công!')
        window.location.reload()
      } catch (err) {
        setError('Không thể xóa hợp đồng')
      }
    }
  }

  const handleViewDetail = async (contract) => {
    try {
      const response = await getContractDetail(contract.SOHD)
      setSelectedContract(response.contract)
      setEditData({
        soDienKe: response.contract.SODIENKE || '',
        kwDinhMuc: response.contract.KWDINHMUC || '',
        dongiaKW: response.contract.DONGIAKW || ''
      })
      setShowDetail(true)
    } catch (err) {
      setError('Không thể tải chi tiết: ' + err.message)
    }
  }

  const handleEdit = (contract) => {
    setEditData({
      soDienKe: contract.SODIENKE || '',
      kwDinhMuc: contract.KWDINHMUC || '',
      dongiaKW: contract.DONGIAKW || ''
    })
    setIsEditing(true)
  }

  const handleSaveEdit = async () => {
    try {
      if (!selectedContract) return

      const updateData = {}
      if (editData.soDienKe && editData.soDienKe !== selectedContract.SODIENKE) {
        updateData.soDienKe = editData.soDienKe
      }
      if (editData.kwDinhMuc && editData.kwDinhMuc !== selectedContract.KWDINHMUC) {
        updateData.kwDinhMuc = editData.kwDinhMuc
      }
      if (editData.dongiaKW && editData.dongiaKW !== selectedContract.DONGIAKW) {
        updateData.dongiaKW = editData.dongiaKW
      }

      await updateContract(selectedContract.SOHD, updateData)
      setIsEditing(false)
      setShowDetail(false)
      setSelectedContract(null)
      alert('Cập nhật hợp đồng thành công!')
      window.location.reload()
    } catch (err) {
      setError('Không thể cập nhật hợp đồng: ' + (err.response?.data?.message || err.message))
    }
  }

  const handlePayContract = async () => {
    if (!selectedContract) return

    const soTien = prompt('Nhập số tiền thanh toán:')
    if (!soTien || isNaN(soTien)) {
      setError('Số tiền không hợp lệ')
      return
    }

    try {
      await payContract(selectedContract.SOHD, { soTien: parseFloat(soTien) })
      setShowDetail(false)
      setSelectedContract(null)
      alert('Thanh toán hợp đồng thành công!')
      window.location.reload()
    } catch (err) {
      setError('Không thể thanh toán hợp đồng: ' + (err.response?.data?.message || err.message))
    }
  }

  const columns = [
    { key: 'SOHD', label: 'Số Hợp Đồng' },
    { key: 'TENKH', label: 'Tên Khách Hàng' },
    { key: 'SODIENKE', label: 'Số Điện Kế' },
    { key: 'KWDINHMUC', label: 'Định Mức KW' },
    {
      key: 'ISPAID',
      label: 'Trạng Thái',
      render: (value) => value === 1 || value === '1' ? '✓ Đã Thanh Toán' : '✕ Chưa Thanh Toán'
    }
  ]

  const actions = [
    {
      label: 'Xem Chi Tiết',
      onClick: (row) => handleViewDetail(row)
    },
    ...(canEdit ? [
      {
        label: 'Xóa',
        onClick: (row) => handleDeleteContract(row.SOHD)
      }
    ] : [])
  ]

  if (loading) return <div className="loading">Đang tải...</div>
  if (error) return (
    <div className="error-container">
      <div className="error">{error}</div>
      <button onClick={() => setError('')}>Đóng</button>
    </div>
  )

  return (
    <div className="contracts-management">
      <div className="management-header">
        <h2>Quản Lý Hợp Đồng</h2>
        {canAdd && (
          <button
            className="btn-add"
            onClick={() => setShowForm(!showForm)}
          >
            + Tạo Hợp Đồng
          </button>
        )}
      </div>

      {showForm && canAdd && (
        <div className="form-box">
          <h3>Tạo Hợp Đồng Mới</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Chọn Khách Hàng *</label>
              <select
                value={formData.maKH}
                onChange={(e) => setFormData({ ...formData, maKH: e.target.value })}
              >
                <option value="">-- Chọn Khách Hàng --</option>
                {customers.map(customer => (
                  <option key={customer.MAKH} value={customer.MAKH}>
                    {customer.TENKH} ({customer.MAKH})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Số Điện Kế *</label>
              <input
                type="text"
                value={formData.soDienKe}
                onChange={(e) => setFormData({ ...formData, soDienKe: e.target.value })}
                placeholder="Nhập số điện kế"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Định Mức KW *</label>
              <input
                type="number"
                value={formData.kwDinhMuc}
                onChange={(e) => setFormData({ ...formData, kwDinhMuc: e.target.value })}
                placeholder="Nhập định mức KW"
              />
            </div>
            <div className="form-group">
              <label>Đơn Giá KW *</label>
              <input
                type="number"
                value={formData.dongiaKW}
                onChange={(e) => setFormData({ ...formData, dongiaKW: e.target.value })}
                placeholder="Nhập đơn giá KW"
              />
            </div>
          </div>
          <div className="form-actions">
            <button onClick={handleAddContract} className="btn-save">Tạo Hợp Đồng</button>
            <button onClick={() => setShowForm(false)} className="btn-cancel">Hủy</button>
          </div>
        </div>
      )}

      {showDetail && selectedContract && !isEditing && (
        <div className="detail-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Chi Tiết Hợp Đồng</h3>
              <button className="close-btn" onClick={() => { setShowDetail(false); setSelectedContract(null) }}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <span className="label">Số Hợp Đồng:</span>
                <span className="value">{selectedContract.SOHD}</span>
              </div>
              <div className="detail-row">
                <span className="label">Tên Khách Hàng:</span>
                <span className="value">{selectedContract.TENKH}</span>
              </div>
              <div className="detail-row">
                <span className="label">Số Điện Kế:</span>
                <span className="value">{selectedContract.SODIENKE}</span>
              </div>
              <div className="detail-row">
                <span className="label">Định Mức KW:</span>
                <span className="value">{selectedContract.KWDINHMUC}</span>
              </div>
              <div className="detail-row">
                <span className="label">Đơn Giá KW:</span>
                <span className="value">{selectedContract.DONGIAKW}</span>
              </div>
              <div className="detail-row">
                <span className="label">Trạng Thái Thanh Toán:</span>
                <span className={`value ${selectedContract.ISPAID === 1 || selectedContract.ISPAID === '1' ? 'paid' : 'unpaid'}`}>
                  {selectedContract.ISPAID === 1 || selectedContract.ISPAID === '1' ? '✓ Đã Thanh Toán' : '✕ Chưa Thanh Toán'}
                </span>
              </div>
              {selectedContract.TENCN && (
                <div className="detail-row">
                  <span className="label">Chi Nhánh:</span>
                  <span className="value">{selectedContract.TENCN}</span>
                </div>
              )}
              {selectedContract.THANHPHO && (
                <div className="detail-row">
                  <span className="label">Thành Phố:</span>
                  <span className="value">{selectedContract.THANHPHO}</span>
                </div>
              )}
            </div>
            <div className="modal-footer">
              {(!selectedContract.ISPAID || selectedContract.ISPAID === 0 || selectedContract.ISPAID === '0') && (
                <button onClick={handlePayContract} className="btn-pay">
                  💳 Thanh Toán Hợp Đồng
                </button>
              )}
              {canEdit && (
                <button onClick={() => handleEdit(selectedContract)} className="btn-edit">
                  ✎ Chỉnh Sửa
                </button>
              )}
              <button onClick={() => { setShowDetail(false); setSelectedContract(null) }} className="btn-close">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditing && selectedContract && (
        <div className="detail-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>✎ Chỉnh Sửa Hợp Đồng</h3>
              <button className="close-btn" onClick={() => setIsEditing(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Số Hợp Đồng (Không thể sửa)</label>
                  <input
                    type="text"
                    value={selectedContract.SOHD}
                    disabled
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Số Điện Kế</label>
                  <input
                    type="text"
                    value={editData.soDienKe}
                    onChange={(e) => setEditData({ ...editData, soDienKe: e.target.value })}
                    placeholder="Nhập số điện kế"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Định Mức KW</label>
                  <input
                    type="number"
                    value={editData.kwDinhMuc}
                    onChange={(e) => setEditData({ ...editData, kwDinhMuc: e.target.value })}
                    placeholder="Nhập định mức KW"
                  />
                </div>
                <div className="form-group">
                  <label>Đơn Giá KW</label>
                  <input
                    type="number"
                    value={editData.dongiaKW}
                    onChange={(e) => setEditData({ ...editData, dongiaKW: e.target.value })}
                    placeholder="Nhập đơn giá KW"
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => { setIsEditing(false); setEditData({ soDienKe: '', kwDinhMuc: '', dongiaKW: '' }) }} className="btn-cancel">
                Hủy
              </button>
              <button onClick={handleSaveEdit} className="btn-save">
                Lưu Thay Đổi
              </button>
            </div>
          </div>
        </div>
      )}

      <Table columns={columns} data={contracts} actions={actions} />
    </div>
  )
}
