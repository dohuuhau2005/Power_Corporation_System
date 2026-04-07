import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { login } from '../services/api'
import './LoginPage.css'

export default function LoginPage() {
  const navigate = useNavigate()
  const { setUser, setAuthenticated } = useAuthStore()
  const [credentials, setCredentials] = useState({
    MaTK: '',
    password: '',
    ThanhPho: 'TongBo',
    ChiNhanh: 'CN1'
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await login(credentials)
      if (response.message.includes('thành công')) {
        setUser(response.data)
        setAuthenticated(true)
        // Token đã được lưu trong cookie httpOnly bởi server
        navigate(response.data.role === 'R_ADMIN' ? '/admin' : '/employee')
      } else {
        setError(response.message || 'Đăng nhập thất bại')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi kết nối server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-title">Power Corporation</h1>
        <p className="login-subtitle">Hệ Thống Quản Lý Điện Lực</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="MaTK">Mã Tài Khoản</label>
            <input
              type="text"
              id="MaTK"
              name="MaTK"
              value={credentials.MaTK}
              onChange={handleChange}
              placeholder="Nhập mã nhân viên"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mật Khẩu</label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              placeholder="Nhập mật khẩu"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="ThanhPho">Thành Phố</label>
            <select
              id="ThanhPho"
              name="ThanhPho"
              value={credentials.ThanhPho}
              onChange={handleChange}
            >
              <option value="TongBo">Tổng Bộ</option>
              <option value="TP1">TP1</option>
              <option value="TP2">TP2</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="ChiNhanh">Chi Nhánh</label>
            <select
              id="ChiNhanh"
              name="ChiNhanh"
              value={credentials.ChiNhanh}
              onChange={handleChange}
            >
            <option value="">Tong bo</option>
              <option value="CN1">CN1</option>
              <option value="CN2">CN2</option>
              <option value="CN3">CN3</option>
              <option value="CN4">CN4</option>
            </select>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
          </button>
        </form>

        <div className="default-credentials">
          <p><strong>Demo Account:</strong></p>
          <p>Admin: NV_000 / 123456</p>
          <p>Staff: NV_101 / 123456</p>
        </div>
      </div>
    </div>
  )
}
