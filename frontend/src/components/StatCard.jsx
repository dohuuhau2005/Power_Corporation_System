import { Link } from 'react-router-dom'
import './StatCard.css'

export default function StatCard({ title, value, icon, color, link }) {
  const content = (
    <div className="stat-card" style={{ borderLeftColor: color }}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <h3>{title}</h3>
        <p className="stat-value">{value}</p>
      </div>
      <div className="stat-arrow">→</div>
    </div>
  )

  return link ? <Link to={link} className="stat-link">{content}</Link> : content
}
