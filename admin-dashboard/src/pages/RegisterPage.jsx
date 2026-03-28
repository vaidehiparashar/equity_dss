import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Lock, Building2, LayoutDashboard, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'
import Input  from '../components/ui/Input'
import Button from '../components/ui/Button'
import { useAuth }      from '../context/AuthContext'
import { registerUser } from '../api/services'

// ── Validation ────────────────────────────────────────────────────
function validate(form) {
  const errors = {}
  const currentYear = new Date().getFullYear()

  if (!form.first_name || form.first_name.trim().length < 2)
    errors.first_name = 'First name must be at least 2 characters'

  if (!form.last_name || form.last_name.trim().length < 2)
    errors.last_name = 'Last name must be at least 2 characters'

  if (!form.email)
    errors.email = 'Email is required'
  else if (!/\S+@\S+\.\S+/.test(form.email))
    errors.email = 'Enter a valid email address'

  if (!form.password)
    errors.password = 'Password is required'
  else if (form.password.length < 6)
    errors.password = 'Minimum 6 characters'

  if (!form.confirm)
    errors.confirm = 'Please confirm your password'
  else if (form.confirm !== form.password)
    errors.confirm = 'Passwords do not match'

  if (!form.university_name || form.university_name.trim().length < 2)
    errors.university_name = 'University name is required'

  if (!form.gender)
    errors.gender = 'Please select a gender'

  if (!form.year_joined)
    errors.year_joined = 'Year joined is required'
  else if (form.year_joined < 1980 || form.year_joined > currentYear)
    errors.year_joined = `Enter a year between 1980 and ${currentYear}`

  return errors
}

// ── Password strength meter ───────────────────────────────────────
function getStrength(password) {
  if (!password) return 0
  let s = 0
  if (password.length >= 6)  s++
  if (password.length >= 10) s++
  if (/[A-Z]/.test(password) && /[0-9]/.test(password)) s++
  return s
}

// ── Reusable select field  ────────────────────────────────────────
function SelectField({ id, label, value, onChange, error, children }) {
  return (
    <div className="input-group">
      <label htmlFor={id} className="text-sm font-medium text-slate-700">{label}</label>
      <select
        id={id}
        value={value}
        onChange={onChange}
        className={`
          w-full rounded-lg border bg-white text-sm px-3 py-2.5 outline-none
          transition-all duration-200 appearance-none cursor-pointer
          ${error
            ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 text-red-500'
            : value
              ? 'border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 text-slate-800'
              : 'border-slate-200 text-slate-400'
          }
        `}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────
export default function RegisterPage() {
  const { login }  = useAuth()
  const navigate   = useNavigate()

  const [form, setForm] = useState({
    first_name:      '',
    last_name:       '',
    email:           '',
    password:        '',
    confirm:         '',
    university_name: '',
    gender:          '',
    year_joined:     '',
  })
  const [errors,  setErrors]  = useState({})
  const [loading, setLoading] = useState(false)

  // Generic change handler — works for both input and select
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.id]: e.target.value }))
    setErrors((prev) => ({ ...prev, [e.target.id]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate(form)
    if (Object.keys(errs).length) {
      setErrors(errs)
      toast.error('Please fix the errors below.')
      return
    }

    setLoading(true)
    try {
      // Send all fields to CI4 — it inserts auth_user + teachers in one transaction
      const payload = {
        first_name:      form.first_name.trim(),
        last_name:       form.last_name.trim(),
        email:           form.email.trim(),
        password:        form.password,
        university_name: form.university_name.trim(),
        gender:          form.gender,
        year_joined:     parseInt(form.year_joined, 10),
      }

      const { data } = await registerUser(payload)

      // CI4 returns: { status, token, user: { id, email, first_name, last_name } }
      const user = data.user
      const displayName = user.name ?? `${user.first_name} ${user.last_name}`.trim()

      login(data.token, { ...user, name: displayName })
      toast.success('Account created! Welcome aboard 🎉')
      navigate('/dashboard')
    } catch (err) {
      // Handle CI4 validation errors (422) or other server errors
      if (err.response?.status === 422) {
        const apiErrors = err.response.data?.errors ?? {}
        setErrors(apiErrors)
        toast.error('Please check the highlighted fields.')
      } else {
        const msg = err.response?.data?.message ?? 'Registration failed. Please try again.'
        toast.error(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  const strength      = getStrength(form.password)
  const strengthLabel = ['', 'Weak', 'Fair', 'Strong'][strength]
  const strengthColor = ['', 'bg-red-400', 'bg-yellow-400', 'bg-green-500'][strength]

  return (
    <div className="min-h-screen flex">

      {/* ── Left decorative panel ─────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between w-2/5 bg-sidebar p-12">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center">
            <LayoutDashboard size={18} className="text-white" />
          </div>
          <span className="text-white text-lg font-semibold">AdminPanel</span>
        </div>

        <div>
          <h3 className="text-2xl font-light text-slate-300 leading-snug">
            "Empower your team with the right tools from day&nbsp;one."
          </h3>
          <p className="mt-4 text-slate-500 text-sm">
            Join teams already using AdminPanel
          </p>
          <div className="mt-8 space-y-3">
            {[
              '✓ Secure token-based authentication',
              '✓ Users & Teachers management',
              '✓ Real-time data tables',
            ].map((t) => (
              <p key={t} className="text-slate-400 text-sm">{t}</p>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full ${i === 1 ? 'w-8 bg-primary-500' : 'w-4 bg-slate-700'}`}
            />
          ))}
        </div>
      </div>

      {/* ── Right form panel ──────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto bg-slate-50">
        <div className="w-full max-w-lg py-10">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <LayoutDashboard size={15} className="text-white" />
            </div>
            <span className="font-semibold text-slate-800">AdminPanel</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Create your account</h2>
            <p className="mt-1.5 text-sm text-slate-500">
              Fill in all fields below to register as a teacher.
            </p>
          </div>

          <form id="form-register" onSubmit={handleSubmit} noValidate className="space-y-5">

            {/* ── Section: Personal Info ── */}
            <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-card space-y-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                Personal Information
              </p>

              {/* First name + Last name side by side */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  id="first_name"
                  label="First name"
                  type="text"
                  placeholder="Alice"
                  value={form.first_name}
                  onChange={handleChange}
                  error={errors.first_name}
                  icon={User}
                />
                <Input
                  id="last_name"
                  label="Last name"
                  type="text"
                  placeholder="Smith"
                  value={form.last_name}
                  onChange={handleChange}
                  error={errors.last_name}
                  icon={User}
                />
              </div>

              <Input
                id="email"
                label="Email address"
                type="email"
                placeholder="alice@university.edu"
                value={form.email}
                onChange={handleChange}
                error={errors.email}
                icon={Mail}
              />
            </div>

            {/* ── Section: Security ── */}
            <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-card space-y-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                Security
              </p>

              <div>
                <Input
                  id="password"
                  label="Password"
                  type="password"
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  error={errors.password}
                  icon={Lock}
                />
                {/* Password strength bar */}
                {form.password && (
                  <div className="mt-2">
                    <div className="flex gap-1">
                      {[1, 2, 3].map((n) => (
                        <div
                          key={n}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            n <= strength ? strengthColor : 'bg-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs mt-1 text-slate-400">
                      Strength:{' '}
                      <span className="font-semibold text-slate-600">{strengthLabel}</span>
                    </p>
                  </div>
                )}
              </div>

              <Input
                id="confirm"
                label="Confirm password"
                type="password"
                placeholder="Repeat your password"
                value={form.confirm}
                onChange={handleChange}
                error={errors.confirm}
                icon={Lock}
              />
            </div>

            {/* ── Section: Teacher Details ── */}
            <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-card space-y-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                Teacher Details
              </p>

              <Input
                id="university_name"
                label="University / Institution"
                type="text"
                placeholder="e.g. Massachusetts Institute of Technology"
                value={form.university_name}
                onChange={handleChange}
                error={errors.university_name}
                icon={Building2}
              />

              <div className="grid grid-cols-2 gap-4">
                <SelectField
                  id="gender"
                  label="Gender"
                  value={form.gender}
                  onChange={handleChange}
                  error={errors.gender}
                >
                  <option value="" disabled>Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </SelectField>

                <Input
                  id="year_joined"
                  label="Year joined"
                  type="number"
                  placeholder={`e.g. ${new Date().getFullYear() - 2}`}
                  value={form.year_joined}
                  onChange={handleChange}
                  error={errors.year_joined}
                  icon={Calendar}
                  min="1980"
                  max={new Date().getFullYear()}
                />
              </div>
            </div>

            {/* ── Submit ── */}
            <Button
              id="btn-register"
              type="submit"
              loading={loading}
              className="w-full"
              size="lg"
            >
              {loading ? 'Creating account…' : 'Create account'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
