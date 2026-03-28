import { useLocation } from 'react-router-dom'
import { Bell, Search } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const pageTitles = {
  '/dashboard/users':    { title: 'Users',    subtitle: 'Manage all registered users' },
  '/dashboard/teachers': { title: 'Teachers', subtitle: 'Manage all teachers' },
}

export default function Topbar() {
  const { pathname } = useLocation()
  const { user }     = useAuth()
  const page = pageTitles[pathname] ?? { title: 'Dashboard', subtitle: '' }

  return (
    <header className="h-16 flex items-center justify-between px-8 bg-white border-b border-slate-100 shrink-0">
      {/* Left */}
      <div>
        <h1 className="text-lg font-semibold text-slate-800">{page.title}</h1>
        {page.subtitle && <p className="text-xs text-slate-400">{page.subtitle}</p>}
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden sm:block">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="topbar-search"
            type="text"
            placeholder="Search…"
            className="pl-8 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 w-44 transition-all"
          />
        </div>

        {/* Notification bell */}
        <button
          id="btn-notifications"
          className="relative w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors"
        >
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary-500" />
        </button>

        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold">
          {user?.name?.charAt(0).toUpperCase() ?? 'U'}
        </div>
      </div>
    </header>
  )
}
