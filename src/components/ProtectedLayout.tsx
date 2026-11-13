import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import Layout from './Layout'
import Loader from './Loader'

export default function ProtectedLayout() {
  const { user, loading } = useAuth()

  if (loading) return <Loader label="Checking your session…" />
  if (!user) return <Navigate to="/login" replace />

  return <Layout />
}
