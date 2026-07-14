'use client'

import { useState, useEffect } from 'react'
import { Plus, Film, Mic, Theater, FileVideo, BookOpen, Video, TrendingUp, CheckSquare, Calendar, Users } from 'lucide-react'
import { cn, formatDate, formatCurrency, PROJECT_STATUS_COLORS } from '@/lib/utils'
import type { Project } from '@/types'
import ProjectCard from '@/components/command-room/ProjectCard'
import CreateProjectModal from '@/components/command-room/CreateProjectModal'
import TaskBoard from '@/components/command-room/TaskBoard'
import StatsBar from '@/components/command-room/StatsBar'

const TABS = [
  { id: 'overview', label: 'Overview', icon: TrendingUp },
  { id: 'projects', label: 'Projects', icon: Film },
  { id: 'tasks',    label: 'Tasks',    icon: CheckSquare },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
]

export default function CommandRoomPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [])

  async function fetchProjects() {
    try {
      const res = await fetch('/api/projects')
      const data = await res.json()
      setProjects(data.data || [])
    } catch (err) {
      console.error('Failed to fetch projects:', err)
    } finally {
      setLoading(false)
    }
  }

  const activeProjects = projects.filter(p => p.status !== 'ARCHIVED')
  const inProduction  = projects.filter(p => p.status === 'PRODUCTION')

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading font-black text-nuru-maroon text-2xl">
            Command Room
          </h1>
          <p className="text-gray-500 text-sm font-body mt-0.5">
            NuruLife Productions — {new Date().toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="nuru-btn-primary flex items-center gap-2"
        >
          <Plus size={16} />
          New Project
        </button>
      </div>

      {/* Stats Bar */}
      <StatsBar projects={projects} />

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-white rounded-lg p-1 shadow-sm border border-gray-100 w-fit">
        {TABS.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-heading font-semibold transition-all',
                activeTab === tab.id
                  ? 'bg-nuru-maroon text-white shadow-sm'
                  : 'text-gray-500 hover:text-nuru-dgray hover:bg-nuru-lgray'
              )}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Faith Quote */}
          <div className="nuru-card border-l-4 border-nuru-orange">
            <p className="text-nuru-blue font-body italic text-sm">
              "The goal is not to be popular, but to be influential."
            </p>
            <p className="text-nuru-orange text-xs font-heading font-semibold mt-1">
              — Brian Ingwee, CEO, NuruLife Productions
            </p>
          </div>

          {/* Active Projects Grid */}
          <div>
            <h2 className="nuru-section-title">Active Productions</h2>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1,2,3].map(i => (
                  <div key={i} className="nuru-card animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-3 w-3/4" />
                    <div className="h-3 bg-gray-100 rounded mb-2 w-1/2" />
                    <div className="h-3 bg-gray-100 rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : activeProjects.length === 0 ? (
              <div className="nuru-card text-center py-12">
                <Film size={40} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-body text-sm">No active projects yet.</p>
                <button onClick={() => setShowCreateModal(true)} className="nuru-btn-primary mt-4">
                  Create Your First Project
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeProjects.map(project => (
                  <ProjectCard key={project.id} project={project} onUpdate={fetchProjects} />
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h2 className="nuru-section-title">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'New Script',      href: '/word-room',      icon: FileVideo,  color: 'bg-blue-50 text-blue-600' },
                { label: 'New Breakdown',   href: '/breakdown-room', icon: BookOpen,   color: 'bg-purple-50 text-purple-600' },
                { label: 'New Call Sheet',  href: '/call-room',      icon: Users,      color: 'bg-green-50 text-green-600' },
                { label: 'New Storyboard',  href: '/vision-room',    icon: Video,      color: 'bg-orange-50 text-orange-600' },
              ].map(action => {
                const Icon = action.icon
                return (
                  <a key={action.label} href={action.href}
                    className="nuru-card-hover flex items-center gap-3 p-4">
                    <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', action.color)}>
                      <Icon size={18} />
                    </div>
                    <span className="font-heading font-semibold text-nuru-dgray text-sm">{action.label}</span>
                  </a>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'projects' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="nuru-section-title mb-0">All Projects ({projects.length})</h2>
            <button onClick={() => setShowCreateModal(true)} className="nuru-btn-outline flex items-center gap-2">
              <Plus size={14} /> New Project
            </button>
          </div>
          {loading ? (
            <div className="nuru-card text-center py-8">
              <p className="text-gray-400 text-sm">Loading projects...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map(project => (
                <ProjectCard key={project.id} project={project} onUpdate={fetchProjects} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'tasks' && (
        <TaskBoard />
      )}

      {activeTab === 'calendar' && (
        <div className="nuru-card text-center py-12">
          <Calendar size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-body text-sm">Production Calendar</p>
          <p className="text-gray-400 text-xs mt-1">Select a project to view its calendar</p>
        </div>
      )}

      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => { setShowCreateModal(false); fetchProjects() }}
        />
      )}
    </div>
  )
}