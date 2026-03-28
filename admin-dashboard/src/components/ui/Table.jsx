/**
 * components/ui/Table.jsx
 *
 * Enhanced reusable table with:
 *  - Skeleton shimmer loading
 *  - Client-side search filter
 *  - Sortable columns (click header to toggle asc/desc)
 *  - Empty state with icon
 *  - Row count display
 *
 * Props:
 *   columns      – [{ key, header, sortable?, render? }]
 *   data         – array of row objects
 *   loading      – boolean
 *   emptyMessage – string
 *   searchKeys   – array of field keys to include in search (default: all string fields)
 */
import { useState, useMemo } from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown, Search, Inbox } from 'lucide-react'

export default function Table({
  columns      = [],
  data         = [],
  loading      = false,
  emptyMessage = 'No records found.',
  searchKeys   = [],
}) {
  const [query,   setQuery]   = useState('')
  const [sortKey, setSortKey] = useState(null)
  const [sortDir, setSortDir] = useState('asc')   // 'asc' | 'desc'

  // ── Search ────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!query.trim()) return data
    const q = query.toLowerCase()
    const keys = searchKeys.length > 0 ? searchKeys : columns.map((c) => c.key)
    return data.filter((row) =>
      keys.some((k) => String(row[k] ?? '').toLowerCase().includes(q))
    )
  }, [data, query, searchKeys, columns])

  // ── Sort ──────────────────────────────────────────────────
  const sorted = useMemo(() => {
    if (!sortKey) return filtered
    return [...filtered].sort((a, b) => {
      const av = a[sortKey] ?? ''
      const bv = b[sortKey] ?? ''
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true })
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [filtered, sortKey, sortDir])

  const handleSort = (col) => {
    if (!col.sortable) return
    if (sortKey === col.key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(col.key)
      setSortDir('asc')
    }
  }

  const SortIcon = ({ colKey }) => {
    if (sortKey !== colKey) return <ChevronsUpDown size={13} className="text-slate-300" />
    return sortDir === 'asc'
      ? <ChevronUp size={13} className="text-primary-500" />
      : <ChevronDown size={13} className="text-primary-500" />
  }

  return (
    <div className="flex flex-col gap-0">
      {/* ── Toolbar: search + row count ────────────────────── */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-white">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search table…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-8 pr-4 py-1.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 w-52 transition-all"
          />
        </div>
        <span className="text-xs text-slate-400 font-medium">
          {loading ? '…' : `${sorted.length} of ${data.length} rows`}
        </span>
      </div>

      {/* ── Table ────────────────────────────────────────────── */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col)}
                  className={`
                    px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider
                    whitespace-nowrap select-none
                    ${col.sortable ? 'cursor-pointer hover:text-primary-600 hover:bg-slate-100 transition-colors' : ''}
                  `}
                >
                  <div className="flex items-center gap-1.5">
                    {col.header}
                    {col.sortable && <SortIcon colKey={col.key} />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-50">
            {loading ? (
              /* Skeleton rows */
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="bg-white">
                  {columns.map((col) => (
                    <td key={col.key} className="px-5 py-4">
                      <div
                        className="shimmer h-4 rounded-md"
                        style={{ width: `${55 + ((i * col.key.length) % 35)}%` }}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : sorted.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
                    <Inbox size={36} strokeWidth={1.5} />
                    <p className="text-sm">{query ? `No results for "${query}"` : emptyMessage}</p>
                    {query && (
                      <button
                        onClick={() => setQuery('')}
                        className="text-xs text-primary-600 hover:underline"
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              sorted.map((row, rowIdx) => (
                <tr
                  key={row.id ?? rowIdx}
                  className="bg-white hover:bg-primary-50/40 transition-colors duration-150"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-5 py-3.5 text-slate-700 whitespace-nowrap">
                      {col.render
                        ? col.render(row[col.key], row)
                        : (row[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
