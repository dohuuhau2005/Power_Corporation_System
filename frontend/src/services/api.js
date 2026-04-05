import axios from 'axios'

const API_BASE_URL = 'http://localhost:9999'

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Token được gửi tự động qua cookie (withCredentials: true)
// Không cần lấy từ localStorage

// Auth endpoints
export const login = async (credentials) => {
  const response = await api.post('/login', credentials)
  return response.data
}

export const logout = async () => {
  const response = await api.post('/login/logout')
  return response.data
}

export const verifyToken = async () => {
  try {
    const response = await api.get('/check/protected')
    return { success: true, data: response.data }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Admin endpoints
export const getCountSites = async () => {
  const response = await api.get('/admin/CountSite')
  return response.data
}

export const getCountCustomers = async () => {
  const response = await api.get('/admin/CountCustomer')
  return response.data
}

export const getCountStaff = async () => {
  const response = await api.get('/admin/CountStaff')
  return response.data
}

export const getSites = async () => {
  const response = await api.get('/admin/sites')
  return response.data
}

export const updateSite = async (id, data) => {
  const response = await api.put(`/admin/sites/${id}`, data)
  return response.data
}

export const getStaffs = async () => {
  const response = await api.get('/admin/staffs')
  return response.data
}

export const createStaff = async (data) => {
  const response = await api.post('/admin/staffs', data)
  return response.data
}

export const updateStaff = async (id, data) => {
  const response = await api.put(`/admin/staffs/${id}`, data)
  return response.data
}

export const deleteStaff = async (id) => {
  const response = await api.delete(`/admin/staffs/${id}`)
  return response.data
}

// Employee endpoints
export const getEmployeeInfo = async () => {
  const response = await api.get('/employee/allInformation')
  return response.data
}

export const getCustomers = async () => {
  const response = await api.get('/employee/customers')
  return response.data
}

export const createCustomer = async (data) => {
  const response = await api.post('/employee/customers', data)
  return response.data
}

export const updateCustomer = async (id, data) => {
  const response = await api.put(`/employee/customers/${id}`, data)
  return response.data
}

export const deleteCustomer = async (id) => {
  const response = await api.delete(`/employee/customers/${id}`)
  return response.data
}

// Contract endpoints
export const getContracts = async () => {
  const response = await api.get('/employee/contracts')
  return response.data
}

export const getContractDetail = async (id) => {
  const response = await api.get(`/employee/contracts/${id}`)
  return response.data
}

export const createContract = async (data) => {
  const response = await api.post('/employee/contracts', data)
  return response.data
}

export const updateContract = async (id, data) => {
  const response = await api.put(`/employee/contracts/${id}`, data)
  return response.data
}

export const deleteContract = async (id) => {
  const response = await api.delete(`/employee/contracts/${id}`)
  return response.data
}

export const payContract = async (id, data) => {
  const response = await api.put(`/employee/contracts/${id}/pay`, data)
  return response.data
}

export const getBills = async (maNV) => {
  const response = await api.get('/employee/bills', { params: { maNV } })
  return response.data
}

export const getBillDetail = async (id) => {
  const response = await api.get(`/employee/bills/${id}`)
  return response.data
}

export const createBill = async (data) => {
  const response = await api.post('/employee/bills', data)
  return response.data
}

// Staff detail endpoints
export const getStaffDetail = async (id) => {
  const response = await api.get(`/admin/staffs/${id}`)
  return response.data
}

// Customer detail endpoints  
export const getCustomerDetail = async (id) => {
  const response = await api.get(`/employee/customers/${id}`)
  return response.data
}

export default api
