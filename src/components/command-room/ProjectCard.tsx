'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Film, Mic, Theater, FileVideo, BookOpen, Video, MoreVertical, Archive, Edit } from 'lucide-react'
import { cn, formatDate, formatCurrency, PROJECT_STATUS_COLORS } from '@/lib/utils'
import type { Project } from '@/types'

const PROJECT_TYPE_ICONS: Record<string, any> = {
  SHORT_FILM:       Film,
  FEATURE_FILM:     Film,
  STAGE_PRODUCTION: Theater,
  PODCAST:          Mic,
  DOCUMENTARY:      FileVideo,
  MUSIC_VIDEO:      Video,
  COMMERCIAL:       BookOpen,
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

interface ProjectCardProps {
  project: Project
  onUpdate: () => void
}

export default function ProjectCard({ project, onUpdate }: ProjectCardProps) {
  const router = useRouter()
  const [showMenu, setShowMenu] = useState(false)
  const [archiving, setArchiving] = useState(false)

  const Icon = PROJECT_TYPE_ICONS[project.type] || Film
  const budgetUsed = project.budget && project.spent
    ? Math.min(100, Math.round((project.spent / project.budget) * 100))
    : 0

  async function handleArchive() {
    setArchiving(true)
    try {
      await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ARCHIVED' }),
      })
      onUpdate()
    } catch (err) {
      console.error(err)
    } finally {
      setArchiving(false)
      setShowMenu(false)
    }
  }

  return (
    <div className="nuru-card hover:shadow-md transition-all duration-200 relative group">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-nuru-maroon bg-opacity-10 flex items-center justify-center">
            <Icon size={18} className="text-nuru-maroon" />
          </div>
          <div>
            <span className={cn('nuru-badge text-[10px]', PROJECT_STATUS_COLORS[project.status])}>
              {STATUS_LABELS[project.status]}
            </span>
            <p className="text-gray-400 text-[10px] mt-0.5">{PROJECT_TYPE_LABELS[project.type]}</p>
          </div>
        </div>

        {/* Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 rounded hover:bg-nuru-lgray transition-colors opacity-0 group-hover:opacity-100"
          >
            <MoreVertical size={14} className="text-gray-400" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10">
              <button
                onClick={() => { setShowMenu(false); router.push(`/command-room/${project.id}`) }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-600 hover:bg-nuru-lgray"
              >
                <Edit size={12} /> Edit Project
              </button>
              <button
                onClick={handleArchive}
                disabled={archiving}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-500 hover:bg-nuru-lgray"
              >
                <Archive size={12} /> Archive
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Title */}
      <h3
        className="font-heading font-bold text-nuru-dgray text-sm mb-1 cursor-pointer hover:text-nuru-maroon transition-colors"
        onClick={() => router.push(`/command-room/${project.id}`)}
      >
        {project.title}
      </h3>

      {project.logline && (
        <p className="text-gray-400 text-xs font-body mb-3 line-clamp-2">{project.logline}</p>
      )}

      {/* Budget Progress */}
      {project.budget && (
        <div className="mb-3">
          <div className="flex justify-between text-[10px] text-gray-400 mb-1">
            <span>Budget</span>
            <span>{formatCurrency(project.spent || 0)} / {formatCurrency(project.budget)}</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all', budgetUsed > 80 ? 'bg-red-400' : 'bg-nuru-orange')}
              style={{ width: `${budgetUsed}%` }}
            />
          </div>
        </div>
      )}

      {/* Dates */}
      <div className="flex items-center justify-between text-[10px] text-gray-400 pt-2 border-t border-gray-100">
        {project.startDate && (
          <span>Start: {formatDate(project.startDate)}</span>
        )}
        {project.endDate && (
          <span>End: {formatDate(project.endDate)}</span>
        )}
        {!project.startDate && !project.endDate && (
          <span>Created {formatDate(project.createdAt)}</span>
        )}
      </div>
    </div>
  )
}