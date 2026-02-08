'use client'

import { useState, FormEvent } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CustomerLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Sign in with Supabase Auth
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) throw signInError

      // Verify this is a customer account (not staff)
      const { data: customerUser, error: customerError } = await supabase
        .from('customer_users')
        .select('*')
        .eq('auth_user_id', data.user?.id)
        .single()

      if (customerError || !customerUser) {
        // Not a customer account - sign out
        await supabase.auth.signOut()
        throw new Error('Invalid customer account. Please register or contact support.')
      }

      if (!customerUser.is_active) {
        await supabase.auth.signOut()
        throw new Error('Your account has been deactivated. Please contact support.')
      }

      // Success - redirect to customer dashboard
      router.push('/portal/dashboard')
      router.refresh()
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.message || 'Failed to sign in. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Customer Login
          </h1>
          <p className="text-gray-600">
            Access your appointments and vehicle information
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your.email@example.com"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                autoComplete="current-password"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <Link 
                href="/portal/auth/register" 
                className="text-red-600 hover:text-red-700 font-medium"
              >
                Create an account
              </Link>
              <Link 
                href="/portal/auth/reset-password" 
                className="text-gray-600 hover:text-gray-700 font-medium"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-semibold text-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Alternative Access */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600 mb-3">
              Don't have an account yet?
            </p>
            <Link
              href="/portal/auth/register"
              className="block w-full text-center bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Register Now
            </Link>
          </div>

          {/* Quick Access */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600 mb-3">
              Or use quick access (no account needed)
            </p>
            <Link
              href="/portal"
              className="block w-full text-center bg-blue-50 text-blue-700 py-3 px-6 rounded-lg font-semibold hover:bg-blue-100 transition-colors border border-blue-200"
            >
              Quick Lookup by Phone
            </Link>
          </div>

          {/* Contact Info */}
          <div className="mt-8 text-center text-sm text-gray-600">
            <p className="mb-1">
              <strong>Need Help?</strong>
            </p>
            <p>
              Call us at{' '}
              <a href="tel:+12164818696" className="text-red-600 font-semibold hover:underline">
                (216) 481-8696
              </a>
            </p>
          </div>
        </div>

        {/* Staff Portal Link */}
        <div className="mt-6 text-center">
          <Link 
            href="/admin/staff/login" 
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Staff Portal →
          </Link>
        </div>
      </div>
    </div>
  )
}
