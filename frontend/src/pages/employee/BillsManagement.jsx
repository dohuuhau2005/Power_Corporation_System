import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getBillsByContract, getBillDetail, payBill } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import Table from '../../components/Table'
import './BillsManagement.css'

export default function BillsManagement() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const soHDFromState = location.state?.soHD
  
  const [bills, setBills] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showDetail, setShowDetail] = useState(false)
  const [selectedBill, setSelectedBill] = useState(null)
  const [currentSoHD, setCurrentSoHD] = useState(soHDFromState || '')
  const [showPayConfirm, setShowPayConfirm] = useState(false)
  const [selectedBillsForPay, setSelectedBillsForPay] = useState([])

  useEffect(() => {
    if (soHDFromState) {
      fetchBills(soHDFromState)
    } else {
      setLoading(false)
    }
  }, [soHDFromState])

  const fetchBills = async (soHD) => {
    try {
      setLoading(true)
      const response = await getBillsByContract(soHD)
      // Normalize column names: thanhToan → THANHTOAN
      const normalizedBills = (response.bills || []).map(bill => ({
        ...bill,
        THANHTOAN: bill.THANHTOAN !== undefined ? bill.THANHTOAN : bill.thanhToan
      }))
      setBills(normalizedBills)
      setCurrentSoHD(soHD)
      setError('')
    } catch (err) {
      setError('Không thể tải dữ liệu hóa đơn: ' + (err.response?.data?.message || err.message || 'Lỗi hệ thống'))
      setBills([])
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetail = async (bill) => {
    try {
      const response = await getBillDetail(bill.SOHDN)
      setSelectedBill(response.bill)
      setShowDetail(true)
    } catch (err) {
      setError('Không thể tải chi tiết: ' + (err.response?.data?.message || err.message || 'Lỗi hệ thống'))
    }
  }

  const handleViewCalculationDetail = (soHDN) => {
    setShowDetail(false)
    setSelectedBill(null)
    navigate(`/employee/bills/calc/${soHDN}`)
  }

  const handlePayBill = async (soHDN) => {
    if (!window.confirm('Bạn có chắc chắn muốn thanh toán hóa đơn này?')) {
      return
    }

    try {
      await payBill(soHDN)
      await fetchBills(currentSoHD)
      setShowDetail(false)
      setSelectedBill(null)
      alert('Thanh toán hóa đơn thành công!')
    } catch (err) {
      setError('Không thể thanh toán hóa đơn: ' + (err.response?.data?.message || err.message || 'Lỗi hệ thống'))
    }
  }

  const handleBulkPay = () => {
    const unpaidBills = bills.filter(bill => bill.THANHTOAN === 0 || bill.THANHTOAN === '0')
    if (unpaidBills.length === 0) {
      setError('Không có hóa đơn nào chưa thanh toán')
      return
    }
    setSelectedBillsForPay(unpaidBills)
    setShowPayConfirm(true)
  }

  const confirmBulkPay = async () => {
    const billIds = selectedBillsForPay.map(bill => bill.SOHDN)
    if (billIds.length === 0) {
      setShowPayConfirm(false)
      return
    }

    try {
      await Promise.all(billIds.map(soHDN => payBill(soHDN)))
      await fetchBills(currentSoHD)
      setShowPayConfirm(false)
      setSelectedBillsForPay([])
      alert('Thanh toán tất cả hóa đơn thành công!')
    } catch (err) {
      setError('Lỗi khi thanh toán: ' + (err.response?.data?.message || err.message || 'Lỗi hệ thống'))
    }
  }

  const formatCurrency = (value) => {
    if (value === null || value === undefined || value === '') return '--'
    return `${Number.parseInt(value, 10).toLocaleString('vi-VN')} VNĐ`
  }

  const getPaymentStatus = (value) => {
    const status = parseInt(value, 10)
    return status === 1 ? '✓ Đã Thanh Toán' : '✕ Chưa Thanh Toán'
  }

  const columns = [
    { key: 'SOHDN', label: 'Số HĐN' },
    { key: 'THANG', label: 'Tháng' },
    { key: 'NAM', label: 'Năm' },
    { key: 'SOHD', label: 'Số HD' },
    { key: 'SOTIEN', label: 'Số Tiền', render: (value) => formatCurrency(value) },
    { 
      key: 'THANHTOAN', 
      label: 'Trạng Thái', 
      render: (value) => getPaymentStatus(value)
    }
  ]

  const actions = [
    {
      label: 'Xem Chi Tiết',
      onClick: (row) => handleViewDetail(row)
    }
  ]

  if (loading) return <div className="loading">Đang tải dữ liệu hóa đơn...</div>

  if (!currentSoHD) {
    return (
      <div className="bills-management">
        <div className="info-message">
          📋 Vui lòng chọn một hợp đồng từ trang Quản Lý Hợp Đồng để xem danh sách hóa đơn
        </div>
      </div>
    )
  }

  return (
    <div className="bills-management">
      <div className="management-header">
        <div>
          <h2>Quản Lý Hóa Đơn</h2>
          <p className="management-subtitle">Hợp Đồng: {currentSoHD}</p>
        </div>
        <button onClick={handleBulkPay} className="btn-bulk-pay">
          Thanh Toán Tất Cả
        </button>
      </div>

      {showPayConfirm && (
        <div className="detail-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Xác Nhận Thanh Toán</h3>
              <button
                className="close-btn"
                onClick={() => {
                  setShowPayConfirm(false)
                  setSelectedBillsForPay([])
                }}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>Danh sách hóa đơn chưa thanh toán:</p>
              <div className="bulk-pay-list">
                {selectedBillsForPay.map((bill) => (
                  <div key={bill.SOHDN} className="bulk-pay-item">
                    <span className="bulk-pay-month">Tháng {bill.THANG}/{bill.NAM}</span>
                    <span className="bulk-pay-amount">{formatCurrency(bill.SOTIEN)}</span>
                  </div>
                ))}
              </div>
              <div className="bulk-pay-total">
                <span>Tổng cộng</span>
                <span>
                  {formatCurrency(
                    selectedBillsForPay.reduce((sum, bill) => {
                      const amount = Number.parseInt(bill.SOTIEN, 10)
                      return sum + (Number.isNaN(amount) ? 0 : amount)
                    }, 0)
                  )}
                </span>
              </div>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => {
                  setShowPayConfirm(false)
                  setSelectedBillsForPay([])
                }}
                className="btn-cancel"
              >
                Hủy
              </button>
              <button onClick={confirmBulkPay} className="btn-confirm">
                Xác Nhận
              </button>
            </div>
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
              <div className="detail-row">
                <span className="label">Định Mức:</span>
                <span className="value">
                  {(selectedBill.KWDINHMUC === 0 || selectedBill.KWDINHMUC === '0' || selectedBill.KWDINHMUC)
                    ? `${selectedBill.KWDINHMUC} kWh`
                    : '--'}
                </span>
              </div>
              {selectedBill.CHISOMOI && (
                <div className="detail-row">
                  <span className="label">Chỉ Số Mới:</span>
                  <span className="value">{selectedBill.CHISOMOI}</span>
                </div>
              )}
              <div className="detail-row">
                <span className="label">Chỉ Số Cũ:</span>
                <span className="value">
                  {(selectedBill.CHISOCU === 0 || selectedBill.CHISOCU === '0' || selectedBill.CHISOCU)
                    ? selectedBill.CHISOCU
                    : '--'}
                </span>
              </div>
              {selectedBill.KWTHUCTE && (
                <div className="detail-row">
                  <span className="label">kWh Thực Tế:</span>
                  <span className="value">{selectedBill.KWTHUCTE} kWh</span>
                </div>
              )}
              <div className="detail-row">
                <span className="label">Số Tiền:</span>
                <span className="value" style={{ color: '#27ae60', fontWeight: 'bold' }}>
                  {formatCurrency(selectedBill.SOTIEN)}
                </span>
              </div>
              <div className="detail-row">
                <span className="label">Trạng Thái Thanh Toán:</span>
                <span className={`value ${selectedBill.THANHTOAN === 1 || selectedBill.THANHTOAN === '1' ? 'paid' : 'unpaid'}`}>
                  {getPaymentStatus(selectedBill.THANHTOAN)}
                </span>
              </div>
              {selectedBill.MANV && (
                <div className="detail-row">
                  <span className="label">Nhân Viên:</span>
                  <span className="value">{selectedBill.MANV}</span>
                </div>
              )}
            </div>
            <div className="modal-footer">
              {(selectedBill.THANHTOAN === 0 || selectedBill.THANHTOAN === '0') && (
                <button onClick={() => handlePayBill(selectedBill.SOHDN)} className="btn-pay">
                  Thanh Toán
                </button>
              )}
              <button
                onClick={() => handleViewCalculationDetail(selectedBill.SOHDN)}
                className="btn-detail-calc"
              >
                Xem chi tiết cách tính
              </button>
              <button onClick={() => { setShowDetail(false); setSelectedBill(null) }} className="btn-close">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      <Table columns={columns} data={bills} actions={actions} />
    </div>
  )
}
