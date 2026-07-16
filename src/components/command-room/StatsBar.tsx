'use client'

import { Film, CheckSquare, TrendingUp, Users, DollarSign, Calendar } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { Project } from '@/types'

interface StatsBarProps {
  projects: Project[]
}

export default function StatsBar({ projects }: StatsBarProps) {
  const active       = projects.filter(p => p.status !== 'ARCHIVED').length
  const inProd       = projects.filter(p => p.status === 'PRODUCTION').length
  const preProd      = projects.filter(p => p.status === 'PRE_PRODUCTION').length
  const totalBudget  = projects.reduce((sum, p) => sum + (p.budget  || 0), 0)
  const totalSpent   = projects.reduce((sum, p) => sum + (p.spent   || 0), 0)
  const budgetPct    = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0

  const stats = [
    {
      label:    'Active Projects',
      value:    String(active),
      sub:      `${preProd} in pre-production`,
      icon:     Film,
      color:    'text-nuru-maroon',
      bg:       'bg-red-50',
      border:   'border-l-nuru-maroon',
    },
    {
      label:    'In Production',
      value:    String(inProd),
      sub:      inProd === 0 ? 'None currently shooting' : 'Currently shooting',
      icon:     TrendingUp,
      color:    'text-nuru-orange',
      bg:       'bg-orange-50',
      border:   'border-l-nuru-orange',
    },
    {
      label:    'Total Budget',
      value:    totalBudget > 0 ? formatCurrency(totalBudget) : 'Not set',
      sub:      totalBudget > 0 ? `${budgetPct}% spent` : 'Add budget to projects',
      icon:     DollarSign,
      color:    'text-blue-600',
      bg:       'bg-blue-50',
      border:   'border-l-blue-500',
    },
    {
      label:    'Total Spent',
      value:    totalSpent > 0 ? formatCurrency(totalSpent) : 'KES 0',
      sub:      totalBudget > 0 ? `${formatCurrency(totalBudget - totalSpent)} remaining` : 'No budget set',
      icon:     CheckSquare,
      color:    budgetPct > 80 ? 'text-red-500' : 'text-green-600',
      bg:       budgetPct > 80 ? 'bg-red-50' : 'bg-green-50',
      border:   budgetPct > 80 ? 'border-l-red-500' : 'border-l-green-500',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {stats.map(stat => {
        const Icon = stat.icon
        return (
          <div
            key={stat.label}
            className={`nuru-card flex items-center gap-4 border-l-4 ${stat.border}`}
          >
            <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center flex-shrink-0`}>
              <Icon size={20} className={stat.color} />
            </div>
            <div className="min-w-0">
              <p className="font-heading font-black text-nuru-dgray text-lg leading-tight truncate">
                {stat.value}
              </p>
              <p className="text-gray-400 text-[10px] font-body leading-tight">{stat.label}</p>
              <p className="text-gray-300 text-[9px] font-body truncate">{stat.sub}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}