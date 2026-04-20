import { useEffect, useState } from 'react'
import { useAuthStore } from '../store/authStore'
import './SessionCountdown.css'

const WARNING_THRESHOLD_MS = 10 * 60 * 1000

const formatDuration = (ms) => {
  const totalSeconds = Math.max(Math.ceil(ms / 1000), 0)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const pad = (value) => String(value).padStart(2, '0')

  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}`
  }

  return `${minutes}:${pad(seconds)}`
}

export default function SessionCountdown() {
  const sessionExpiry = useAuthStore((state) => state.sessionExpiry)
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    if (!sessionExpiry) {
      return undefined
    }

    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [sessionExpiry])

  if (!sessionExpiry) {
    return null
  }

  const remainingMs = Math.max(sessionExpiry - now, 0)
  if (remainingMs <= 0) {
    return (
      <div className="session-timer session-expired">
        <span>Hết phiên</span>
      </div>
    )
  }

  const showWarning = remainingMs <= WARNING_THRESHOLD_MS

  return (
    <div className="session-timer">
      <span className="session-time-label">Hết phiên sau:</span>
      <span className="session-time">{formatDuration(remainingMs)}</span>
      {showWarning && (
        <span className="session-warning">Vui lòng đăng nhập lại</span>
      )}
    </div>
  )
}
