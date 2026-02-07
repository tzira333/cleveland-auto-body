'use client'

import { useState, useEffect } from 'react'

interface EmailInputProps {
  label?: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  placeholder?: string
  className?: string
}

export default function EmailInput({
  label,
  value,
  onChange,
  required = false,
  placeholder = 'your.email@example.com',
  className = ''
}: EmailInputProps) {
  const [error, setError] = useState('')
  const [touched, setTouched] = useState(false)

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  // Validate email format
  const validateEmail = (email: string): boolean => {
    if (!email) return true // Allow empty if not required
    return emailRegex.test(email)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.toLowerCase().trim()
    onChange(inputValue)

    if (touched && inputValue && !validateEmail(inputValue)) {
      setError('Please enter a valid email address')
    } else {
      setError('')
    }
  }

  const handleBlur = () => {
    setTouched(true)
    if (value && !validateEmail(value)) {
      setError('Please enter a valid email address')
    }
  }

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <input
        type="email"
        required={required}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-maroon focus:border-transparent ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        placeholder={placeholder}
      />
      {error && (
        <p className="text-xs text-red-600 mt-1">
          {error}
        </p>
      )}
      {!error && touched && value && (
        <p className="text-xs text-green-600 mt-1">
          ✓ Valid email format
        </p>
      )}
    </div>
  )
}