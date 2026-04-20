import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getBillCalculationDetail } from '../services/api'
import Table from '../components/Table'
import './BillCalculationDetail.css'

const normalizeCalcRows = (payload) => {
  const rows = Array.isArray(payload)
    ? payload
    : payload?.details || payload?.items || payload?.data || payload?.bill || payload?.bills || []

  if (!Array.isArray(rows)) {
    return []
  }

  return rows.map((row) => ({
    ID: row.ID ?? row.id,
    SOHDN: row.SOHDN ?? row.soHDN ?? row.sohdn,
    BAC: row.BAC ?? row.bac,
    LOAI: row.LOAI ?? row.loai,
    SOKW: row.SOKW ?? row.soKW ?? row.soKw ?? row.sokw,
    DONGIA: row.DONGIA ?? row.donGia ?? row.dongia,
    THANHTIEN: row.THANHTIEN ?? row.thanhTien ?? row.thanhtien
  }))
}

export default function BillCalculationDetail() {
  const { soHDN } = useParams()
  const navigate = useNavigate()
  const [details, setDetails] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchDetail = async () => {
      if (!soHDN) {
        setError('Không tìm thấy mã hóa đơn')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const response = await getBillCalculationDetail(soHDN)
        setDetails(normalizeCalcRows(response.billDetails))
        console.log('Chi tiết cách tính:', response) // Debug: Kiểm tra dữ liệu chi tiết cách tính
        setError('')
      } catch (err) {
        setError('Không thể tải chi tiết cách tính: ' + (err.response?.data?.message || err.message || 'Lỗi hệ thống'))
      } finally {
        setLoading(false)
      }
    }

    fetchDetail()
  }, [soHDN])

  const formatCurrency = (value) => {
    if (value === null || value === undefined || value === '') return '--'
    return `${Number.parseInt(value, 10).toLocaleString('vi-VN')} VNĐ`
  }

  const columns = [
    { key: 'ID', label: 'ID' },
    { key: 'SOHDN', label: 'SOHDN' },
    { key: 'BAC', label: 'BAC' },
    { key: 'LOAI', label: 'LOAI' },
    { key: 'SOKW', label: 'SOKW' },
    { key: 'DONGIA', label: 'DONGIA', render: (value) => formatCurrency(value) },
    { key: 'THANHTIEN', label: 'THANHTIEN', render: (value) => formatCurrency(value) }
  ]

  if (loading) return <div className="loading">Đang tải chi tiết cách tính...</div>

  return (
    <div className="bill-calc-page">
      <div className="bill-calc-header">
        <div>
          <h2>Chi Tiết Cách Tính Hóa Đơn</h2>
          <p className="bill-calc-subtitle">Mã HĐN: {soHDN}</p>
        </div>
        <button className="btn-back" onClick={() => navigate(-1)}>
          Quay lại
        </button>
      </div>

      {error && <div className="error">{error}</div>}
      <Table columns={columns} data={details} />
    </div>
  )
}
