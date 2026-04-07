import { Routes, Route } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import AdminOverview from './admin/AdminOverview'
import SitesManagement from './admin/SitesManagement'
import StaffsManagement from './admin/StaffsManagement'
import ContractsManagement from './admin/ContractsManagement'
import BillsManagement from './admin/BillsManagement'
import WorkHistory from './admin/WorkHistory'
import './AdminDashboard.css'

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<AdminOverview />} />
        <Route path="/sites" element={<SitesManagement />} />
        <Route path="/staffs" element={<StaffsManagement />} />
        <Route path="/contracts" element={<ContractsManagement />} />
        <Route path="/bills" element={<BillsManagement />} />
        <Route path="/work-history" element={<WorkHistory />} />
      </Routes>
    </AdminLayout>
  )
}
