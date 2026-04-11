import { useEffect, useState } from 'react'
import { getBills, createBill, getBillDetail } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
// PERMISSIONS: R_STAFF can create invoices only
import Table from '../../components/Table'
import './BillsManagement.css'

export default function BillsManagement() {
  const { user } = useAuthStore()
  const [bills, setBills] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [selectedBill, setSelectedBill] = useState(null)
  const [formData, setFormData] = useState({
    thanhpho: user?.ThanhPho || 'TP1',
    soHD: '',
    maNV: user?.id || '',
    soTien: ''
  })

  useEffect(() => {
    fetchBills()
  }, [])

  const fetchBills = async () => {
    try {
      setLoading(true)
      const response = await getBills(user?.id)
      setBills(response.bills || [])
    } catch (err) {
      setError('Không thể tải dữ liệu hóa đơn')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    try {
      await createBill(formData)
      setFormData({
        thanhpho: user?.ThanhPho || 'TP1',
        soHD: '',
        maNV: user?.id || '',
        soTien: ''
      })
      setShowForm(false)
      alert('Tạo hóa đơn thành công!')
      window.location.reload()
    } catch (err) {
      setError('Không thể tạo hóa đơn: ' + (err.response?.data?.message || err.message))
    }
  }

  const handleViewDetail = async (bill) => {
    try {
      const response = await getBillDetail(bill.SOHDN)
      setSelectedBill(response.bill)
      setShowDetail(true)
    } catch (err) {
      setError('Không thể tải chi tiết: ' + err.message)
    }
  }

  const columns = [
    { key: 'SOHDN', label: 'Số HĐN' },
    { key: 'THANG', label: 'Tháng' },
    { key: 'NAM', label: 'Năm' },
    { key: 'SOHD', label: 'Số HD' },
    { key: 'SOTIEN', label: 'Số Tiền' }
  ]

  if (loading) return <div className="loading">Đang tải...</div>
  if (error) return <div className="error">{error}</div>

  const canCreate = user?.role === 'R_STAFF' || user?.role === 'R_MANAGER' || user?.role === 'R_ADMIN'

  return (
    <div className="bills-management">
      <div className="management-header">
        <h2>Quản Lý Hóa Đơn</h2>

      </div>

      {showForm && canCreate && (
        <div className="form-box">
          <h3>Tạo Hóa Đơn Mới</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Số Hợp Đồng</label>
              <input
                type="text"
                value={formData.soHD}
                onChange={(e) => setFormData({ ...formData, soHD: e.target.value })}
                placeholder="Nhập số hợp đồng"
              />
            </div>
            <div className="form-group">
              <label>Số Tiền (VNĐ)</label>
              <input
                type="number"
                value={formData.soTien}
                onChange={(e) => setFormData({ ...formData, soTien: e.target.value })}
                placeholder="Nhập số tiền"
              />
            </div>
          </div>
          <div className="form-actions">
            <button onClick={handleCreate} className="btn-save">Tạo Hóa Đơn</button>
            <button onClick={() => setShowForm(false)} className="btn-cancel">Hủy</button>
          </div>
        </div>
      )}

      {showDetail && selectedBill && (
        <div className="detail-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Chi Tiết Hóa Đơn</h3>
              <button className="close-btn" onClick={() => { setShowDetail(false); setSelectedBill(null) }}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <span className="label">Số HĐN:</span>
                <span className="value">{selectedBill.SOHDN}</span>
              </div>
              <div className="detail-row">
                <span className="label">Tháng/Năm:</span>
                <span className="value">{selectedBill.THANG}/{selectedBill.NAM}</span>
              </div>
              <div className="detail-row">
                <span className="label">Số Hợp Đồng:</span>
                <span className="value">{selectedBill.SOHD}</span>
              </div>
              <div className="detail-row">
                <span className="label">Khách Hàng:</span>
                <span className="value">{selectedBill.TENKH}</span>
              </div>
              {selectedBill.SODIENKE && (
                <div className="detail-row">
                  <span className="label">Số Điện Kế:</span>
                  <span className="value">{selectedBill.SODIENKE}</span>
                </div>
              )}
              {selectedBill.KWDINHMUC && (
                <div className="detail-row">
                  <span className="label">Định Mức:</span>
                  <span className="value">{selectedBill.KWDINHMUC} kWh</span>
                </div>
              )}
              <div className="detail-row">
                <span className="label">Số Tiền:</span>
                <span className="value" style={{ color: '#27ae60', fontWeight: 'bold' }}>
                  {parseInt(selectedBill.SOTIEN).toLocaleString('vi-VN')} VNĐ
                </span>
              </div>
              <div className="detail-row">
                <span className="label">Nhân Viên:</span>
                <span className="value">{selectedBill.MANV}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <Table columns={columns} data={bills} actions={[
        {
          label: 'Xem Chi Tiết',
          onClick: (row) => handleViewDetail(row)
        }
      ]} />
    </div>
  )
}
