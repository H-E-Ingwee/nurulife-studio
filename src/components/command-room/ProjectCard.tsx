'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Film, Mic, Theater, FileText, FileVideo, Video,
  MoreVertical, Archive, Edit, ExternalLink,
  Calendar, DollarSign, Users, CheckSquare
} from 'lucide-react'
import { cn, formatDate, formatCurrency, PROJECT_STATUS_COLORS } from '@/lib/utils'
import type { Project } from '@/types'

const PROJECT_TYPE_ICONS: Record<string, any> = {
  SHORT_FILM:       Film,
  FEATURE_FILM:     Film,
  STAGE_PRODUCTION: Theater,
  PODCAST:          Mic,
  DOCUMENTARY:      FileVideo,
  MUSIC_VIDEO:      Video,
  COMMERCIAL:       FileText,
}

const PROJECT_TYPE_LABELS: Record<string, string> = {
  SHORT_FILM:       'Short Film',
  FEATURE_FILM:     'Feature Film',
  STAGE_PRODUCTION: 'Stage Production',
  PODCAST:          'Podcast',
  DOCUMENTARY:      'Documentary',
  MUSIC_VIDEO:      'Music Video',
  COMMERCIAL:       'Commercial',
}

const STATUS_LABELS: Record<string, string> = {
  DEVELOPMENT:     'Development',
  PRE_PRODUCTION:  'Pre-Production',
  PRODUCTION:      'Production',
  POST_PRODUCTION: 'Post-Production',
  DISTRIBUTION:    'Distribution',
  ARCHIVED:        'Archived',
}

const STATUS_COLORS: Record<string, string> = {
  DEVELOPMENT:     'bg-gray-100 text-gray-600',
  PRE_PRODUCTION:  'bg-blue-100 text-blue-700',
  PRODUCTION:      'bg-orange-100 text-orange-700',
  POST_PRODUCTION: 'bg-purple-100 text-purple-700',
  DISTRIBUTION:    'bg-green-100 text-green-700',
  ARCHIVED:        'bg-gray-100 text-gray-400',
}

interface ProjectCardProps {
  project:  Project
  onUpdate: () => void
}

export default function ProjectCard({ project, onUpdate }: ProjectCardProps) {
  const router   = useRouter()
  const [showMenu, setShowMenu] = useState(false)
  const [loading, setLoading]   = useState(false)

  const Icon       = PROJECT_TYPE_ICONS[project.type] || Film
  const budgetUsed = project.budget && project.spent
    ? Math.min(100, Math.round((project.spent / project.budget) * 100))
    : 0
  const isOverBudget = budgetUsed > 90

  async function handleArchive() {
    if (!confirm(`Archive "${project.title}"?`)) return
    setLoading(true)
    try {
      await fetch(`/api/projects/${project.id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ status: 'ARCHIVED' }),
      })
      onUpdate()
    } finally {
      setLoading(false)
      setShowMenu(false)
    }
  }

  function openProject() {
    // Navigate to word room filtered by this project
    router.push(`/word-room?projectId=${project.id}`)
  }

  return (
    <div className="nuru-card hover:shadow-md transition-all duration-200 relative group flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-nuru-maroon bg-opacity-10 flex items-center justify-center flex-shrink-0">
            <Icon size={18} className="text-nuru-maroon" />
          </div>
          <div className="min-w-0">
            <span className={cn('nuru-badge text-[10px]', STATUS_COLORS[project.status])}>
              {STATUS_LABELS[project.status]}
            </span>
            <p className="text-gray-400 text-[10px] mt-0.5">{PROJECT_TYPE_LABELS[project.type]}</p>
          </div>
        </div>

        {/* Menu */}
        <div className="relative flex-shrink-0">
          <button
            onClick={e => { e.stopPropagation(); setShowMenu(!showMenu) }}
            className="p-1 rounded hover:bg-nuru-lgray transition-colors opacity-0 group-hover:opacity-100"
          >
            <MoreVertical size={14} className="text-gray-400" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20">
              <button
                onClick={() => { setShowMenu(false); openProject() }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-600 hover:bg-nuru-lgray"
              >
                <ExternalLink size={12} /> Open Project
              </button>
              <button
                onClick={() => { setShowMenu(false); router.push(`/breakdown-room?projectId=${project.id}`) }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-600 hover:bg-nuru-lgray"
              >
                <FileText size={12} /> Breakdown
              </button>
              <button
                onClick={() => { setShowMenu(false); router.push(`/schedule-room?projectId=${project.id}`) }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-600 hover:bg-nuru-lgray"
              >
                <Calendar size={12} /> Schedule
              </button>
              <div className="border-t border-gray-100 my-1" />
              <button
                onClick={handleArchive}
                disabled={loading}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-500 hover:bg-red-50"
              >
                <Archive size={12} /> Archive
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Title */}
      <h3
        className="font-heading font-bold text-nuru-dgray text-sm mb-1 cursor-pointer hover:text-nuru-maroon transition-colors leading-tight"
        onClick={openProject}
      >
        {project.title}
      </h3>

      {/* Logline */}
      {project.logline && (
        <p className="text-gray-400 text-xs font-body mb-3 line-clamp-2 leading-relaxed flex-1">
          {project.logline}
        </p>
      )}

      {/* Budget Progress */}
      {project.budget && project.budget > 0 && (
        <div className="mb-3">
          <div className="flex justify-between text-[10px] mb-1">
            <span className="text-gray-400">Budget</span>
            <span className={isOverBudget ? 'text-red-500 font-semibold' : 'text-gray-500'}>
              {formatCurrency(project.spent || 0)} / {formatCurrency(project.budget)}
            </span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                isOverBudget ? 'bg-red-400' : budgetUsed > 70 ? 'bg-nuru-orange' : 'bg-green-400'
              )}
              style={{ width: `${budgetUsed}%` }}
            />
          </div>
          <p className="text-[9px] text-gray-400 mt-0.5">{budgetUsed}% used</p>
        </div>
      )}

      {/* Quick Stats */}
      {project._count && (
        <div className="flex items-center gap-3 mb-3 text-[10px] text-gray-400">
          {project._count.scripts > 0 && (
            <span className="flex items-center gap-1">
              <FileText size={10} /> {project._count.scripts} script{project._count.scripts !== 1 ? 's' : ''}
            </span>
          )}
          {project._count.tasks > 0 && (
            <span className="flex items-center gap-1">
              <CheckSquare size={10} /> {project._count.tasks} task{project._count.tasks !== 1 ? 's' : ''}
            </span>
          )}
          {project._count.callSheets > 0 && (
            <span className="flex items-center gap-1">
              <Users size={10} /> {project._count.callSheets} call sheet{project._count.callSheets !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-[10px] text-gray-400 pt-2 border-t border-gray-100 mt-auto">
        <div>
          {project.startDate && (
            <span>Start: {formatDate(project.startDate)}</span>
          )}
          {!project.startDate && (
            <span>Created {formatDate(project.createdAt)}</span>
          )}
        </div>
        <button
          onClick={openProject}
          className="text-nuru-orange font-heading font-semibold hover:text-nuru-maroon transition-colors"
        >
          Open →
        </button>
      </div>
    </div>
  )
}