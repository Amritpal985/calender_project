import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { CalendarDays, Eye, EyeOff, Loader2, LockKeyhole } from 'lucide-react'
import { useAuth } from '../auth/AuthProvider'

export default function Login() {
  const { user, loading, signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!loading && user) return <Navigate to="/" replace />

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    const message = await signIn(email.trim(), password)
    setSubmitting(false)
    if (message) setError(message)
  }

  return (
    <div className="auth-page">
      <div className="auth-glow" aria-hidden="true" />
      <div className="auth-card">
        <div className="auth-brand">
          <span className="brand-mark large">
            <CalendarDays size={22} />
          </span>
          <div>
            <h1>SSC CGL Tracker</h1>
            <p>Your private study planner</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoFocus
            />
          </label>

          <label className="field">
            <span>Password</span>
            <div className="password-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>

          {error && (
            <div className="banner-error" role="alert">
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? <Loader2 size={17} className="spin" /> : <LockKeyhole size={16} />}
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="auth-note">
          Private instance. Only your account can read or write this data.
        </p>
      </div>
    </div>
  )
}
