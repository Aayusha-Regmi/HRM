import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <div className="p-6 text-sm text-gray-600">Checking session...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}

export default ProtectedRoute
