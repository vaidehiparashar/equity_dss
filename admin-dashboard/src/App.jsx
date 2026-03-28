import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage    from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardLayout from './layouts/DashboardLayout'
import UsersPage    from './pages/UsersPage'
import TeachersPage from './pages/TeachersPage'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected dashboard */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index               element={<Navigate to="users" replace />} />
            <Route path="users"    element={<UsersPage />} />
            <Route path="teachers" element={<TeachersPage />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  )
}
