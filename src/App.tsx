import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthProvider'
import ProtectedLayout from './components/ProtectedLayout'
import SetupScreen from './components/SetupScreen'
import { isSupabaseConfigured } from './lib/supabase'
import CalendarPage from './pages/CalendarPage'
import Login from './pages/Login'
import SyllabusPage from './pages/SyllabusPage'

export default function App() {
  if (!isSupabaseConfigured) return <SetupScreen />

  return (
    <HashRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<CalendarPage />} />
            <Route path="/syllabus" element={<SyllabusPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </HashRouter>
  )
}
