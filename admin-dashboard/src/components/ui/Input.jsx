/**
 * Reusable Input component
 * Props: id, label, type, placeholder, value, onChange, error, icon (Lucide component)
 */
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export default function Input({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  icon: Icon,
  className = '',
  ...rest
}) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType  = isPassword ? (showPassword ? 'text' : 'password') : type

  return (
    <div className={`input-group ${className}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
            <Icon size={16} />
          </div>
        )}
        <input
          id={id}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`
            w-full rounded-lg border bg-white text-sm text-slate-800 placeholder-slate-400
            px-3 py-2.5 outline-none transition-all duration-200
            ${Icon ? 'pl-9' : 'pl-3'}
            ${isPassword ? 'pr-10' : 'pr-3'}
            ${error
              ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
              : 'border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100'
            }
          `}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
  )
}
