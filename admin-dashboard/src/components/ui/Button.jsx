/**
 * Reusable Button component
 * Props: variant ('primary'|'secondary'|'danger'|'ghost'), size ('sm'|'md'|'lg'),
 *        loading, icon (Lucide), children, className, ...rest
 */
import { Loader2 } from 'lucide-react'

const variants = {
  primary:   'bg-primary-600 hover:bg-primary-700 text-white shadow-sm',
  secondary: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm',
  danger:    'bg-red-500 hover:bg-red-600 text-white shadow-sm',
  ghost:     'bg-transparent hover:bg-slate-100 text-slate-600',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
}

export default function Button({
  variant  = 'primary',
  size     = 'md',
  loading  = false,
  icon: Icon,
  children,
  className = '',
  disabled,
  ...rest
}) {
  return (
    <button
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 rounded-lg font-medium
        transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-1
        disabled:opacity-60 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...rest}
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        Icon && <Icon size={16} />
      )}
      {children}
    </button>
  )
}
