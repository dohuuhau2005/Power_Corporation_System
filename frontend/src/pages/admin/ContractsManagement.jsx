import { useEffect, useState } from 'react'
import { getContracts, createContract, updateContract, deleteContract, payContract, getContractDetail } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import Table from '../../components/Table'
import './ContractsManagement.css'

export default function ContractsManagement() {
  const { user } = useAuthStore()
  const canManage = user?.role === 'R_ADMIN' || user?.role === 'R_MANAGER'
  const canPay = user?.role === 'R_STAFF' || user?.role === 'R_MANAGER' || user?.role === 'R_ADMIN'
  
  const [contracts, setContracts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [showPayForm, setShowPayForm] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [selectedContract, setSelectedContract] = useState(null)
  const [formData, setFormData] = useState({
    maKH: '',
    soDienKe: '',
    kwDinhMuc: '',
    dongiaKW: ''
  })
  const [payData, setPayData] = useState({
    soTien: ''
  })

  useEffect(() => {
    fetchContracts()
  }, [])

  const fetchContracts = async () => {
    try {
      setLoading(true)
      const response = await getContracts()
      setContracts(response.contracts || [])
      setError('')
    } catch (err) {
      setError('Không thể tải danh sách hợp đồng: ' + (err.message || 'Lỗi hệ thống'))
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async () => {
    if (!formData.maKH || !formData.soDienKe || !formData.kwDinhMuc || !formData.dongiaKW) {
      alert('Vui lòng điền đầy đủ thông tin')
      return
    }
    try {
      await createContract(formData)
      setFormData({ maKH: '', soDienKe: '', kwDinhMuc: '', dongiaKW: '' })
      setShowForm(false)
      fetchContracts()
    } catch (err) {
      setError('Không thể tạo hợp đồng: ' + (err.response?.data?.message || err.message))
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa hợp đồng này?')) return
    try {
      await deleteContract(id)
      fetchContracts()
    } catch (err) {
      setError('Không thể xóa hợp đồng: ' + (err.response?.data?.message || err.message))
    }
  }

  const handlePay = async (contractId) => {
    if (!payData.soTien) {
      alert('Vui lòng nhập số tiền thanh toán')
      return
    }
    try {
      await payContract(contractId, { soTien: parseInt(payData.soTien) })
      setPayData({ soTien: '' })
      setShowPayForm(false)
      setSelectedContract(null)
      fetchContracts()
      alert('Thanh toán hợp đồng và tạo hóa đơn thành công')
    } catch (err) {
      setError('Không thể thanh toán: ' + (err.response?.data?.message || err.message))
    }
  }

  const handleViewDetail = async (contract) => {
    try {
      const response = await getContractDetail(contract.SOHD)
      setSelectedContract(response.contract)
      setShowDetail(true)
    } catch (err) {
      setError('Không thể tải chi tiết: ' + err.message)
    }
  }

  const columns = [
    { key: 'SOHD', label: 'Số Hợp Đồng' },
    { key: 'TENKH', label: 'Tên Khách Hàng' },
    { key: 'NGAYKY', label: 'Ngày Ký' },
    { key: 'SODIENKE', label: 'Số Điện Kế' },
    { key: 'KWDINHMUC', label: 'Định Mức kWh' },
    { key: 'DONGIAKW', label: 'Đơn Giá/kWh' },
    { key: 'ISPAID', label: 'Trạng Thái', render: (val) => val === 1 ? '✓ Đã Thanh Toán' : '✗ Chưa Thanh Toán' }
  ]

  const actions = [
    {
      label: 'Xem Chi Tiết',
      onClick: (row) => handleViewDetail(row)
    },
    ...(canManage ? [{
      label: 'Xóa',
      onClick: (row) => handleDelete(row.SOHD)
    }] : []),
    ...(canPay && !contracts.find(c => c.SOHD === selectedContract?.SOHD)?.ISPAID ? [{
      label: 'Thanh Toán',
      onClick: (row) => {
        setSelectedContract(row)
        setShowPayForm(true)
      }
    }] : [])
  ]

  if (loading) return <div className="loading">Đang tải...</div>
  if (error) return <div className="error">{error}</div>

  return (
    <div className="contracts-management">
      <div className="management-header">
        <h2>Quản Lý Hợp Đồng</h2>
        {canManage && (
          <button className="btn-add" onClick={() => setShowForm(!showForm)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            {showForm ? 'Đóng' : 'Thêm Hợp Đồng'}
          </button>
        )}
      </div>

      {showForm && canManage && (
        <div className="form-box">
          <h3>Tạo Hợp Đồng Mới</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Mã Khách Hàng</label>
              <input
                type="text"
                value={formData.maKH}
                onChange={(e) => setFormData({ ...formData, maKH: e.target.value })}
                placeholder="Mã khách hàng"
              />
            </div>
            <div className="form-group">
              <label>Số Điện Kế</label>
              <input
                type="text"
                value={formData.soDienKe}
                onChange={(e) => setFormData({ ...formData, soDienKe: e.target.value })}
                placeholder="Số điện kế"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Định Mức (kWh)</label>
              <input
                type="number"
                value={formData.kwDinhMuc}
                onChange={(e) => setFormData({ ...formData, kwDinhMuc: e.target.value })}
                placeholder="Định mức"
              />
            </div>
            <div className="form-group">
              <label>Đơn Giá/kWh</label>
              <input
                type="number"
                value={formData.dongiaKW}
                onChange={(e) => setFormData({ ...formData, dongiaKW: e.target.value })}
                placeholder="Đơn giá"
              />
            </div>
          </div>
          <div className="form-actions">
            <button onClick={handleAdd} className="btn-save">Tạo</button>
            <button onClick={() => setShowForm(false)} className="btn-cancel">Hủy</button>
          </div>
        </div>
      )}

      {showPayForm && selectedContract && canPay && !selectedContract.ISPAID && (
        <div className="form-box">
          <h3>Thanh Toán Hợp Đồng</h3>
          <p>Số Hợp Đồng: <strong>{selectedContract.SOHD}</strong></p>
          <p>Khách Hàng: <strong>{selectedContract.TENKH}</strong></p>
          <div className="form-group">
            <label>Số Tiền Thanh Toán</label>
            <input
              type="number"
              value={payData.soTien}
              onChange={(e) => setPayData({ soTien: e.target.value })}
              placeholder="Số tiền"
              autoFocus
            />
          </div>
          <div className="form-actions">
            <button onClick={() => handlePay(selectedContract.SOHD)} className="btn-save">Thanh Toán</button>
            <button onClick={() => { setShowPayForm(false); setSelectedContract(null) }} className="btn-cancel">Hủy</button>
          </div>
        </div>
      )}

      {showDetail && selectedContract && (
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
                <span className="label">Khách Hàng:</span>
                <span className="value">{selectedContract.TENKH}</span>
              </div>
              <div className="detail-row">
                <span className="label">Ngày Ký:</span>
                <span className="value">{new Date(selectedContract.NGAYKY).toLocaleDateString('vi-VN')}</span>
              </div>
              <div className="detail-row">
                <span className="label">Số Điện Kế:</span>
                <span className="value">{selectedContract.SODIENKE}</span>
              </div>
              <div className="detail-row">
                <span className="label">Định Mức:</span>
                <span className="value">{selectedContract.KWDINHMUC} kWh</span>
              </div>
              <div className="detail-row">
                <span className="label">Đơn Giá:</span>
                <span className="value">{parseInt(selectedContract.DONGIAKW).toLocaleString('vi-VN')} VNĐ/kWh</span>
              </div>
              <div className="detail-row">
                <span className="label">Thành Phố:</span>
                <span className="value">{selectedContract.THANHPHO}</span>
              </div>
              <div className="detail-row">
                <span className="label">Trạng Thái:</span>
                <span className="value" style={{ color: selectedContract.ISPAID === 1 ? 'green' : 'red' }}>
                  {selectedContract.ISPAID === 1 ? '✓ Đã Thanh Toán' : '✗ Chưa Thanh Toán'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <Table columns={columns} data={contracts} actions={actions} />
    </div>
  )
}
