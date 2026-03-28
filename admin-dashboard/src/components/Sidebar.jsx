import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Users, GraduationCap, LayoutDashboard, LogOut, Settings } from 'lucide-react'
import toast from 'react-hot-toast'
import { logoutUser } from '../api/services'

const navItems = [
  { to: '/dashboard/users',    label: 'Users',    icon: Users },
  { to: '/dashboard/teachers', label: 'Teachers', icon: GraduationCap },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logoutUser()   // revoke token on CI4 server
    } catch {
      // silently ignore – still log out locally
    }
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-sidebar text-white shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
          <LayoutDashboard size={16} className="text-white" />
        </div>
        <span className="text-base font-semibold tracking-tight">AdminPanel</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-1">
        <p className="px-4 mb-3 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
          Management
        </p>
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            id={`nav-${label.toLowerCase()}`}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User card */}
      <div className="px-3 pb-5 space-y-1 border-t border-sidebar-border pt-4">
        <button className="nav-link w-full">
          <Settings size={17} />
          Settings
        </button>
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-8 h-8 rounded-full bg-primary-700 flex items-center justify-center text-xs font-bold shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name ?? 'User'}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email ?? ''}</p>
          </div>
        </div>
        <button
          id="btn-logout"
          onClick={handleLogout}
          className="nav-link w-full text-red-400 hover:text-red-300 hover:bg-red-900/20"
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </aside>
  )
}
