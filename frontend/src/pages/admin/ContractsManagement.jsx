import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getContracts,
  getContractsByPhone,
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

const emptyFormData = {
  maKH: '',
  soDienKe: '',
  kwDinhMuc: '',
  dongiaKW: ''
}

const emptyEditData = {
  soDienKe: '',
  kwDinhMuc: '',
  dongiaKW: ''
}

const emptyPayData = {
  soTien: ''
}

export default function ContractsManagement() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const canManage = user?.role === 'R_ADMIN' || user?.role === 'R_MANAGER'
  const canPay = user?.role === 'R_STAFF' || user?.role === 'R_MANAGER' || user?.role === 'R_ADMIN'

  const [contracts, setContracts] = useState([])
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedContract, setSelectedContract] = useState(null)
  const [formData, setFormData] = useState(emptyFormData)
  const [editData, setEditData] = useState(emptyEditData)
  const [payData, setPayData] = useState(emptyPayData)
  const [searchPhone, setSearchPhone] = useState('')
  const [isSearchMode, setIsSearchMode] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const isPaidContract = (contract) => contract?.ISPAID === 1 || contract?.ISPAID === '1' || contract?.THANHTOAN === 1 || contract?.THANHTOAN === '1'

  const formatDate = (value) => {
    if (!value) return '--'
    return new Date(value).toLocaleDateString('vi-VN')
  }

  const formatCurrency = (value) => {
    if (value === null || value === undefined || value === '') return '--'
    return `${Number.parseInt(value, 10).toLocaleString('vi-VN')} VNĐ`
  }

  const fetchData = async () => {
    try {
      setLoading(true)
      const [contractsRes, customersRes] = await Promise.all([
        getContracts(),
        getCustomers()
      ])
      setContracts(contractsRes.contracts || [])
      setCustomers(customersRes.customers || [])
      setError('')
      setIsSearchMode(false)
      setSearchPhone('')
    } catch (err) {
      setError('Không thể tải dữ liệu hợp đồng: ' + (err.response?.data?.message || err.message || 'Lỗi hệ thống'))
    } finally {
      setLoading(false)
    }
  }

  const handleSearchByPhone = async () => {
    if (!searchPhone.trim()) {
      setError('Vui lòng nhập số điện thoại')
      return
    }

    try {
      setLoading(true)
      const response = await getContractsByPhone(searchPhone)
      setContracts(response.contracts || [])
      setIsSearchMode(true)
      setError('')
    } catch (err) {
      setError('Không thể tìm kiếm hợp đồng: ' + (err.response?.data?.message || err.message || 'Lỗi hệ thống'))
      setContracts([])
    } finally {
      setLoading(false)
    }
  }

  const handleResetSearch = () => {
    setSearchPhone('')
    setIsSearchMode(false)
    fetchData()
  }

  const resetCreateForm = () => {
    setFormData(emptyFormData)
    setShowForm(false)
  }

  const closeDetailModal = () => {
    setShowDetail(false)
    setIsEditing(false)
    setSelectedContract(null)
    setEditData(emptyEditData)
    setPayData(emptyPayData)
  }

  const handleViewBills = () => {
    if (!selectedContract) return
    closeDetailModal()
    const basePath = user?.role === 'R_ADMIN' ? '/admin/bills' : '/employee/bills'
    navigate(basePath, { state: { soHD: selectedContract.SOHD } })
  }

  const handleAddContract = async () => {
    if (!formData.maKH || !formData.soDienKe || !formData.kwDinhMuc || !formData.dongiaKW) {
      setError('Vui lòng điền đầy đủ thông tin hợp đồng')
      return
    }

    if (Number(formData.kwDinhMuc) <= 0) {
      setError('Định mức kW phải lớn hơn 0')
      return
    }

    if (Number(formData.dongiaKW) <= 1000) {
      setError('Đơn giá kW phải lớn hơn 1000')
      return
    }

    try {
      await createContract(formData)
      resetCreateForm()
      await fetchData()
      alert('Tạo hợp đồng thành công!')
    } catch (err) {
      setError('Không thể tạo hợp đồng: ' + (err.response?.data?.message || err.message))
    }
  }

  const handleDeleteContract = async (soHD) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa hợp đồng này?')) {
      return
    }

    try {
      await deleteContract(soHD)
      if (selectedContract?.SOHD === soHD) {
        closeDetailModal()
      }
      await fetchData()
      alert('Xóa hợp đồng thành công!')
    } catch (err) {
      setError('Không thể xóa hợp đồng: ' + (err.response?.data?.message || err.message))
    }
  }

  const handleViewDetail = async (contract) => {
    try {
      const response = await getContractDetail(contract.SOHD)
      const contractDetail = response.contract

      setSelectedContract(contractDetail)
      setEditData({
        soDienKe: contractDetail.SODIENKE || '',
        kwDinhMuc: contractDetail.KWDINHMUC || '',
        dongiaKW: contractDetail.DONGIAKW || ''
      })
      setPayData(emptyPayData)
      setIsEditing(false)
      setShowDetail(true)
      setError('')
    } catch (err) {
      setError('Không thể tải chi tiết hợp đồng: ' + (err.response?.data?.message || err.message))
    }
  }

  const handleEdit = () => {
    if (!selectedContract) {
      return
    }

    setEditData({
      soDienKe: selectedContract.SODIENKE || '',
      kwDinhMuc: selectedContract.KWDINHMUC || '',
      dongiaKW: selectedContract.DONGIAKW || ''
    })
    setIsEditing(true)
  }

  const handleSaveEdit = async () => {
    if (!selectedContract) {
      return
    }

    if (editData.kwDinhMuc && Number(editData.kwDinhMuc) <= 0) {
      setError('Định mức kW phải lớn hơn 0')
      return
    }

    if (editData.dongiaKW && Number(editData.dongiaKW) <= 1000) {
      setError('Đơn giá kW phải lớn hơn 1000')
      return
    }

    const updateData = {}

    if (editData.soDienKe && editData.soDienKe !== selectedContract.SODIENKE) {
      updateData.soDienKe = editData.soDienKe
    }

    if (editData.kwDinhMuc && String(editData.kwDinhMuc) !== String(selectedContract.KWDINHMUC)) {
      updateData.kwDinhMuc = editData.kwDinhMuc
    }

    if (editData.dongiaKW && String(editData.dongiaKW) !== String(selectedContract.DONGIAKW)) {
      updateData.dongiaKW = editData.dongiaKW
    }

    if (Object.keys(updateData).length === 0) {
      setIsEditing(false)
      return
    }

    try {
      await updateContract(selectedContract.SOHD, updateData)
      const response = await getContractDetail(selectedContract.SOHD)
      setSelectedContract(response.contract)
      setIsEditing(false)
      await fetchData()
      alert('Cập nhật hợp đồng thành công!')
    } catch (err) {
      setError('Không thể cập nhật hợp đồng: ' + (err.response?.data?.message || err.message))
    }
  }

  const handlePayContract = async () => {
    if (!selectedContract) {
      return
    }

    if (!payData.soTien || Number.isNaN(Number(payData.soTien))) {
      setError('Vui lòng nhập số tiền thanh toán hợp lệ')
      return
    }

    if (Number(soTien) <= 1000) {
      setError('Số tiền thanh toán phải lớn hơn 1000')
      return
    }
    try {
      await payContract(selectedContract.SOHD, { soTien: Number(payData.soTien) })
      const response = await getContractDetail(selectedContract.SOHD)
      setSelectedContract(response.contract)
      setPayData(emptyPayData)
      await fetchData()
      alert('Thanh toán hợp đồng thành công!')
    } catch (err) {
      setError('Không thể thanh toán hợp đồng: ' + (err.response?.data?.message || err.message))
    }
  }

  const columns = [
    { key: 'SOHD', label: 'Số Hợp Đồng' },
    { key: 'TENKH', label: 'Tên Khách Hàng' },
    { key: 'NGAYKY', label: 'Ngày Ký', render: (value) => formatDate(value) },
    { key: 'SODIENKE', label: 'Số Điện Kế' },
    { key: 'KWDINHMUC', label: 'Định Mức kWh' },
    { key: 'DONGIAKW', label: 'Đơn Giá/kWh', render: (value) => formatCurrency(value) }
  ]

  const actions = [
    {
      label: 'Xem Chi Tiết',
      onClick: (row) => handleViewDetail(row)
    },
    ...(canManage ? [{
      label: 'Xóa',
      isVisible: (row) => !isPaidContract(row),
      onClick: (row) => handleDeleteContract(row.SOHD)
    }] : [])
  ]

  if (loading) return <div className="loading">Đang tải dữ liệu hợp đồng...</div>

  if (error) {
    return (
      <div className="error-container">
        <div className="error">{error}</div>
        <button onClick={() => setError('')}>Đóng</button>
      </div>
    )
  }

  return (
    <div className="contracts-management admin-contracts-management">
      <div className="management-header">
        <div>
          <h2>Quản Lý Hợp Đồng</h2>
          <p className="management-subtitle">Theo dõi, cập nhật và thanh toán hợp đồng điện tại một nơi.</p>
        </div>
        <div className="header-actions">
          {canManage && (
            <button
              className="btn-add"
              onClick={() => {
                setShowForm(!showForm)
                setError('')
              }}
            >
              {showForm ? 'Đóng Biểu Mẫu' : 'Tạo Hợp Đồng'}
            </button>
          )}
        </div>
      </div>

      <div className="search-box">
        <div className="search-input-group">
          <input
            type="text"
            value={searchPhone}
            onChange={(e) => setSearchPhone(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearchByPhone()}
            placeholder="Nhập số điện thoại khách hàng"
            className="search-input"
          />
          <button onClick={handleSearchByPhone} className="btn-search">
            Tìm Kiếm
          </button>
          {isSearchMode && (
            <button onClick={handleResetSearch} className="btn-reset">
              Xem Tất Cả
            </button>
          )}
        </div>
      </div>

      {showForm && canManage && (
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
                {customers.map((customer) => (
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
              <label>Định Mức kWh *</label>
              <input
                type="number"
                value={formData.kwDinhMuc}
                onChange={(e) => setFormData({ ...formData, kwDinhMuc: e.target.value })}
                placeholder="Nhập định mức"
              />
            </div>
            <div className="form-group">
              <label>Đơn Giá / kWh *</label>
              <input
                type="number"
                value={formData.dongiaKW}
                onChange={(e) => setFormData({ ...formData, dongiaKW: e.target.value })}
                placeholder="Nhập đơn giá"
              />
            </div>
          </div>
          <div className="form-actions">
            <button onClick={handleAddContract} className="btn-save">Tạo Hợp Đồng</button>
            <button onClick={resetCreateForm} className="btn-cancel">Hủy</button>
          </div>
        </div>
      )}

      {showDetail && selectedContract && !isEditing && (
        <div className="detail-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Chi Tiết Hợp Đồng</h3>
              <button className="close-btn" onClick={closeDetailModal}>×</button>
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
                <span className="label">Ngày Ký:</span>
                <span className="value">{formatDate(selectedContract.NGAYKY)}</span>
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
                <span className="value">{formatCurrency(selectedContract.DONGIAKW)}</span>
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
              <div className="detail-row">
                <span className="label">Địa Chỉ:</span>
                <span className="value">{selectedContract.DIACHI || '--'}</span>
              </div>

            </div>
            <div className="modal-footer">
              <button onClick={handleViewBills} className="btn-view-bills">
                Xem Hóa Đơn
              </button>

              {canManage && (
                <button onClick={handleEdit} className="btn-edit">
                  Chỉnh Sửa
                </button>
              )}
              <button onClick={closeDetailModal} className="btn-close">
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
              <h3>Chỉnh Sửa Hợp Đồng</h3>
              <button className="close-btn" onClick={() => setIsEditing(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-row single-column">
                <div className="form-group">
                  <label>Số Hợp Đồng</label>
                  <input
                    type="text"
                    value={selectedContract.SOHD}
                    disabled
                  />
                </div>
              </div>
              <div className="form-row single-column">
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
              <button onClick={() => setIsEditing(false)} className="btn-cancel">
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
