'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { Loader2 } from 'lucide-react'

const TEAM_ROLES = [
  { value: 'ADMIN',         label: 'Admin — Brian Ingwee (CEO)' },
  { value: 'CREATIVE_DIR',  label: 'Creative Director — Grace Kanyiri (CCO)' },
  { value: 'HEAD_PROD',     label: 'Head of Productions — Esther Karimeri' },
  { value: 'HEAD_CREATIVE', label: 'Head of Creative Arts — Sandra Mutanu' },
  { value: 'HEAD_MEDIA',    label: 'Head of Media & Technology — John Mwadown' },
  { value: 'HEAD_COMMS',    label: 'Head of Communications — David Testimony' },
  { value: 'COLLABORATOR',  label: 'Collaborator / External Partner' },
]

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', role: 'COLLABORATOR',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: { name: form.name, role: form.role },
        },
      })
      if (signUpError) throw signUpError

      // Create user record in our database
      await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: data.user?.id,
          name: form.name,
          email: form.email,
          role: form.role,
        }),
      })

      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-nuru-blue flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✓</span>
          </div>
          <h2 className="font-heading font-bold text-nuru-maroon text-xl mb-2">Account Created!</h2>
          <p className="text-gray-600 text-sm mb-6">
            Welcome to NuruLife Production Studio. Check your email to verify your account, then sign in.
          </p>
          <button onClick={() => router.push('/login')} className="nuru-btn-primary w-full py-3">
            Go to Sign In
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-nuru-blue flex items-center justify-center p-4">
      <div className="relative w-full max-w-md animate-fade-in">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <div className="w-16 h-16 relative">
              <Image src="/logo/nurulife-logo.png" alt="NuruLife Logo" fill className="object-contain" />
            </div>
          </div>
          <h1 className="font-heading font-black text-white text-2xl tracking-widest uppercase">NuruLife</h1>
          <p className="font-heading text-nuru-orange text-xs tracking-[0.3em] uppercase mt-1">Production Studio</p>
        </div>

        <div className="bg-white rounded-xl shadow-2xl p-8">
          <h2 className="font-heading font-bold text-nuru-maroon text-xl mb-1">Create Account</h2>
          <p className="text-gray-500 text-sm mb-6">Join the NuruLife production team</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-md p-3 mb-4 text-sm">{error}</div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="nuru-label">Full Name</label>
              <input name="name" type="text" value={form.name} onChange={handleChange}
                className="nuru-input" placeholder="Brian Ingwee" required />
            </div>
            <div>
              <label className="nuru-label">Email Address</label>
              <input name="email" type="email" value={form.email} onChange={handleChange}
                className="nuru-input" placeholder="brian@nurulifeproductions.com" required />
            </div>
            <div>
              <label className="nuru-label">Your Role</label>
              <select name="role" value={form.role} onChange={handleChange} className="nuru-input">
                {TEAM_ROLES.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="nuru-label">Password</label>
              <input name="password" type="password" value={form.password} onChange={handleChange}
                className="nuru-input" placeholder="Min. 8 characters" required />
            </div>
            <div>
              <label className="nuru-label">Confirm Password</label>
              <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange}
                className="nuru-input" placeholder="Repeat password" required />
            </div>
            <button type="submit" disabled={loading}
              className="w-full nuru-btn-primary py-3 flex items-center justify-center gap-2 mt-2">
              {loading ? <><Loader2 size={16} className="animate-spin" />Creating account...</> : 'Create Account'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-400">
              Already have an account?{' '}
              <a href="/login" className="text-nuru-orange hover:underline font-semibold">Sign In</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}