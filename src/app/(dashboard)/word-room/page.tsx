'use client'

import { useState, useEffect } from 'react'
import { Plus, FileText, Film, Mic, FileVideo, Loader2, Search } from 'lucide-react'
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

export default function WordRoomPage() {
  const [scripts, setScripts]         = useState<Script[]>([])
  const [projects, setProjects]       = useState<Project[]>([])
  const [selectedScript, setSelectedScript] = useState<Script | null>(null)
  const [loading, setLoading]         = useState(true)
  const [showCreate, setShowCreate]   = useState(false)
  const [search, setSearch]           = useState('')

  useEffect(() => {
    Promise.all([fetchScripts(), fetchProjects()])
  }, [])

  async function fetchScripts() {
    try {
      const res = await fetch('/api/scripts')
      const data = await res.json()
      setScripts(data.data || [])
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  async function fetchProjects() {
    try {
      const res = await fetch('/api/projects')
      const data = await res.json()
      setProjects(data.data || [])
    } catch (err) { console.error(err) }
  }

  const filtered = scripts.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase())
  )

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
          <p className="text-gray-500 text-sm font-body mt-0.5">Scripts, AV Scripts & Production Documents</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="nuru-btn-primary flex items-center gap-2">
          <Plus size={16} /> New Script
        </button>
      </div>

      {/* Faith Quote */}
      <div className="nuru-card border-l-4 border-nuru-orange mb-6">
        <p className="text-nuru-blue font-body italic text-sm">
          "In the beginning was the Word..." — Every great production starts with a great script.
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search scripts and documents..."
          className="nuru-input pl-9 max-w-sm"
        />
      </div>

      {/* Scripts Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-nuru-orange" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="nuru-card text-center py-16">
          <FileText size={48} className="text-gray-200 mx-auto mb-4" />
          <h3 className="font-heading font-bold text-gray-400 text-lg mb-2">No Scripts Yet</h3>
          <p className="text-gray-400 text-sm font-body mb-6">
            Start writing your first screenplay, AV script, or production document.
          </p>
          <button onClick={() => setShowCreate(true)} className="nuru-btn-primary">
            Create First Script
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(script => {
            const Icon = SCRIPT_TYPE_ICONS[script.type] || FileText
            return (
              <div
                key={script.id}
                onClick={() => setSelectedScript(script)}
                className="nuru-card-hover cursor-pointer"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-nuru-blue bg-opacity-10 flex items-center justify-center flex-shrink-0">
                    <Icon size={20} className="text-nuru-blue" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading font-bold text-nuru-dgray text-sm truncate">{script.title}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="nuru-badge bg-blue-50 text-blue-600 text-[10px]">
                        {SCRIPT_TYPE_LABELS[script.type]}
                      </span>
                      <span className="text-gray-400 text-[10px]">v{script.version}</span>
                    </div>
                  </div>
                </div>

                {script.revisionColor && (
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="w-3 h-3 rounded-full border border-gray-200"
                      style={{ backgroundColor: script.revisionColor }} />
                    <span className="text-[10px] text-gray-400">Current revision</span>
                  </div>
                )}

                {script.isLocked && (
                  <div className="flex items-center gap-1 mb-2">
                    <span className="text-[10px] text-nuru-orange font-semibold">🔒 Locked for editing</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-[10px] text-gray-400 pt-2 border-t border-gray-100">
                  <span>Updated {formatDate(script.updatedAt)}</span>
                  <span className="text-nuru-orange font-semibold">Open →</span>
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