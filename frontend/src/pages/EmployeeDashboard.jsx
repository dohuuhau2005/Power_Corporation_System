import { Routes, Route } from 'react-router-dom'
import EmployeeLayout from '../components/EmployeeLayout'
import EmployeeOverview from './employee/EmployeeOverview'
import CustomersManagement from './employee/CustomersManagement'
import ContractsManagement from './employee/ContractsManagement'
import BillsManagement from './employee/BillsManagement'
import BillsOverRange from './employee/Bills2'
import BillCalculationDetail from './BillCalculationDetail'
import './EmployeeDashboard.css'


export default function EmployeeDashboard() {
  return (
    <EmployeeLayout>
      <Routes>
        <Route path="/" element={<EmployeeOverview />} />
        <Route path="/customers" element={<CustomersManagement />} />
        <Route path="/contracts" element={<ContractsManagement />} />
        <Route path="/bills" element={<BillsManagement />} />
        <Route path="/bills/calc/:soHDN" element={<BillCalculationDetail />} />
        <Route path="/bills/over-range" element={<BillsOverRange />} />
      </Routes>
    </EmployeeLayout>
  )
}
