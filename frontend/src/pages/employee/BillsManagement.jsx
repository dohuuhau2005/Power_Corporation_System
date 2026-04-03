import { useEffect, useState } from 'react'
import { getBills, createBill } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import Table from '../../components/Table'
import './BillsManagement.css'

export default function BillsManagement() {
  const { user } = useAuthStore()
  const [bills, setBills] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
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
      fetchBills()
    } catch (err) {
      setError('Không thể tạo hóa đơn: ' + (err.response?.data?.message || err.message))
    }
  }

  const columns = [
    { key: 'soHDN', label: 'Số HĐN' },
    { key: 'thang', label: 'Tháng' },
    { key: 'nam', label: 'Năm' },
    { key: 'soHD', label: 'Số HD' },
    { key: 'soTien', label: 'Số Tiền' }
  ]

  if (loading) return <div className="loading">Đang tải...</div>
  if (error) return <div className="error">{error}</div>

  return (
    <div className="bills-management">
      <div className="management-header">
        <h2>Quản Lý Hóa Đơn</h2>
        <button
          className="btn-add"
          onClick={() => setShowForm(!showForm)}
        >
          + Tạo Hóa Đơn
        </button>
      </div>

      {showForm && (
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

      <Table columns={columns} data={bills} />
    </div>
  )
}
