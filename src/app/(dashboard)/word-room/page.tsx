'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Plus, FileText, Film, Mic, FileVideo, Loader2, Search, RefreshCw, AlertCircle, X } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import type { Script, Project } from '@/types'
import ScreenplayEditor from '@/components/word-room/ScreenplayEditor'
import CreateScriptModal from '@/components/word-room/CreateScriptModal'

const SCRIPT_TYPE_ICONS: Record<string, any> = {
  SCREENPLAY: Film,
  AV_SCRIPT:  Mic,
  DOCUMENT:   FileText,
  TEMPLATE:   FileVideo,
}

const SCRIPT_TYPE_LABELS: Record<string, string> = {
  SCREENPLAY: 'Screenplay',
  AV_SCRIPT:  'AV Script',
  DOCUMENT:   'Document',
  TEMPLATE:   'Template',
}

const REVISION_COLORS: Record<string, string> = {
  '#FFFFFF': 'White',
  '#0000FF': 'Blue',
  '#FFB6C1': 'Pink',
  '#FFFF00': 'Yellow',
  '#90EE90': 'Green',
  '#DAA520': 'Goldenrod',
}

function WordRoomContent() {
  const searchParams = useSearchParams()
  const projectIdParam = searchParams.get('projectId')

  const [scripts, setScripts]               = useState<Script[]>([])
  const [projects, setProjects]             = useState<Project[]>([])
  const [selectedScript, setSelectedScript] = useState<Script | null>(null)
  const [loading, setLoading]               = useState(true)
  const [error, setError]                   = useState('')
  const [showCreate, setShowCreate]         = useState(false)
  const [search, setSearch]                 = useState('')
  const [filterProject, setFilterProject]   = useState(projectIdParam || '')
  const [filterType, setFilterType]         = useState('')

  useEffect(() => {
    fetchProjects()
  }, [])

  useEffect(() => {
    fetchScripts()
  }, [filterProject, filterType])

  useEffect(() => {
    if (projectIdParam) setFilterProject(projectIdParam)
  }, [projectIdParam])

  async function fetchProjects() {
    try {
      const res  = await fetch('/api/projects')
      const data = await res.json()
      setProjects(data.data || [])
    } catch { /* silent */ }
  }

  async function fetchScripts() {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (filterProject) params.set('projectId', filterProject)
      const res  = await fetch(`/api/scripts?${params.toString()}`)
      const data = await res.json()
      setScripts(data.data || [])
    } catch { setError('Failed to load scripts') }
    finally { setLoading(false) }
  }

  const filtered = scripts.filter(s => {
    const matchSearch = s.title.toLowerCase().includes(search.toLowerCase())
    const matchType   = !filterType || s.type === filterType
    return matchSearch && matchType
  })

  if (selectedScript) {
    return (
      <ScreenplayEditor
        script={selectedScript}
        onBack={() => { setSelectedScript(null); fetchScripts() }}
        onUpdate={(updated) => setSelectedScript(updated)}
      />
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading font-black text-nuru-maroon text-2xl">Word Room</h1>
          <p className="text-gray-500 text-sm font-body mt-0.5">
            Scripts, AV Scripts & Production Documents
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchScripts} className="nuru-btn-ghost flex items-center gap-2 text-sm">
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={() => setShowCreate(true)} className="nuru-btn-primary flex items-center gap-2">
            <Plus size={16} /> New Script
          </button>
        </div>
      </div>

      {/* Faith Quote */}
      <div className="nuru-card border-l-4 border-nuru-orange mb-6">
        <p className="text-nuru-blue font-body italic text-sm">
          "In the beginning was the Word..." — Every great production starts with a great script.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center gap-2">
          <AlertCircle size={16} className="text-red-500" />
          <p className="text-red-700 text-sm flex-1">{error}</p>
          <button onClick={() => setError('')}><X size={14} className="text-red-400" /></button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search scripts..."
            className="nuru-input pl-9 w-56"
          />
        </div>
        <select
          value={filterProject}
          onChange={e => setFilterProject(e.target.value)}
          className="nuru-input w-48"
        >
          <option value="">All projects</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="nuru-input w-40"
        >
          <option value="">All types</option>
          {Object.entries(SCRIPT_TYPE_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        {(filterProject || filterType || search) && (
          <button
            onClick={() => { setFilterProject(''); setFilterType(''); setSearch('') }}
            className="nuru-btn-ghost text-sm flex items-center gap-1 text-gray-400"
          >
            <X size={14} /> Clear filters
          </button>
        )}
      </div>

      {/* Scripts Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-nuru-orange" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="nuru-card text-center py-16">
          <FileText size={48} className="text-gray-200 mx-auto mb-4" />
          <h3 className="font-heading font-bold text-gray-400 text-lg mb-2">
            {search || filterProject || filterType ? 'No scripts match your filters' : 'No Scripts Yet'}
          </h3>
          <p className="text-gray-400 text-sm font-body mb-6">
            {search || filterProject || filterType
              ? 'Try adjusting your search or filters.'
              : 'Start writing your first screenplay, AV script, or production document.'}
          </p>
          {!search && !filterProject && !filterType && (
            <button onClick={() => setShowCreate(true)} className="nuru-btn-primary">
              Create First Script
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(script => {
            const Icon    = SCRIPT_TYPE_ICONS[script.type] || FileText
            const project = projects.find(p => p.id === script.projectId)
            return (
              <div
                key={script.id}
                onClick={() => setSelectedScript(script)}
                className="nuru-card-hover cursor-pointer flex flex-col"
              >
                {/* Icon & Type */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-nuru-blue bg-opacity-10 flex items-center justify-center flex-shrink-0">
                    <Icon size={20} className="text-nuru-blue" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading font-bold text-nuru-dgray text-sm truncate leading-tight">
                      {script.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="nuru-badge bg-blue-50 text-blue-600 text-[10px]">
                        {SCRIPT_TYPE_LABELS[script.type]}
                      </span>
                      <span className="text-gray-400 text-[10px]">v{script.version}</span>
                    </div>
                  </div>
                </div>

                {/* Project */}
                {project && (
                  <p className="text-gray-400 text-[10px] mb-2 font-body">
                    📁 {project.title}
                  </p>
                )}

                {/* Notes */}
                {script.notes && (
                  <p className="text-gray-400 text-xs font-body mb-2 line-clamp-2 flex-1">
                    {script.notes}
                  </p>
                )}

                {/* Revision Color */}
                {script.revisionColor && script.revisionColor !== '#FFFFFF' && (
                  <div className="flex items-center gap-1.5 mb-2">
                    <div
                      className="w-3 h-3 rounded-full border border-gray-200"
                      style={{ backgroundColor: script.revisionColor }}
                    />
                    <span className="text-[10px] text-gray-400">
                      {REVISION_COLORS[script.revisionColor] || 'Revision'} draft
                    </span>
                  </div>
                )}

                {/* Lock Status */}
                {script.isLocked && (
                  <div className="flex items-center gap-1 mb-2">
                    <span className="text-[10px] text-nuru-orange font-semibold">🔒 Locked</span>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between text-[10px] text-gray-400 pt-2 border-t border-gray-100 mt-auto">
                  <span>Updated {formatDate(script.updatedAt)}</span>
                  <span className="text-nuru-orange font-heading font-semibold">Open →</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showCreate && (
        <CreateScriptModal
          projects={projects}
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); fetchScripts() }}
        />
      )}
    </div>
  )
}

export default function WordRoomPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-12">
        <Loader2 size={24} className="animate-spin text-nuru-orange" />
      </div>
    }>
      <WordRoomContent />
    </Suspense>
  )
}