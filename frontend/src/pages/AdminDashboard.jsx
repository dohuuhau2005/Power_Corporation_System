import { Routes, Route } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import AdminOverview from './admin/AdminOverview'
import SitesManagement from './admin/SitesManagement'
import StaffsManagement from './admin/StaffsManagement'
import './AdminDashboard.css'

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<AdminOverview />} />
        <Route path="/sites" element={<SitesManagement />} />
        <Route path="/staffs" element={<StaffsManagement />} />
      </Routes>
    </AdminLayout>
  )
}
