import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getUserRole } from '../common/access/roleAccess'

const RoleProtectedRoute = ({ allowedRoles, children }) => {
  const { user } = useAuth()
  const userRole = getUserRole(user)

  if (!allowedRoles.includes(userRole)) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-900">
        <h2 className="text-lg font-semibold">Access restricted</h2>
        <p className="mt-2 text-sm">Your role does not have access to this page.</p>
        <Link
          to="/dashboard"
          className="mt-4 inline-flex rounded-md border border-amber-300 bg-white px-3 py-2 text-sm font-medium text-amber-800 hover:bg-amber-100"
        >
          Go to dashboard
        </Link>
      </div>
    )
  }

  return children
}

export default RoleProtectedRoute
