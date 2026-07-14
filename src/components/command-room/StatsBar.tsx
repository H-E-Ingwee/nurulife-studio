'use client'

import { Film, CheckSquare, TrendingUp, Users } from 'lucide-react'
import type { Project } from '@/types'

interface StatsBarProps {
  projects: Project[]
}

export default function StatsBar({ projects }: StatsBarProps) {
  const active    = projects.filter(p => p.status !== 'ARCHIVED').length
  const inProd    = projects.filter(p => p.status === 'PRODUCTION').length
  const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0)
  const totalSpent  = projects.reduce((sum, p) => sum + (p.spent  || 0), 0)

  const stats = [
    { label: 'Active Projects',    value: active,    icon: Film,        color: 'text-nuru-maroon', bg: 'bg-red-50' },
    { label: 'In Production',      value: inProd,    icon: TrendingUp,  color: 'text-nuru-orange', bg: 'bg-orange-50' },
    { label: 'Total Budget (KES)', value: `${(totalBudget/1000).toFixed(0)}K`, icon: CheckSquare, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Spent (KES)',  value: `${(totalSpent/1000).toFixed(0)}K`,  icon: Users,       color: 'text-green-600', bg: 'bg-green-50' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {stats.map(stat => {
        const Icon = stat.icon
        return (
          <div key={stat.label} className="nuru-card flex items-center gap-4">
            <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center flex-shrink-0`}>
              <Icon size={20} className={stat.color} />
            </div>
            <div>
              <p className="font-heading font-black text-nuru-dgray text-xl leading-tight">{stat.value}</p>
              <p className="text-gray-400 text-xs font-body">{stat.label}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}