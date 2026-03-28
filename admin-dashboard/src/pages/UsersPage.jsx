/**
 * pages/UsersPage.jsx
 *
 * Fetches GET /api/users → displays user account info
 * CI4 response: { status, users: [{ id, email, first_name, last_name, created_at }], total }
 */
import { useState, useEffect, useCallback } from 'react'
import { Users, UserPlus, RefreshCw, Trash2, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import Table  from '../components/ui/Table'
import Button from '../components/ui/Button'
import { getUsers, deleteUser } from '../api/services'

// ── Avatar + full name cell ────────────────────────────────────────
function NameCell({ firstName, lastName }) {
  const name = `${firstName ?? ''} ${lastName ?? ''}`.trim() || '—'
  const initials = (firstName?.[0] ?? '').toUpperCase() + (lastName?.[0] ?? '').toUpperCase()
  const colors = [
    'bg-blue-100 text-blue-700',
    'bg-violet-100 text-violet-700',
    'bg-emerald-100 text-emerald-700',
    'bg-amber-100 text-amber-700',
    'bg-rose-100 text-rose-700',
  ]
  // Stable color derived from name
  const color = colors[(firstName?.charCodeAt(0) ?? 0) % colors.length]

  return (
    <div className="flex items-center gap-3 min-w-[180px]">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${color}`}>
        {initials || '?'}
      </div>
      <span className="font-medium text-slate-800">{name}</span>
    </div>
  )
}

// ── Date badge ─────────────────────────────────────────────────────
function DateCell({ value }) {
  if (!value) return <span className="text-slate-400">—</span>
  const date = new Date(value)
  return (
    <span className="text-slate-600 text-xs bg-slate-100 px-2.5 py-1 rounded-full font-medium">
      {date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
    </span>
  )
}

// ── Delete button (per row) ────────────────────────────────────────
function DeleteBtn({ id, onDeleted }) {
  const [busy, setBusy] = useState(false)

  const handleDelete = async () => {
    if (!window.confirm('Permanently delete this user?\nThis will also remove their teacher profile.')) return
    setBusy(true)
    try {
      await deleteUser(id)
      toast.success('User deleted successfully')
      onDeleted()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Failed to delete user')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Button
      variant="danger"
      size="sm"
      icon={Trash2}
      loading={busy}
      onClick={handleDelete}
      id={`btn-delete-user-${id}`}
    >
      Delete
    </Button>
  )
}

// ── Column definitions (matched to CI4 auth_user response) ──────────
const buildColumns = (onDeleted) => [
  {
    key:      'id',
    header:   '#',
    sortable: true,
  },
  {
    key:    'first_name',
    header: 'Name',
    render: (val, row) => (
      <NameCell firstName={row.first_name} lastName={row.last_name} />
    ),
  },
  {
    key:      'email',
    header:   'Email',
    sortable: true,
    render:   (val) => (
      <a href={`mailto:${val}`} className="text-primary-600 hover:underline">
        {val}
      </a>
    ),
  },
  {
    key:      'created_at',
    header:   'Date Joined',
    sortable: true,
    render:   (val) => <DateCell value={val} />,
  },
  {
    key:    '_actions',
    header: 'Actions',
    render: (_, row) => <DeleteBtn id={row.id} onDeleted={onDeleted} />,
  },
]

// ── Mock data (shown when backend isn't reachable) ─────────────────
const MOCK = [
  { id: 1, first_name: 'Alice',   last_name: 'Johnson',  email: 'alice@example.com',   created_at: '2024-01-15 09:00:00' },
  { id: 2, first_name: 'Bob',     last_name: 'Smith',    email: 'bob@example.com',     created_at: '2024-02-20 14:30:00' },
  { id: 3, first_name: 'Carol',   last_name: 'Williams', email: 'carol@example.com',   created_at: '2024-03-05 11:00:00' },
  { id: 4, first_name: 'David',   last_name: 'Brown',    email: 'david@example.com',   created_at: '2024-04-18 16:15:00' },
  { id: 5, first_name: 'Eva',     last_name: 'Martinez', email: 'eva@example.com',     created_at: '2025-01-10 08:45:00' },
]

// ── Page ───────────────────────────────────────────────────────────
export default function UsersPage() {
  const [users,   setUsers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const [isMock,  setIsMock]  = useState(false)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    setIsMock(false)
    try {
      const { data } = await getUsers()
      // CI4 wraps array in data.users
      const list = Array.isArray(data) ? data : (data.users ?? [])
      setUsers(list)
    } catch (err) {
      if (err.code === 'ERR_NETWORK' || !err.response || err.response.status >= 500) {
        // Backend not running – show demo data
        setUsers(MOCK)
        setIsMock(true)
        toast('Backend offline — showing demo data', { icon: '⚠️' })
      } else {
        setError(err.response?.data?.message ?? 'Could not load users.')
        toast.error('Failed to fetch users')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const thisMonth = users.filter((u) => {
    if (!u.created_at) return false
    const d = new Date(u.created_at)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  const columns = buildColumns(fetchUsers)

  return (
    <div className="space-y-6 fade-in">

      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center shadow-sm">
            <Users size={20} className="text-primary-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-800">Users</h1>
            <p className="text-sm text-slate-500">
              All registered user accounts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            id="btn-refresh-users"
            variant="secondary"
            icon={RefreshCw}
            onClick={fetchUsers}
            loading={loading}
            size="sm"
          >
            Refresh
          </Button>
          <Button id="btn-add-user" icon={UserPlus} size="sm">
            Add User
          </Button>
        </div>
      </div>

      {/* ── Demo data banner ── */}
      {isMock && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl px-4 py-3 text-sm">
          <AlertCircle size={16} className="shrink-0" />
          <span>
            <strong>Demo mode:</strong> Showing sample data. Start the CI4 backend on port 8001 and refresh.
          </span>
        </div>
      )}

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
            Total Users
          </p>
          <p className="text-3xl font-bold text-slate-800 mt-1">{loading ? '—' : users.length}</p>
        </div>
        <div className="card">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
            Joined This Month
          </p>
          <p className="text-3xl font-bold text-primary-600 mt-1">{loading ? '—' : thisMonth}</p>
        </div>
        <div className="card col-span-2 sm:col-span-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
            Previous Months
          </p>
          <p className="text-3xl font-bold text-slate-500 mt-1">
            {loading ? '—' : users.length - thisMonth}
          </p>
        </div>
      </div>

      {/* ── Table card ── */}
      <div className="card !p-0 overflow-hidden">
        {/* Card header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-700">All Registered Users</h2>
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
            <Button variant="secondary" icon={RefreshCw} onClick={fetchUsers}>
              Try again
            </Button>
          </div>
        ) : (
          <Table
            columns={columns}
            data={users}
            loading={loading}
            emptyMessage="No users found. Register the first user!"
            searchKeys={['first_name', 'last_name', 'email']}
          />
        )}
      </div>
    </div>
  )
}
