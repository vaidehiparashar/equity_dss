import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Topbar  from '../components/Topbar'

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-8 bg-slate-50">
          <div className="fade-in max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
