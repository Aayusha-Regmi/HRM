import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import Login from './pages/Auth/Login'
import Dashboard from './pages/Dashboard/Dashboard'
import Employees from './pages/Employee/Employees'
import EmployeeDetails from './pages/Employee/EmployeeDetails'
import AddEmployee from './pages/Employee/AddEmployee'
import AddDepartment from './pages/Department/AddDepartment'
import Departments from './pages/Department/Departments'
import Attendance from './pages/Attendance/Attendance'
import Reports from './pages/Reports/Reports'
import Recruitment from './pages/Recruitment/Recruitment'
import LeaveManagement from './pages/Leave Management/LeaveManagement'
import Settings from './pages/Settings/Settings'
import ProtectedRoute from './components/ProtectedRoute'
import RoleProtectedRoute from './components/RoleProtectedRoute'
import { HRDataProvider } from './context/HRDataContext'
import { NotificationProvider } from './context/NotificationContext'
import './App.css'

const ProtectedAppShell = () => (
  <ProtectedRoute>
    <NotificationProvider>
      <HRDataProvider>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route
              path="/employees"
              element={(
                <RoleProtectedRoute allowedRoles={['admin', 'hr_manager']}>
                  <Employees />
                </RoleProtectedRoute>
              )}
            />
            <Route
              path="/employees/:id"
              element={(
                <RoleProtectedRoute allowedRoles={['admin', 'hr_manager']}>
                  <EmployeeDetails />
                </RoleProtectedRoute>
              )}
            />
            <Route
              path="/employees/add"
              element={(
                <RoleProtectedRoute allowedRoles={['admin', 'hr_manager']}>
                  <AddEmployee />
                </RoleProtectedRoute>
              )}
            />
            <Route
              path="/employees/:id/edit"
              element={(
                <RoleProtectedRoute allowedRoles={['admin', 'hr_manager']}>
                  <AddEmployee />
                </RoleProtectedRoute>
              )}
            />
            <Route
              path="/departments"
              element={(
                <RoleProtectedRoute allowedRoles={['admin', 'hr_manager']}>
                  <Departments />
                </RoleProtectedRoute>
              )}
            />
            <Route
              path="/departments/add"
              element={(
                <RoleProtectedRoute allowedRoles={['admin', 'hr_manager']}>
                  <AddDepartment />
                </RoleProtectedRoute>
              )}
            />
            <Route path="/attendance" element={<Attendance />} />
            <Route
              path="/reports"
              element={(
                <RoleProtectedRoute allowedRoles={['admin', 'hr_manager']}>
                  <Reports />
                </RoleProtectedRoute>
              )}
            />
            <Route
              path="/recruitment"
              element={(
                <RoleProtectedRoute allowedRoles={['admin', 'hr_manager']}>
                  <Recruitment />
                </RoleProtectedRoute>
              )}
            />
            <Route
              path="/leave-management"
              element={(
                <RoleProtectedRoute allowedRoles={['admin', 'hr_manager']}>
                  <LeaveManagement />
                </RoleProtectedRoute>
              )}
            />
            <Route
              path="/settings"
              element={(
                <RoleProtectedRoute allowedRoles={['admin']}>
                  <Settings />
                </RoleProtectedRoute>
              )}
            />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </MainLayout>
      </HRDataProvider>
    </NotificationProvider>
  </ProtectedRoute>
)

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<ProtectedAppShell />} />
      </Routes>
    </Router>
  )
}

export default App
