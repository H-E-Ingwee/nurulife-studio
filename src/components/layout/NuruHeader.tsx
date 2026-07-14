'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Search, ChevronDown, User, Settings } from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'

const MODULE_NAMES: Record<string, { title: string; subtitle: string }> = {
  '/command-room':  { title: 'Command Room',   subtitle: 'Projects, Tasks & Analytics' },
  '/word-room':     { title: 'Word Room',       subtitle: 'Scripts, AV Scripts & Documents' },
  '/breakdown-room':{ title: 'Breakdown Room',  subtitle: 'Scene Elements & Reports' },
  '/schedule-room': { title: 'Schedule Room',   subtitle: 'Stripboard & Shooting Schedule' },
  '/vision-room':   { title: 'Vision Room',     subtitle: 'Mood Boards, Shot Lists & Storyboards' },
  '/call-room':     { title: 'Call Room',        subtitle: 'Contacts, Call Sheets & Communication' },
}

interface NuruHeaderProps {
  user: any
  pathname: string
}

export default function NuruHeader({ user, pathname }: NuruHeaderProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)

  const moduleKey = Object.keys(MODULE_NAMES).find(k => pathname.startsWith(k)) || '/command-room'
  const module = MODULE_NAMES[moduleKey]
  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Team Member'
  const userRole = user?.user_metadata?.role || 'COLLABORATOR'

  const roleLabels: Record<string, string> = {
    ADMIN:         'Administrator',
    CREATIVE_DIR:  'Creative Director',
    HEAD_PROD:     'Head of Productions',
    HEAD_CREATIVE: 'Head of Creative Arts',
    HEAD_MEDIA:    'Head of Media & Tech',
    HEAD_COMMS:    'Head of Communications',
    COLLABORATOR:  'Collaborator',
  }

  return (
    <header className="h-16 bg-white border-b-2 border-nuru-orange flex items-center px-6 gap-4 flex-shrink-0 shadow-sm">
      {/* Module Title */}
      <div className="flex-1">
        <h2 className="font-heading font-bold text-nuru-maroon text-base leading-tight">
          {module.title}
        </h2>
        <p className="text-gray-400 text-xs font-body">{module.subtitle}</p>
      </div>

      {/* Search */}
      <div className="relative hidden md:block">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search projects, scripts..."
          className="pl-9 pr-4 py-2 bg-nuru-lgray border border-gray-200 rounded-lg text-sm
                     focus:outline-none focus:ring-2 focus:ring-nuru-orange focus:border-transparent
                     w-64 font-body text-nuru-dgray placeholder-gray-400"
        />
      </div>

      {/* Notifications */}
      <button className="relative p-2 rounded-lg hover:bg-nuru-lgray transition-colors">
        <Bell size={18} className="text-gray-500" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-nuru-orange rounded-full" />
      </button>

      {/* User Menu */}
      <div className="relative">
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-nuru-lgray transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-nuru-maroon flex items-center justify-center
                          font-heading font-bold text-white text-xs">
            {getInitials(userName)}
          </div>
          <div className="hidden md:block text-left">
            <p className="font-heading font-semibold text-nuru-dgray text-xs leading-tight">
              {userName}
            </p>
            <p className="text-gray-400 text-[10px]">{roleLabels[userRole] || userRole}</p>
          </div>
          <ChevronDown size={14} className="text-gray-400 hidden md:block" />
        </button>

        {showUserMenu && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg
                          border border-gray-100 py-1 z-50">
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="font-heading font-semibold text-nuru-dgray text-xs">{userName}</p>
              <p className="text-gray-400 text-[10px]">{user?.email}</p>
            </div>
            <button
              onClick={() => { setShowUserMenu(false); router.push('/command-room?tab=profile') }}
              className="w-full flex items-center gap-2 px-4 py-2 text-xs text-gray-600
                         hover:bg-nuru-lgray transition-colors font-body"
            >
              <User size={13} /> My Profile
            </button>
            <button
              onClick={() => { setShowUserMenu(false); router.push('/command-room?tab=settings') }}
              className="w-full flex items-center gap-2 px-4 py-2 text-xs text-gray-600
                         hover:bg-nuru-lgray transition-colors font-body"
            >
              <Settings size={13} /> Settings
            </button>
          </div>
        )}
      </div>
    </header>
  )
}