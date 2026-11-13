import { Link, NavLink, Outlet } from 'react-router-dom'
import { CalendarDays, LogOut, ListChecks, CalendarRange } from 'lucide-react'
import { useAuth } from '../auth/AuthProvider'

export default function Layout() {
  const { signOut, user } = useAuth()

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-inner shell">
          <Link to="/" className="brand">
            <span className="brand-mark">
              <CalendarDays size={18} />
            </span>
            <span className="brand-text">
              SSC CGL <strong>Tracker</strong>
            </span>
          </Link>

          <nav className="main-nav" aria-label="Main">
            <NavLink
              to="/"
              end
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              <CalendarRange size={16} />
              <span>Calendar</span>
            </NavLink>
            <NavLink
              to="/syllabus"
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              <ListChecks size={16} />
              <span>Syllabus</span>
            </NavLink>
          </nav>

          <button
            type="button"
            className="icon-btn"
            onClick={() => void signOut()}
            title={user?.email ? `Sign out (${user.email})` : 'Sign out'}
            aria-label="Sign out"
          >
            <LogOut size={17} />
          </button>
        </div>
      </header>

      <main className="shell app-main">
        <Outlet />
      </main>
    </div>
  )
}
