import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const Login = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const from = location.state?.from?.pathname || '/dashboard'

  const onSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await login(username, password)
      navigate(from, { replace: true })
    } catch {
      setError('Invalid credentials. Try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg border border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900">HRM Login</h1>
        <p className="mt-2 text-sm text-slate-600">Sign in to continue.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
              required
            />
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-sky-600 text-white py-2 font-semibold hover:bg-sky-700 disabled:opacity-70"
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
