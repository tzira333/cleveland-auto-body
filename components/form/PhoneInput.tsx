'use client'

import { useState, useEffect } from 'react'

interface PhoneInputProps {
  label?: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  placeholder?: string
  className?: string
}

export default function PhoneInput({
  label,
  value,
  onChange,
  required = false,
  placeholder = '216-555-1234',
  className = ''
}: PhoneInputProps) {
  const [displayValue, setDisplayValue] = useState('')

  // Format phone number as user types
  const formatPhoneNumber = (input: string): string => {
    // Remove all non-digit characters
    const digits = input.replace(/\D/g, '')
    
    // Limit to 10 digits
    const limited = digits.slice(0, 10)
    
    // Format as xxx-xxx-xxxx
    if (limited.length <= 3) {
      return limited
    } else if (limited.length <= 6) {
      return `${limited.slice(0, 3)}-${limited.slice(3)}`
    } else {
      return `${limited.slice(0, 3)}-${limited.slice(3, 6)}-${limited.slice(6)}`
    }
  }

  // Update display value when prop value changes
  useEffect(() => {
    setDisplayValue(formatPhoneNumber(value))
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    const formatted = formatPhoneNumber(inputValue)
    setDisplayValue(formatted)
    onChange(formatted)
  }

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <input
        type="tel"
        required={required}
        value={displayValue}
        onChange={handleChange}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maroon focus:border-transparent"
        placeholder={placeholder}
        maxLength={12} // xxx-xxx-xxxx = 12 characters
      />
      <p className="text-xs text-gray-500 mt-1">
        Format: xxx-xxx-xxxx
      </p>
    </div>
  )
}
