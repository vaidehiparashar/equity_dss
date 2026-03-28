import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, LayoutDashboard } from 'lucide-react'
import toast from 'react-hot-toast'
import Input   from '../components/ui/Input'
import Button  from '../components/ui/Button'
import { useAuth }   from '../context/AuthContext'
import { loginUser } from '../api/services'

function validate(form) {
  const errors = {}
  if (!form.email)                    errors.email = 'Email is required'
  else if (!/\S+@\S+\.\S+/.test(form.email)) errors.email = 'Enter a valid email'
  if (!form.password)                 errors.password = 'Password is required'
  else if (form.password.length < 6)  errors.password = 'Minimum 6 characters'
  return errors
}

export default function LoginPage() {
  const { login }  = useAuth()
  const navigate   = useNavigate()
  const [form, setForm]       = useState({ email: '', password: '' })
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.id]: e.target.value }))
    setErrors((prev) => ({ ...prev, [e.target.id]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate(form)
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      const { data } = await loginUser(form)

      // CI4 returns: { status, token, user: { id, email, first_name, last_name, name } }
      const user = data.user
      // Compose display name – controller sets user.name, fallback to first_name
      const displayName = user.name ?? `${user.first_name} ${user.last_name}`.trim()

      login(data.token, { ...user, name: displayName })
      toast.success(`Welcome back, ${displayName}! 👋`)
      navigate('/dashboard')
    } catch (err) {
      // Show the message from CI4 JSON response if available
      const msg = err.response?.data?.message ?? 'Invalid email or password.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex flex-col justify-between w-2/5 bg-sidebar p-12">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center">
            <LayoutDashboard size={18} className="text-white" />
          </div>
          <span className="text-white text-lg font-semibold">AdminPanel</span>
        </div>
        <div>
          <blockquote className="text-2xl font-light text-slate-300 leading-snug">
            "The best tool for managing your team starts with a single sign-in."
          </blockquote>
          <p className="mt-4 text-slate-500 text-sm">— Built for modern teams</p>
        </div>
        <div className="flex gap-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className={`h-1 rounded-full ${i === 0 ? 'w-8 bg-primary-500' : 'w-4 bg-slate-700'}`} />
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <LayoutDashboard size={15} className="text-white" />
            </div>
            <span className="font-semibold text-slate-800">AdminPanel</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Sign in to your account</h2>
            <p className="mt-1.5 text-sm text-slate-500">Enter your credentials to access the dashboard</p>
          </div>

          <form id="form-login" onSubmit={handleSubmit} noValidate className="space-y-5">
            <Input
              id="email"
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
              icon={Mail}
            />
            <Input
              id="password"
              label="Password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              icon={Lock}
            />

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                <input type="checkbox" className="rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
                Remember me
              </label>
              <button type="button" className="text-primary-600 hover:text-primary-700 font-medium">
                Forgot password?
              </button>
            </div>

            <Button id="btn-login" type="submit" loading={loading} className="w-full" size="lg">
              Sign in
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
