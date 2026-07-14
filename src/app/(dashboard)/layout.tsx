'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import NuruSidebar from '@/components/layout/NuruSidebar'
import NuruHeader from '@/components/layout/NuruHeader'
import { Loader2 } from 'lucide-react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login')
      } else {
        setUser(session.user)
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.push('/login')
      else setUser(session.user)
    })

    return () => subscription.unsubscribe()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-nuru-blue flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-nuru-orange mx-auto mb-4" />
          <p className="text-white text-opacity-70 font-body text-sm">Loading NuruLife Studio...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-nuru-lgray">
      <NuruSidebar pathname={pathname} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <NuruHeader user={user} pathname={pathname} />
        <main className="flex-1 overflow-y-auto p-6 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  )
}