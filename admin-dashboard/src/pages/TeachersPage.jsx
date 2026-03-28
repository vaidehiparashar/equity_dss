/**
 * pages/TeachersPage.jsx
 *
 * Fetches GET /api/teachers → CI4 does a JOIN between auth_user + teachers
 *
 * CI4 response shape:
 * {
 *   status: true,
 *   teachers: [{
 *     id, user_id, email,
 *     first_name, last_name, name,   ← from auth_user (name = "first last")
 *     university_name, gender, year_joined,
 *     created_at
 *   }],
 *   total: N
 * }
 *
 * Table shows: id | name | email | university | gender | year_joined | actions
 */
import { useState, useEffect, useCallback } from 'react'
import { GraduationCap, UserPlus, RefreshCw, Trash2, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import Table  from '../components/ui/Table'
import Badge  from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { getTeachers, deleteTeacher } from '../api/services'

// ── Colored avatar ─────────────────────────────────────────────────
function AvatarName({ name }) {
  const initial = name?.[0]?.toUpperCase() ?? '?'
  const palette = [
    'bg-violet-100 text-violet-700',
    'bg-sky-100 text-sky-700',
    'bg-teal-100 text-teal-700',
    'bg-fuchsia-100 text-fuchsia-700',
    'bg-orange-100 text-orange-700',
  ]
  const color = palette[(name?.charCodeAt(0) ?? 0) % palette.length]
  return (
    <div className="flex items-center gap-3 min-w-[180px]">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${color}`}>
        {initial}
      </div>
      <span className="font-medium text-slate-800">{name || '—'}</span>
    </div>
  )
}

// ── Gender badge ───────────────────────────────────────────────────
function GenderBadge({ value }) {
  const map = { male: 'blue', female: 'green', other: 'yellow' }
  const label = value ? value.charAt(0).toUpperCase() + value.slice(1) : '—'
  return value ? <Badge label={label} color={map[value] ?? 'slate'} /> : <span className="text-slate-400">—</span>
}

// ── Year chip ──────────────────────────────────────────────────────
function YearChip({ value }) {
  if (!value) return <span className="text-slate-400">—</span>
  const years = new Date().getFullYear() - parseInt(value, 10)
  return (
    <div className="flex flex-col">
      <span className="font-semibold text-slate-700">{value}</span>
      <span className="text-[11px] text-slate-400">
        {years === 0 ? 'This year' : `${years} yr${years !== 1 ? 's' : ''} ago`}
      </span>
    </div>
  )
}

// ── Delete button ──────────────────────────────────────────────────
function DeleteBtn({ id, onDeleted }) {
  const [busy, setBusy] = useState(false)
  const handle = async () => {
    if (!window.confirm('Delete this teacher profile?\nThe user account will remain.')) return
    setBusy(true)
    try {
      await deleteTeacher(id)
      toast.success('Teacher deleted')
      onDeleted()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Failed to delete teacher')
    } finally {
      setBusy(false)
    }
  }
  return (
    <Button variant="danger" size="sm" icon={Trash2} loading={busy} onClick={handle} id={`btn-delete-teacher-${id}`}>
      Delete
    </Button>
  )
}

// ── Column definitions ─────────────────────────────────────────────
const buildColumns = (onDeleted) => [
  {
    key:      'id',
    header:   '#',
    sortable: true,
  },
  {
    key:    'name',
    header: 'Full Name',
    render: (val, row) => (
      // use CI4's computed `name` field (first+last joined in controller)
      <AvatarName name={val || `${row.first_name ?? ''} ${row.last_name ?? ''}`.trim()} />
    ),
  },
  {
    key:      'email',
    header:   'Email',
    sortable: true,
    render:   (val) => (
      <a href={`mailto:${val}`} className="text-primary-600 hover:underline text-sm">
        {val}
      </a>
    ),
  },
  {
    key:      'university_name',
    header:   'University / Institution',
    sortable: true,
    render:   (val) => (
      <span className="max-w-[220px] truncate block" title={val}>{val || '—'}</span>
    ),
  },
  {
    key:    'gender',
    header: 'Gender',
    render: (val) => <GenderBadge value={val} />,
  },
  {
    key:      'year_joined',
    header:   'Year Joined',
    sortable: true,
    render:   (val) => <YearChip value={val} />,
  },
  {
    key:    '_actions',
    header: 'Actions',
    render: (_, row) => <DeleteBtn id={row.id} onDeleted={onDeleted} />,
  },
]

// ── Mock data matching CI4 joined response ─────────────────────────
const MOCK = [
  { id:1, user_id:1, name:'Alice Johnson',  first_name:'Alice',  last_name:'Johnson',  email:'alice@school.com',   university_name:'Massachusetts Institute of Technology', gender:'female', year_joined:'2021', created_at:'2024-01-15' },
  { id:2, user_id:2, name:'Bob Smith',      first_name:'Bob',    last_name:'Smith',    email:'bob@school.com',     university_name:'Stanford University',                   gender:'male',   year_joined:'2019', created_at:'2024-02-20' },
  { id:3, user_id:3, name:'Carol Williams', first_name:'Carol',  last_name:'Williams', email:'carol@school.com',   university_name:'Harvard University',                    gender:'female', year_joined:'2022', created_at:'2024-03-05' },
  { id:4, user_id:4, name:'David Brown',    first_name:'David',  last_name:'Brown',    email:'david@school.com',   university_name:'Oxford University',                     gender:'male',   year_joined:'2015', created_at:'2024-04-18' },
  { id:5, user_id:5, name:'Eva Martinez',   first_name:'Eva',    last_name:'Martinez', email:'eva@school.com',     university_name:'Cambridge University',                  gender:'female', year_joined:'2023', created_at:'2025-01-10' },
]

// ── Unique subject count helper ────────────────────────────────────
const unique = (arr, key) => new Set(arr.map((r) => r[key]).filter(Boolean)).size

// ── Page ───────────────────────────────────────────────────────────
export default function TeachersPage() {
  const [teachers, setTeachers] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)
  const [isMock,   setIsMock]   = useState(false)

  const fetchTeachers = useCallback(async () => {
    setLoading(true)
    setError(null)
    setIsMock(false)
    try {
      const { data } = await getTeachers()
      // CI4 wraps array in data.teachers
      const list = Array.isArray(data) ? data : (data.teachers ?? [])
      setTeachers(list)
    } catch (err) {
      if (err.code === 'ERR_NETWORK' || !err.response || err.response.status >= 500) {
        setTeachers(MOCK)
        setIsMock(true)
        toast('Backend offline — showing demo data', { icon: '⚠️' })
      } else {
        setError(err.response?.data?.message ?? 'Could not load teachers.')
        toast.error('Failed to fetch teachers')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTeachers()
  }, [fetchTeachers])

  const columns      = buildColumns(fetchTeachers)
  const universities = unique(teachers, 'university_name')
  const maleCount    = teachers.filter((t) => t.gender === 'male').length
  const femaleCount  = teachers.filter((t) => t.gender === 'female').length

  return (
    <div className="space-y-6 fade-in">

      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center shadow-sm">
            <GraduationCap size={20} className="text-violet-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-800">Teachers</h1>
            <p className="text-sm text-slate-500">
              All registered teachers with their profiles
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            id="btn-refresh-teachers"
            variant="secondary"
            icon={RefreshCw}
            onClick={fetchTeachers}
            loading={loading}
            size="sm"
          >
            Refresh
          </Button>
          <Button id="btn-add-teacher" icon={UserPlus} size="sm">
            Add Teacher
          </Button>
        </div>
      </div>

      {/* ── Demo mode banner ── */}
      {isMock && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl px-4 py-3 text-sm">
          <AlertCircle size={16} className="shrink-0" />
          <span>
            <strong>Demo mode:</strong> Showing sample data. Start the CI4 backend on port 8001 and refresh.
          </span>
        </div>
      )}

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Teachers',
            value: loading ? '—' : teachers.length,
            color: 'text-slate-800',
            sub:   'registered',
          },
          {
            label: 'Universities',
            value: loading ? '—' : universities,
            color: 'text-violet-600',
            sub:   'institutions',
          },
          {
            label: 'Male',
            value: loading ? '—' : maleCount,
            color: 'text-blue-600',
            sub:   `of ${teachers.length}`,
          },
          {
            label: 'Female',
            value: loading ? '—' : femaleCount,
            color: 'text-pink-500',
            sub:   `of ${teachers.length}`,
          },
        ].map((s) => (
          <div key={s.label} className="card">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{s.label}</p>
            <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Table card ── */}
      <div className="card !p-0 overflow-hidden">
        {/* Card header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-700">All Teachers</h2>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
            isMock ? 'bg-amber-100 text-amber-600' : 'bg-green-50 text-green-600'
          }`}>
            {isMock ? 'Demo Data' : 'Live Data'}
          </span>
        </div>

        {/* Error state */}
        {error ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-500">
            <AlertCircle size={36} strokeWidth={1.5} className="text-red-400" />
            <p className="text-sm text-red-500">{error}</p>
            <Button variant="secondary" icon={RefreshCw} onClick={fetchTeachers}>
              Try again
            </Button>
          </div>
        ) : (
          <Table
            columns={columns}
            data={teachers}
            loading={loading}
            emptyMessage="No teachers found. Register the first teacher!"
            searchKeys={['name', 'first_name', 'last_name', 'email', 'university_name', 'gender']}
          />
        )}
      </div>
    </div>
  )
}
