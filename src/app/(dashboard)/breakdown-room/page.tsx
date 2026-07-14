'use client'

import { useState, useEffect } from 'react'
import { Plus, Tag, Loader2, Search, ChevronRight, Sparkles } from 'lucide-react'
import { cn, ELEMENT_COLORS, formatDate } from '@/lib/utils'
import type { Breakdown, Scene, SceneElement, Project, ElementCategory } from '@/types'

const CATEGORY_LABELS: Record<string, string> = {
  CAST: 'Cast', EXTRAS: 'Extras', PROPS: 'Props', SET_DRESSING: 'Set Dressing',
  WARDROBE: 'Wardrobe', MAKEUP: 'Makeup', VFX: 'VFX', SOUND: 'Sound',
  VEHICLES: 'Vehicles', ANIMALS: 'Animals', SPECIAL_EQUIPMENT: 'Special Equipment',
}

export default function BreakdownRoomPage() {
  const [projects, setProjects]         = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [breakdowns, setBreakdowns]     = useState<Breakdown[]>([])
  const [selectedBreakdown, setSelectedBreakdown] = useState<Breakdown | null>(null)
  const [scenes, setScenes]             = useState<Scene[]>([])
  const [selectedScene, setSelectedScene] = useState<Scene | null>(null)
  const [loading, setLoading]           = useState(false)
  const [autoTagging, setAutoTagging]   = useState(false)
  const [newElement, setNewElement]     = useState({ name: '', category: 'PROPS' as ElementCategory, notes: '' })

  useEffect(() => { fetchProjects() }, [])
  useEffect(() => { if (selectedProject) fetchBreakdowns(selectedProject) }, [selectedProject])

  async function fetchProjects() {
    const res = await fetch('/api/projects')
    const data = await res.json()
    setProjects(data.data || [])
  }

  async function fetchBreakdowns(projectId: string) {
    setLoading(true)
    try {
      const res = await fetch(`/api/breakdowns?projectId=${projectId}`)
      const data = await res.json()
      setBreakdowns(data.data || [])
    } finally { setLoading(false) }
  }

  async function fetchScenes(breakdownId: string) {
    const res = await fetch(`/api/breakdowns/${breakdownId}/scenes`)
    const data = await res.json()
    setScenes(data.data || [])
  }

  async function autoTagScene(scene: Scene) {
    setAutoTagging(true)
    try {
      const res = await fetch('/api/ai/auto-tagger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sceneText: `${scene.heading}\n${scene.synopsis || ''}`, sceneId: scene.id }),
      })
      const data = await res.json()
      if (data.elements) {
        await fetch(`/api/breakdowns/${selectedBreakdown?.id}/scenes/${scene.id}/elements/bulk`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ elements: data.elements, aiSuggested: true }),
        })
        if (selectedBreakdown) fetchScenes(selectedBreakdown.id)
      }
    } finally { setAutoTagging(false) }
  }

  async function addElement(sceneId: string) {
    if (!newElement.name.trim()) return
    await fetch(`/api/breakdowns/${selectedBreakdown?.id}/scenes/${sceneId}/elements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newElement),
    })
    setNewElement({ name: '', category: 'PROPS', notes: '' })
    if (selectedBreakdown) fetchScenes(selectedBreakdown.id)
  }

  async function removeElement(sceneId: string, elementId: string) {
    await fetch(`/api/breakdowns/${selectedBreakdown?.id}/scenes/${sceneId}/elements/${elementId}`, { method: 'DELETE' })
    if (selectedBreakdown) fetchScenes(selectedBreakdown.id)
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading font-black text-nuru-maroon text-2xl">Breakdown Room</h1>
          <p className="text-gray-500 text-sm font-body mt-0.5">Tag scene elements, generate reports, plan your production</p>
        </div>
      </div>

      {/* Project Selector */}
      <div className="nuru-card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="nuru-label">Select Project</label>
            <select value={selectedProject} onChange={e => { setSelectedProject(e.target.value); setSelectedBreakdown(null); setSelectedScene(null) }}
              className="nuru-input">
              <option value="">Choose a project...</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </div>
          {breakdowns.length > 0 && (
            <div>
              <label className="nuru-label">Select Breakdown</label>
              <select value={selectedBreakdown?.id || ''} onChange={e => {
                const bd = breakdowns.find(b => b.id === e.target.value) || null
                setSelectedBreakdown(bd)
                if (bd) fetchScenes(bd.id)
                setSelectedScene(null)
              }} className="nuru-input">
                <option value="">Choose a breakdown...</option>
                {breakdowns.map(b => <option key={b.id} value={b.id}>Breakdown — {formatDate(b.createdAt)}</option>)}
              </select>
            </div>
          )}
          {selectedProject && (
            <div className="flex items-end">
              <button onClick={async () => {
                const res = await fetch('/api/breakdowns', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ projectId: selectedProject }),
                })
                const data = await res.json()
                if (data.data) { setBreakdowns(prev => [...prev, data.data]); setSelectedBreakdown(data.data); setScenes([]) }
              }} className="nuru-btn-primary flex items-center gap-2">
                <Plus size={14} /> New Breakdown
              </button>
            </div>
          )}
        </div>
      </div>

      {loading && <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-nuru-orange" /></div>}

      {selectedBreakdown && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Scene List */}
          <div className="lg:col-span-1">
            <div className="flex items-center justify-between mb-3">
              <h2 className="nuru-section-title mb-0">Scenes ({scenes.length})</h2>
              <button onClick={async () => {
                const heading = prompt('Scene heading (e.g. INT. CHURCH - DAY):')
                if (!heading) return
                const res = await fetch(`/api/breakdowns/${selectedBreakdown.id}/scenes`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ heading, sceneNumber: String(scenes.length + 1), pageCount: 1 }),
                })
                const data = await res.json()
                if (data.data) setScenes(prev => [...prev, data.data])
              }} className="nuru-btn-outline text-xs py-1 px-2 flex items-center gap-1">
                <Plus size={12} /> Scene
              </button>
            </div>
            <div className="space-y-2">
              {scenes.map(scene => (
                <div key={scene.id}
                  onClick={() => setSelectedScene(scene)}
                  className={cn('nuru-card cursor-pointer transition-all p-3',
                    selectedScene?.id === scene.id ? 'border-2 border-nuru-orange' : 'hover:shadow-md')}>
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-bold text-nuru-maroon text-xs">Sc. {scene.sceneNumber}</span>
                    <span className="text-gray-400 text-[10px]">{scene.pageCount}p</span>
                  </div>
                  <p className="text-nuru-dgray text-xs font-body mt-1 truncate">{scene.heading}</p>
                  <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                    {Object.entries(ELEMENT_COLORS).slice(0, 4).map(([cat, color]) => {
                      const count = scene.elements?.filter(e => e.category === cat).length || 0
                      if (!count) return null
                      return (
                        <span key={cat} className="text-[9px] px-1.5 py-0.5 rounded-full text-white font-heading font-bold"
                          style={{ backgroundColor: color }}>
                          {count}
                        </span>
                      )
                    })}
                  </div>
                </div>
              ))}
              {scenes.length === 0 && (
                <div className="nuru-card text-center py-8 text-gray-400 text-sm">No scenes yet</div>
              )}
            </div>
          </div>

          {/* Scene Detail */}
          <div className="lg:col-span-2">
            {selectedScene ? (
              <div className="space-y-4">
                {/* Scene Header */}
                <div className="nuru-card">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-heading font-bold text-nuru-maroon text-lg">{selectedScene.heading}</h3>
                      <p className="text-gray-400 text-xs mt-1">Scene {selectedScene.sceneNumber} · {selectedScene.pageCount} pages</p>
                    </div>
                    <button onClick={() => autoTagScene(selectedScene)} disabled={autoTagging}
                      className="nuru-btn-secondary flex items-center gap-1.5 text-xs py-1.5 px-3">
                      {autoTagging ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                      AI Auto-Tag
                    </button>
                  </div>
                  {selectedScene.synopsis && (
                    <p className="text-gray-600 text-sm font-body mt-2 italic">{selectedScene.synopsis}</p>
                  )}
                </div>

                {/* Elements by Category */}
                {Object.entries(CATEGORY_LABELS).map(([cat, label]) => {
                  const elements = selectedScene.elements?.filter(e => e.category === cat) || []
                  return (
                    <div key={cat} className="nuru-card">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ELEMENT_COLORS[cat] }} />
                        <h4 className="font-heading font-semibold text-nuru-dgray text-xs uppercase tracking-wide">{label}</h4>
                        <span className="text-gray-400 text-[10px]">({elements.length})</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {elements.map(el => (
                          <span key={el.id}
                            className={cn('nuru-badge text-[10px] cursor-pointer hover:opacity-70',
                              el.aiSuggested ? 'bg-orange-50 text-orange-600 border border-orange-200' : 'bg-gray-100 text-gray-600')}
                            onClick={() => removeElement(selectedScene.id, el.id)}>
                            {el.name} {el.aiSuggested ? '✨' : '×'}
                          </span>
                        ))}
                      </div>
                    </div>
                  )
                })}

                {/* Add Element */}
                <div className="nuru-card border-l-4 border-nuru-orange">
                  <h4 className="font-heading font-semibold text-nuru-dgray text-xs mb-3">Add Element</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <select value={newElement.category} onChange={e => setNewElement(p => ({ ...p, category: e.target.value as ElementCategory }))}
                      className="nuru-input text-xs">
                      {Object.entries(CATEGORY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                    <input value={newElement.name} onChange={e => setNewElement(p => ({ ...p, name: e.target.value }))}
                      className="nuru-input text-xs" placeholder="Element name..." />
                    <button onClick={() => addElement(selectedScene.id)} className="nuru-btn-primary text-xs">Add</button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="nuru-card text-center py-16">
                <Tag size={40} className="text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 text-sm font-body">Select a scene to view and tag its elements</p>
              </div>
            )}
          </div>
        </div>
      )}

      {!selectedProject && (
        <div className="nuru-card text-center py-16">
          <Tag size={48} className="text-gray-200 mx-auto mb-4" />
          <h3 className="font-heading font-bold text-gray-400 text-lg mb-2">Select a Project</h3>
          <p className="text-gray-400 text-sm font-body">Choose a project above to start breaking down your script</p>
        </div>
      )}
    </div>
  )
}