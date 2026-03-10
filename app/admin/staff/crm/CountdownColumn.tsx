import React from 'react'

interface CountdownColumnProps {
  absoluteEndDate: string | null
  createdAt: string
  roNumber: string
}

export default function CountdownColumn({ 
  absoluteEndDate, 
  createdAt, 
  roNumber 
}: CountdownColumnProps) {
  
  // Calculate days until absolute_end_date
  const calculateCountdown = () => {
    if (!absoluteEndDate) {
      return null
    }

    const endDate = new Date(absoluteEndDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    endDate.setHours(0, 0, 0, 0)

    const diffTime = endDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return diffDays
  }

  const daysRemaining = calculateCountdown()

  // If no absolute_end_date set, show message
  if (daysRemaining === null) {
    return (
      <div className="text-gray-400 text-sm italic">
        No deadline set
      </div>
    )
  }

  // Determine color based on countdown
  const getColorClass = () => {
    if (daysRemaining < 0) {
      return 'bg-red-100 text-red-800 border-red-300' // Overdue
    } else if (daysRemaining === 0) {
      return 'bg-red-100 text-red-800 border-red-300' // Due today
    } else if (daysRemaining <= 3) {
      return 'bg-red-50 text-red-700 border-red-200' // 3 days or less
    } else if (daysRemaining <= 7) {
      return 'bg-orange-50 text-orange-700 border-orange-200' // 1 week or less
    } else if (daysRemaining <= 14) {
      return 'bg-yellow-50 text-yellow-700 border-yellow-200' // 2 weeks or less
    } else {
      return 'bg-green-50 text-green-700 border-green-200' // More than 2 weeks
    }
  }

  // Determine icon
  const getIcon = () => {
    if (daysRemaining < 0) {
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      )
    } else if (daysRemaining <= 7) {
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      )
    } else {
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      )
    }
  }

  // Determine text
  const getText = () => {
    if (daysRemaining < 0) {
      return `${Math.abs(daysRemaining)} ${Math.abs(daysRemaining) === 1 ? 'day' : 'days'} OVERDUE`
    } else if (daysRemaining === 0) {
      return 'DUE TODAY'
    } else if (daysRemaining === 1) {
      return '1 day left'
    } else {
      return `${daysRemaining} days left`
    }
  }

  // Determine if should pulse (urgent)
  const shouldPulse = daysRemaining <= 3

  return (
    <div className="flex items-center gap-2">
      <div 
        className={`
          inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 font-semibold text-sm
          ${getColorClass()}
          ${shouldPulse ? 'animate-pulse' : ''}
          transition-all duration-200
        `}
        title={absoluteEndDate ? `Absolute End Date: ${new Date(absoluteEndDate).toLocaleDateString()}` : 'No end date set'}
      >
        {getIcon()}
        <span>{getText()}</span>
      </div>
      
      {/* Show date */}
      {absoluteEndDate && (
        <div className="text-xs text-gray-500">
          {new Date(absoluteEndDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })}
        </div>
      )}
    </div>
  )
}
