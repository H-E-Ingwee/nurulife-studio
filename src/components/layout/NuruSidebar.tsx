'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  LayoutDashboard, FileText, Tag, CalendarDays,
  Eye, Phone, LogOut, ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { label: 'Command Room',  href: '/command-room',  icon: LayoutDashboard, desc: 'Projects & Tasks' },
  { label: 'Word Room',     href: '/word-room',     icon: FileText,        desc: 'Scripts & Docs' },
  { label: 'Breakdown Room',href: '/breakdown-room',icon: Tag,             desc: 'Scene Elements' },
  { label: 'Schedule Room', href: '/schedule-room', icon: CalendarDays,    desc: 'Stripboard' },
  { label: 'Vision Room',   href: '/vision-room',   icon: Eye,             desc: 'Mood & Shots' },
  { label: 'Call Room',     href: '/call-room',     icon: Phone,           desc: 'Contacts & Calls' },
]

interface NuruSidebarProps {
  pathname: string
}

export default function NuruSidebar({ pathname }: NuruSidebarProps) {
  const router = useRouter()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="w-60 bg-nuru-blue flex flex-col h-full flex-shrink-0 shadow-xl">
      {/* Logo */}
      <div className="p-5 border-b border-white border-opacity-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 relative flex-shrink-0">
            <Image
              src="/logo/nurulife-logo.png"
              alt="NuruLife Logo"
              fill
              className="object-contain"
            />
          </div>
          <div>
            <h1 className="font-heading font-black text-white text-sm tracking-widest uppercase leading-tight">
              NuruLife
            </h1>
            <p className="font-heading text-nuru-orange text-[9px] tracking-[0.2em] uppercase">
              Production Studio
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        <p className="text-white text-opacity-30 text-[10px] font-heading font-semibold uppercase tracking-widest px-3 mb-3">
          Modules
        </p>
        {NAV_ITEMS.map(item => {
          const isActive = pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
                isActive
                  ? 'bg-nuru-orange bg-opacity-20 border border-nuru-orange border-opacity-30'
                  : 'hover:bg-white hover:bg-opacity-5'
              )}
            >
              <Icon
                size={18}
                className={cn(
                  'flex-shrink-0 transition-colors',
                  isActive ? 'text-nuru-orange' : 'text-white text-opacity-50 group-hover:text-white'
                )}
              />
              <div className="flex-1 min-w-0">
                <p className={cn(
                  'font-heading font-semibold text-xs truncate',
                  isActive ? 'text-white' : 'text-white text-opacity-70 group-hover:text-white'
                )}>
                  {item.label}
                </p>
                <p className="text-white text-opacity-30 text-[10px] truncate">{item.desc}</p>
              </div>
              {isActive && (
                <ChevronRight size={14} className="text-nuru-orange flex-shrink-0" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Scripture */}
      <div className="px-4 py-3 border-t border-white border-opacity-10">
        <p className="text-white text-opacity-30 text-[10px] italic font-body text-center leading-relaxed">
          "You are the light of the world."
        </p>
        <p className="text-nuru-orange text-opacity-60 text-[9px] font-heading text-center mt-0.5">
          Matthew 5:14
        </p>
      </div>

      {/* Sign Out */}
      <div className="p-3 border-t border-white border-opacity-10">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg
                     text-white text-opacity-40 hover:text-white hover:bg-white hover:bg-opacity-5
                     transition-all duration-200 text-xs font-body"
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}