import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://server:8000/api' : '/api')

const apiClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const status = error.response?.status
    const requestUrl = originalRequest?.url || ''

    if (status === 401 && !originalRequest?._retry && !requestUrl.includes('/auth/login') && !requestUrl.includes('/auth/refresh')) {
      originalRequest._retry = true
      try {
        await apiClient.post('/auth/refresh')
        return apiClient(originalRequest)
      } catch (refreshError) {
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

// --- Auth ---
export const login = async (username, password) => {
  const response = await apiClient.post('/auth/login', { username, password })
  return response.data
}

export const register = async (data) => apiClient.post('/auth/register', data).then((res) => res.data)
export const getCurrentUser = async () => apiClient.get('/auth/me').then((res) => res.data)
export const logout = async () => apiClient.post('/auth/logout').then((res) => res.data)

// --- Dashboard helpers ---
export const getDashboardStats = async () => {
  const [employees, departments, attendances, jobPostings] = await Promise.all([
    getEmployees(),
    getDepartments(),
    getAttendances(),
    getJobPostings(),
  ])

  // Calculate department distribution - only from departments with employees
  const departmentCounts = departments.map((dep) => ({
    name: dep.name,
    id: dep.id,
    count: employees.filter((e) => e.department_id === dep.id).length,
  }))

  const totalEmployees = departmentCounts.reduce((sum, d) => sum + d.count, 0) || 1
  
  // Split data: withEmployees for pie chart, all for legend
  const departmentDataForPie = departmentCounts
    .filter((d) => d.count > 0)
    .map((d) => ({
      name: d.name,
      value: Math.round((d.count / totalEmployees) * 100),
    }))

  const allDepartmentData = departmentCounts.map((d) => ({
    name: d.name,
    value: d.count > 0 ? Math.round((d.count / totalEmployees) * 100) : 0,
  }))

  return {
    totalEmployees: employees.length,
    openPositions: jobPostings.filter((j) => j.is_active).length,
    departmentData: departmentDataForPie,
    allDepartmentData: allDepartmentData,
    attendanceData: attendances,
  }
}

// --- Employee CRUD ---
export const getEmployees = async () => apiClient.get('/employees').then((res) => res.data)
export const getEmployee = async (id) => apiClient.get(`/employees/${id}`).then((res) => res.data)
export const createEmployee = async (data) => apiClient.post('/employees', data).then((res) => res.data)
export const updateEmployee = async (id, data) => apiClient.put(`/employees/${id}`, data).then((res) => res.data)
export const deleteEmployee = async (id) => apiClient.delete(`/employees/${id}`).then((res) => res.data)

// --- Department CRUD ---
export const getDepartments = async () => apiClient.get('/departments').then((res) => res.data)
export const getDepartment = async (id) => apiClient.get(`/departments/${id}`).then((res) => res.data)
export const createDepartment = async (data) => apiClient.post('/departments', data).then((res) => res.data)
export const updateDepartment = async (id, data) => apiClient.put(`/departments/${id}`, data).then((res) => res.data)
export const deleteDepartment = async (id) => apiClient.delete(`/departments/${id}`).then((res) => res.data)

// --- Attendance CRUD ---
export const getAttendances = async () => apiClient.get('/attendances').then((res) => res.data)
export const getAttendance = async (id) => apiClient.get(`/attendances/${id}`).then((res) => res.data)
export const createAttendance = async (data) => apiClient.post('/attendances', data).then((res) => res.data)
export const updateAttendance = async (id, data) => apiClient.put(`/attendances/${id}`, data).then((res) => res.data)
export const deleteAttendance = async (id) => apiClient.delete(`/attendances/${id}`).then((res) => res.data)

// --- Leave CRUD ---
export const getLeaves = async () => apiClient.get('/leaves').then((res) => res.data)
export const getLeave = async (id) => apiClient.get(`/leaves/${id}`).then((res) => res.data)
export const createLeave = async (data) => apiClient.post('/leaves', data).then((res) => res.data)
export const updateLeave = async (id, data) => apiClient.put(`/leaves/${id}`, data).then((res) => res.data)
export const deleteLeave = async (id) => apiClient.delete(`/leaves/${id}`).then((res) => res.data)

// --- Job Posting CRUD ---
export const getJobPostings = async () => apiClient.get('/job_postings').then((res) => res.data)
export const getJobPosting = async (id) => apiClient.get(`/job_postings/${id}`).then((res) => res.data)
export const createJobPosting = async (data) => apiClient.post('/job_postings', data).then((res) => res.data)
export const updateJobPosting = async (id, data) => apiClient.put(`/job_postings/${id}`, data).then((res) => res.data)
export const deleteJobPosting = async (id) => apiClient.delete(`/job_postings/${id}`).then((res) => res.data)

// --- Job Application CRUD ---
export const getJobApplications = async () => apiClient.get('/job_applications').then((res) => res.data)
export const getJobApplication = async (id) => apiClient.get(`/job_applications/${id}`).then((res) => res.data)
export const createJobApplication = async (data) => apiClient.post('/job_applications', data).then((res) => res.data)
export const updateJobApplication = async (id, data) => apiClient.put(`/job_applications/${id}`, data).then((res) => res.data)
export const deleteJobApplication = async (id) => apiClient.delete(`/job_applications/${id}`).then((res) => res.data)

// --- Notifications ---
export const getNotifications = async () => apiClient.get('/notifications').then((res) => res.data)
export const createNotification = async (data) => apiClient.post('/notifications', data).then((res) => res.data)

// --- Company settings ---
export const getCompanySettings = async () => apiClient.get('/settings').then((res) => res.data)
export const updateCompanySettings = async (data) => apiClient.put('/settings', data).then((res) => res.data)

export default apiClient
