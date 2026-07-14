'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Plus, Film, Mic, Theater, FileVideo, BookOpen, Video,
  TrendingUp, CheckSquare, Calendar, Users, Upload,
  Loader2, AlertCircle, RefreshCw
} from 'lucide-react'
import { cn, formatDate, formatCurrency, PROJECT_STATUS_COLORS } from '@/lib/utils'
import type { Project } from '@/types'
import ProjectCard from '@/components/command-room/ProjectCard'
import CreateProjectModal from '@/components/command-room/CreateProjectModal'
import TaskBoard from '@/components/command-room/TaskBoard'
import StatsBar from '@/components/command-room/StatsBar'

const TABS = [
  { id: 'overview', label: 'Overview',  icon: TrendingUp },
  { id: 'projects', label: 'Projects',  icon: Film },
  { id: 'tasks',    label: 'Tasks',     icon: CheckSquare },
]

export default function CommandRoomPage() {
  const [activeTab, setActiveTab]       = useState('overview')
  const [projects, setProjects]         = useState<Project[]>([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)

  useEffect(() => { fetchProjects() }, [])

  async function fetchProjects() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/projects')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setProjects(data.data || [])
    } catch (err: any) {
      setError('Failed to load projects. Check your connection.')
      console.error('fetchProjects error:', err)
    } finally {
      setLoading(false)
    }
  }

  const activeProjects = projects.filter(p => p.status !== 'ARCHIVED')

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading font-black text-nuru-maroon text-2xl">Command Room</h1>
          <p className="text-gray-500 text-sm font-body mt-0.5">
            NuruLife Productions — {new Date().toLocaleDateString('en-KE', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
            })}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowUploadModal(true)}
            className="nuru-btn-secondary flex items-center gap-2">
            <Upload size={16} /> Upload Script
          </button>
          <button onClick={() => setShowCreateModal(true)}
            className="nuru-btn-primary flex items-center gap-2">
            <Plus size={16} /> New Project
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
          <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
          <p className="text-red-700 text-sm font-body flex-1">{error}</p>
          <button onClick={fetchProjects} className="flex items-center gap-1 text-red-600 text-xs font-heading font-semibold hover:underline">
            <RefreshCw size={12} /> Retry
          </button>
        </div>
      )}

      {/* Stats Bar */}
      <StatsBar projects={projects} />

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-white rounded-lg p-1 shadow-sm border border-gray-100 w-fit">
        {TABS.map(tab => {
          const Icon = tab.icon
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-heading font-semibold transition-all',
                activeTab === tab.id
                  ? 'bg-nuru-maroon text-white shadow-sm'
                  : 'text-gray-500 hover:text-nuru-dgray hover:bg-nuru-lgray'
              )}>
              <Icon size={14} />{tab.label}
            </button>
          )
        })}
      </div>

      {/* OVERVIEW TAB */}
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

          {/* Active Projects */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="nuru-section-title mb-0">Active Productions ({activeProjects.length})</h2>
              <button onClick={fetchProjects} className="text-gray-400 hover:text-nuru-orange transition-colors">
                <RefreshCw size={14} />
              </button>
            </div>

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
                <p className="text-gray-500 font-body text-sm mb-2">No active projects yet.</p>
                <p className="text-gray-400 text-xs mb-6">Upload a script to create your first project, or create one manually.</p>
                <div className="flex gap-3 justify-center">
                  <button onClick={() => setShowUploadModal(true)} className="nuru-btn-secondary flex items-center gap-2">
                    <Upload size={14} /> Upload Script
                  </button>
                  <button onClick={() => setShowCreateModal(true)} className="nuru-btn-primary flex items-center gap-2">
                    <Plus size={14} /> New Project
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeProjects.map(project => (
                  <ProjectCard key={project.id} project={project} onUpdate={fetchProjects} />
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="nuru-section-title">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Upload Script',   action: () => setShowUploadModal(true), icon: Upload,      color: 'bg-nuru-maroon bg-opacity-10 text-nuru-maroon' },
                { label: 'New Script',      href: '/word-room',                     icon: FileVideo,   color: 'bg-blue-50 text-blue-600' },
                { label: 'New Call Sheet',  href: '/call-room',                     icon: Users,       color: 'bg-green-50 text-green-600' },
                { label: 'New Storyboard',  href: '/vision-room',                   icon: Video,       color: 'bg-orange-50 text-orange-600' },
              ].map(action => {
                const Icon = action.icon
                if ('action' in action) {
                  return (
                    <button key={action.label} onClick={action.action}
                      className="nuru-card-hover flex items-center gap-3 p-4 text-left">
                      <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', action.color)}>
                        <Icon size={18} />
                      </div>
                      <span className="font-heading font-semibold text-nuru-dgray text-sm">{action.label}</span>
                    </button>
                  )
                }
                return (
                  <a key={action.label} href={action.href}
                    className="nuru-card-hover flex items-center gap-3 p-4">
                    <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', action.color)}>
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

      {/* PROJECTS TAB */}
      {activeTab === 'projects' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="nuru-section-title mb-0">All Projects ({projects.length})</h2>
            <div className="flex gap-2">
              <button onClick={() => setShowUploadModal(true)} className="nuru-btn-secondary flex items-center gap-2 text-sm">
                <Upload size={14} /> Upload Script
              </button>
              <button onClick={() => setShowCreateModal(true)} className="nuru-btn-outline flex items-center gap-2 text-sm">
                <Plus size={14} /> New Project
              </button>
            </div>
          </div>
          {loading ? (
            <div className="nuru-card text-center py-8">
              <Loader2 size={24} className="animate-spin text-nuru-orange mx-auto" />
            </div>
          ) : projects.length === 0 ? (
            <div className="nuru-card text-center py-12">
              <Film size={40} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No projects yet. Upload a script or create one manually.</p>
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

      {/* TASKS TAB */}
      {activeTab === 'tasks' && <TaskBoard />}

      {/* MODALS */}
      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => { setShowCreateModal(false); fetchProjects() }}
        />
      )}

      {showUploadModal && (
        <UploadScriptModal
          onClose={() => setShowUploadModal(false)}
          onCreated={() => { setShowUploadModal(false); fetchProjects() }}
        />
      )}
    </div>
  )
}

// ── Upload Script Modal ────────────────────────────────────────────────────────
function UploadScriptModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [file, setFile]         = useState<File | null>(null)
  const [form, setForm]         = useState({
    title: '', type: 'SHORT_FILM', logline: '',
  })
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [result, setResult]     = useState<any>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    // Auto-fill title from filename
    const name = f.name.replace(/\.(docx|pdf|txt|fdx)$/i, '').replace(/[-_]/g, ' ')
    setForm(prev => ({ ...prev, title: name }))
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!file) { setError('Please select a script file.'); return }
    if (!form.title.trim()) { setError('Please enter a project title.'); return }
    setLoading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('title', form.title)
      fd.append('type', form.type)
      fd.append('logline', form.logline)
      const res = await fetch('/api/projects/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      setResult(data.data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (result) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-fade-in p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🎬</span>
          </div>
          <h2 className="font-heading font-bold text-nuru-maroon text-xl mb-2">Project Created!</h2>
          <p className="text-gray-600 text-sm mb-1 font-body">
            <strong>{result.project.title}</strong> is ready.
          </p>
          <p className="text-gray-500 text-xs mb-6 font-body">
            {result.scenesCreated} scenes extracted · Script imported · Breakdown created
          </p>
          <div className="bg-nuru-lgray rounded-lg p-3 mb-6 text-left">
            <p className="text-xs font-heading font-semibold text-nuru-blue mb-1">What was created:</p>
            <p className="text-xs text-gray-600 font-body">✅ Project: {result.project.title}</p>
            <p className="text-xs text-gray-600 font-body">✅ Script imported to Word Room</p>
            <p className="text-xs text-gray-600 font-body">✅ {result.scenesCreated} scenes in Breakdown Room</p>
            <p className="text-xs text-gray-600 font-body">✅ Ready for scheduling & call sheets</p>
          </div>
          <button onClick={onCreated} className="nuru-btn-primary w-full py-3">
            View Project Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-fade-in">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="font-heading font-bold text-nuru-maroon text-lg">Upload Script</h2>
            <p className="text-gray-400 text-xs mt-0.5">Create a project from your screenplay</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-nuru-lgray">
            <Plus size={18} className="text-gray-400 rotate-45" />
          </button>
        </div>

        <form onSubmit={handleUpload} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-md p-3 text-sm">{error}</div>
          )}

          {/* File Drop Zone */}
          <div
            onClick={() => fileRef.current?.click()}
            className={cn(
              'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all',
              file ? 'border-nuru-orange bg-orange-50' : 'border-gray-200 hover:border-nuru-orange hover:bg-orange-50'
            )}
          >
            <input ref={fileRef} type="file" accept=".docx,.pdf,.txt,.fdx" onChange={handleFile} className="hidden" />
            {file ? (
              <div>
                <div className="text-3xl mb-2">📄</div>
                <p className="font-heading font-semibold text-nuru-maroon text-sm">{file.name}</p>
                <p className="text-gray-400 text-xs mt-1">{(file.size / 1024).toFixed(0)} KB · Click to change</p>
              </div>
            ) : (
              <div>
                <Upload size={32} className="text-gray-300 mx-auto mb-3" />
                <p className="font-heading font-semibold text-gray-500 text-sm">Click to upload your screenplay</p>
                <p className="text-gray-400 text-xs mt-1">Supports .docx, .pdf, .txt, .fdx</p>
              </div>
            )}
          </div>

          <div>
            <label className="nuru-label">Project Title *</label>
            <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              className="nuru-input" placeholder="Beneath the Silence" required />
          </div>

          <div>
            <label className="nuru-label">Project Type</label>
            <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className="nuru-input">
              <option value="SHORT_FILM">Short Film</option>
              <option value="FEATURE_FILM">Feature Film</option>
              <option value="STAGE_PRODUCTION">Stage Production</option>
              <option value="DOCUMENTARY">Documentary</option>
              <option value="MUSIC_VIDEO">Music Video</option>
              <option value="COMMERCIAL">Commercial</option>
            </select>
          </div>

          <div>
            <label className="nuru-label">Logline (optional)</label>
            <textarea value={form.logline} onChange={e => setForm(p => ({ ...p, logline: e.target.value }))}
              className="nuru-input resize-none" rows={2}
              placeholder="One sentence summary of your story..." />
          </div>

          <div className="bg-nuru-lgray rounded-lg p-3">
            <p className="text-xs font-heading font-semibold text-nuru-blue mb-1">What happens when you upload:</p>
            <p className="text-xs text-gray-500 font-body">✅ Project is created automatically</p>
            <p className="text-xs text-gray-500 font-body">✅ Script is imported to Word Room</p>
            <p className="text-xs text-gray-500 font-body">✅ Scenes are extracted to Breakdown Room</p>
            <p className="text-xs text-gray-500 font-body">✅ Ready for scheduling & call sheets</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 nuru-btn-ghost border border-gray-200">Cancel</button>
            <button type="submit" disabled={loading || !file}
              className="flex-1 nuru-btn-primary flex items-center justify-center gap-2">
              {loading ? (
                <><Loader2 size={14} className="animate-spin" />Processing Script...</>
              ) : (
                <><Upload size={14} />Create Project</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}