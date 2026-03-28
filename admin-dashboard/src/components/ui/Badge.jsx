/**
 * Badge component for status pills
 */
const colorMap = {
  green:  'bg-green-50  text-green-700  ring-green-200',
  red:    'bg-red-50    text-red-700    ring-red-200',
  blue:   'bg-blue-50   text-blue-700   ring-blue-200',
  yellow: 'bg-yellow-50 text-yellow-700 ring-yellow-200',
  slate:  'bg-slate-100 text-slate-600  ring-slate-200',
}

export default function Badge({ label, color = 'slate' }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${colorMap[color]}`}>
      {label}
    </span>
  )
}
