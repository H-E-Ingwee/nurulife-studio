'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      router.push('/command-room')
    } catch (err: any) {
      setError(err.message || 'Invalid email or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-nuru-blue flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #F27D16 0%, transparent 50%),
                            radial-gradient(circle at 75% 75%, #730E20 0%, transparent 50%)`,
        }}
      />

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Logo & Brand */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 relative">
              <Image
                src="/logo/nurulife-logo.png"
                alt="NuruLife Productions Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
          <h1 className="font-heading font-black text-white text-3xl tracking-widest uppercase">
            NuruLife
          </h1>
          <p className="font-heading font-semibold text-nuru-orange text-sm tracking-[0.3em] uppercase mt-1">
            Production Studio
          </p>
          <div className="border-t border-nuru-orange border-opacity-40 my-4 mx-8" />
          <p className="text-white text-opacity-70 text-sm italic font-body">
            "Shining Light, Transforming Lives."
          </p>
          <p className="text-white text-opacity-40 text-xs mt-1 font-body">
            Matthew 5:14–16
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-xl shadow-2xl p-8">
          <h2 className="font-heading font-bold text-nuru-maroon text-xl mb-1">
            Welcome Back
          </h2>
          <p className="text-gray-500 text-sm mb-6 font-body">
            Sign in to your production workspace
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-md p-3 mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="nuru-label">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="nuru-input"
                placeholder="you@nurulifeproductions.com"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="nuru-label">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="nuru-input pr-10"
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full nuru-btn-primary py-3 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400 font-body">
              Don't have an account?{' '}
              <a href="/register" className="text-nuru-orange hover:underline font-semibold">
                Request Access
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-white text-opacity-30 text-xs mt-6 font-body">
          NuruLife Productions © 2026 · Nairobi, Kenya · Internal Use Only
        </p>
      </div>
    </div>
  )
}