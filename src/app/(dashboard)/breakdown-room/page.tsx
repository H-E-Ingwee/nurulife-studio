'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Plus, Tag, Loader2, Sparkles, AlertCircle,
  RefreshCw, ChevronRight, Trash2, Check, X
} from 'lucide-react'
import { cn, ELEMENT_COLORS, formatDate } from '@/lib/utils'
import type { Breakdown, Scene, SceneElement, Project, ElementCategory } from '@/types'

const CATEGORY_LABELS: Record<string, string> = {
  CAST: 'Cast', EXTRAS: 'Extras', PROPS: 'Props',
  SET_DRESSING: 'Set Dressing', WARDROBE: 'Wardrobe', MAKEUP: 'Makeup',
  VFX: 'VFX', SOUND: 'Sound', VEHICLES: 'Vehicles',
  ANIMALS: 'Animals', SPECIAL_EQUIPMENT: 'Special Equipment',
}

export default function BreakdownRoomPage() {
  const [projects, setProjects]               = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState('')
  const [breakdowns, setBreakdowns]           = useState<Breakdown[]>([])
  const [selectedBreakdown, setSelectedBreakdown] = useState<Breakdown | null>(null)
  const [scenes, setScenes]                   = useState<Scene[]>([])
  const [selectedScene, setSelectedScene]     = useState<Scene | null>(null)
  const [loading, setLoading]                 = useState(false)
  const [scenesLoading, setScenesLoading]     = useState(false)
  const [autoTagging, setAutoTagging]         = useState(false)
  const [tagSuccess, setTagSuccess]           = useState(false)
  const [error, setError]                     = useState('')
  const [newElement, setNewElement]           = useState({ name: '', category: 'PROPS' as ElementCategory, notes: '' })
  const [addingElement, setAddingElement]     = useState(false)

  // Load projects on mount
  useEffect(() => { fetchProjects() }, [])

  // Auto-load breakdowns when project selected
  useEffect(() => {
    if (selectedProject) {
      setSelectedBreakdown(null)
      setSelectedScene(null)
      setScenes([])
      fetchBreakdowns(selectedProject)
    }
  }, [selectedProject])

  // Auto-load scenes when breakdown selected
  useEffect(() => {
    if (selectedBreakdown) {
      fetchScenes(selectedBreakdown.id)
    }
  }, [selectedBreakdown])

  async function fetchProjects() {
    try {
      const res  = await fetch('/api/projects')
      const data = await res.json()
      setProjects(data.data || [])
    } catch { setError('Failed to load projects') }
  }

  async function fetchBreakdowns(projectId: string) {
    setLoading(true)
    setError('')
    try {
      const res  = await fetch(`/api/breakdowns?projectId=${projectId}`)
      const data = await res.json()
      const bds  = data.data || []
      setBreakdowns(bds)
      // Auto-select first breakdown
      if (bds.length > 0) {
        setSelectedBreakdown(bds[0])
      }
    } catch { setError('Failed to load breakdowns') }
    finally { setLoading(false) }
  }

  async function fetchScenes(breakdownId: string) {
    setScenesLoading(true)
    try {
      const res  = await fetch(`/api/breakdowns/${breakdownId}/scenes`)
      const data = await res.json()
      setScenes(data.data || [])
      // Keep selected scene in sync
      setSelectedScene(prev =>
        prev ? (data.data || []).find((s: Scene) => s.id === prev.id) || null : null
      )
    } catch { setError('Failed to load scenes') }
    finally { setScenesLoading(false) }
  }

  async function createBreakdown() {
    if (!selectedProject) return
    setLoading(true)
    try {
      const res  = await fetch('/api/breakdowns', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ projectId: selectedProject }),
      })
      const data = await res.json()
      if (data.data) {
        setBreakdowns(prev => [...prev, data.data])
        setSelectedBreakdown(data.data)
        setScenes([])
      }
    } catch { setError('Failed to create breakdown') }
    finally { setLoading(false) }
  }

  async function addScene() {
    if (!selectedBreakdown) return
    const heading = prompt('Scene heading (e.g. INT. CHURCH HALL - DAY):')
    if (!heading?.trim()) return
    try {
      const res  = await fetch(`/api/breakdowns/${selectedBreakdown.id}/scenes`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          heading:     heading.trim(),
          sceneNumber: String(scenes.length + 1),
          pageCount:   1,
        }),
      })
      const data = await res.json()
      if (data.data) {
        setScenes(prev => [...prev, data.data])
        setSelectedScene(data.data)
      }
    } catch { setError('Failed to add scene') }
  }

  async function autoTagScene(scene: Scene) {
    if (!selectedBreakdown) return
    setAutoTagging(true)
    setTagSuccess(false)
    setError('')
    try {
      // Step 1: Get AI tags
      const tagRes  = await fetch('/api/ai/auto-tagger', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          sceneText: `${scene.heading}\n${scene.synopsis || ''}`,
          sceneId:   scene.id,
        }),
      })
      const tagData = await tagRes.json()

      if (tagData.raw) {
        // Step 2: Convert raw AI result to flat elements array
        const categoryMap: Record<string, string> = {
          cast: 'CAST', extras: 'EXTRAS', props: 'PROPS',
          setDressing: 'SET_DRESSING', wardrobe: 'WARDROBE', makeup: 'MAKEUP',
          vfx: 'VFX', sound: 'SOUND', vehicles: 'VEHICLES',
          animals: 'ANIMALS', specialEquipment: 'SPECIAL_EQUIPMENT',
        }
        const elements: Array<{ category: string; name: string }> = []
        for (const [key, cat] of Object.entries(categoryMap)) {
          const items = tagData.raw[key] as string[] || []
          for (const name of items) {
            if (name && typeof name === 'string' && name.trim()) {
              elements.push({ category: cat, name: name.trim() })
            }
          }
        }

        if (elements.length > 0) {
          // Step 3: Bulk save to DB
          await fetch(
            `/api/breakdowns/${selectedBreakdown.id}/scenes/${scene.id}/elements/bulk`,
            {
              method:  'POST',
              headers: { 'Content-Type': 'application/json' },
              body:    JSON.stringify({ elements, aiSuggested: true }),
            }
          )
        }
      }

      // Step 4: Refresh scenes to show new elements
      await fetchScenes(selectedBreakdown.id)
      setTagSuccess(true)
      setTimeout(() => setTagSuccess(false), 3000)
    } catch (err: any) {
      setError(`Auto-tag failed: ${err.message}`)
    } finally {
      setAutoTagging(false)
    }
  }

  async function addElement(sceneId: string) {
    if (!newElement.name.trim() || !selectedBreakdown) return
    setAddingElement(true)
    try {
      await fetch(
        `/api/breakdowns/${selectedBreakdown.id}/scenes/${sceneId}/elements`,
        {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ ...newElement, confirmed: true }),
        }
      )
      setNewElement({ name: '', category: 'PROPS', notes: '' })
      await fetchScenes(selectedBreakdown.id)
    } catch { setError('Failed to add element') }
    finally { setAddingElement(false) }
  }

  async function removeElement(sceneId: string, elementId: string) {
    if (!selectedBreakdown) return
    try {
      await fetch(
        `/api/breakdowns/${selectedBreakdown.id}/scenes/${sceneId}/elements/${elementId}`,
        { method: 'DELETE' }
      )
      await fetchScenes(selectedBreakdown.id)
    } catch { setError('Failed to remove element') }
  }

  async function confirmElement(sceneId: string, elementId: string) {
    if (!selectedBreakdown) return
    try {
      await fetch(
        `/api/breakdowns/${selectedBreakdown.id}/scenes/${sceneId}/elements/${elementId}`,
        {
          method:  'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ confirmed: true }),
        }
      )
      await fetchScenes(selectedBreakdown.id)
    } catch { setError('Failed to confirm element') }
  }

  // Keep selectedScene in sync with scenes array
  const currentScene = selectedScene
    ? scenes.find(s => s.id === selectedScene.id) || selectedScene
    : null

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading font-black text-nuru-maroon text-2xl">Breakdown Room</h1>
          <p className="text-gray-500 text-sm font-body mt-0.5">
            Tag scene elements, generate reports, plan your production
          </p>
        </div>
        {selectedBreakdown && (
          <button onClick={() => fetchScenes(selectedBreakdown.id)}
            className="nuru-btn-ghost flex items-center gap-2 text-sm">
            <RefreshCw size={14} /> Refresh
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center gap-2">
          <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
          <p className="text-red-700 text-sm flex-1">{error}</p>
          <button onClick={() => setError('')}><X size={14} className="text-red-400" /></button>
        </div>
      )}

      {/* Controls */}
      <div className="nuru-card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Project */}
          <div>
            <label className="nuru-label">Project</label>
            <select
              value={selectedProject}
              onChange={e => setSelectedProject(e.target.value)}
              className="nuru-input"
            >
              <option value="">Choose a project...</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>

          {/* Breakdown */}
          {selectedProject && (
            <div>
              <label className="nuru-label">
                Breakdown {breakdowns.length > 0 && `(${breakdowns.length} found)`}
              </label>
              {breakdowns.length > 0 ? (
                <select
                  value={selectedBreakdown?.id || ''}
                  onChange={e => {
                    const bd = breakdowns.find(b => b.id === e.target.value) || null
                    setSelectedBreakdown(bd)
                    setSelectedScene(null)
                  }}
                  className="nuru-input"
                >
                  {breakdowns.map(b => (
                    <option key={b.id} value={b.id}>
                      Breakdown — {formatDate(b.createdAt)}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-gray-400 text-xs mt-2 font-body">No breakdowns yet</p>
              )}
            </div>
          )}

          {/* Actions */}
          {selectedProject && (
            <div className="flex items-end gap-2">
              <button
                onClick={createBreakdown}
                disabled={loading}
                className="nuru-btn-primary flex items-center gap-2 flex-1"
              >
                {loading
                  ? <Loader2 size={14} className="animate-spin" />
                  : <Plus size={14} />}
                New Breakdown
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Loading */}
      {(loading || scenesLoading) && (
        <div className="flex justify-center py-8">
          <Loader2 size={24} className="animate-spin text-nuru-orange" />
        </div>
      )}

      {/* Main Content */}
      {selectedBreakdown && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Scene List ─────────────────────────────────────────────── */}
          <div className="lg:col-span-1">
            <div className="flex items-center justify-between mb-3">
              <h2 className="nuru-section-title mb-0">
                Scenes ({scenes.length})
              </h2>
              <button
                onClick={addScene}
                className="nuru-btn-outline text-xs py-1 px-2 flex items-center gap-1"
              >
                <Plus size={12} /> Add Scene
              </button>
            </div>

            {scenesLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 size={20} className="animate-spin text-nuru-orange" />
              </div>
            ) : scenes.length === 0 ? (
              <div className="nuru-card text-center py-8">
                <Tag size={28} className="text-gray-200 mx-auto mb-2" />
                <p className="text-gray-400 text-sm font-body">No scenes yet</p>
                <button onClick={addScene} className="nuru-btn-primary mt-3 text-xs">
                  Add First Scene
                </button>
              </div>
            ) : (
              <div className="space-y-2 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
                {scenes.map(scene => {
                  const totalElements = scene.elements?.length || 0
                  const confirmed     = scene.elements?.filter(e => e.confirmed).length || 0
                  const isSelected    = currentScene?.id === scene.id
                  return (
                    <div
                      key={scene.id}
                      onClick={() => setSelectedScene(scene)}
                      className={cn(
                        'nuru-card cursor-pointer transition-all p-3',
                        isSelected
                          ? 'border-2 border-nuru-orange shadow-md'
                          : 'hover:shadow-md border border-transparent'
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-heading font-bold text-nuru-maroon text-xs">
                          Sc. {scene.sceneNumber}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="text-gray-400 text-[10px]">{scene.pageCount}p</span>
                          {isSelected && (
                            <ChevronRight size={12} className="text-nuru-orange" />
                          )}
                        </div>
                      </div>
                      <p className="text-nuru-dgray text-xs font-body truncate">{scene.heading}</p>
                      {scene.synopsis && (
                        <p className="text-gray-400 text-[10px] mt-0.5 truncate">{scene.synopsis}</p>
                      )}
                      {/* Element colour dots */}
                      <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                        {Object.entries(ELEMENT_COLORS).map(([cat, color]) => {
                          const count = scene.elements?.filter(e => e.category === cat).length || 0
                          if (!count) return null
                          return (
                            <span
                              key={cat}
                              className="text-[9px] px-1.5 py-0.5 rounded-full text-white font-heading font-bold"
                              style={{ backgroundColor: color }}
                              title={`${CATEGORY_LABELS[cat]}: ${count}`}
                            >
                              {count}
                            </span>
                          )
                        })}
                        {totalElements > 0 && (
                          <span className="text-[9px] text-gray-400 ml-auto">
                            {confirmed}/{totalElements} confirmed
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* ── Scene Detail ────────────────────────────────────────────── */}
          <div className="lg:col-span-2">
            {currentScene ? (
              <div className="space-y-4">
                {/* Scene Header */}
                <div className="nuru-card">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="font-heading font-bold text-nuru-maroon text-base leading-tight">
                        {currentScene.heading}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                        <span>Scene {currentScene.sceneNumber}</span>
                        <span>·</span>
                        <span>{currentScene.pageCount} pages</span>
                        {currentScene.timeOfDay && <><span>·</span><span>{currentScene.timeOfDay}</span></>}
                        {currentScene.location && <><span>·</span><span>{currentScene.location}</span></>}
                      </div>
                      {currentScene.synopsis && (
                        <p className="text-gray-600 text-sm font-body mt-2 italic leading-relaxed">
                          {currentScene.synopsis}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => autoTagScene(currentScene)}
                      disabled={autoTagging}
                      className={cn(
                        'flex items-center gap-1.5 text-xs py-2 px-3 rounded-md font-heading font-semibold transition-all flex-shrink-0',
                        tagSuccess
                          ? 'bg-green-500 text-white'
                          : 'nuru-btn-secondary'
                      )}
                    >
                      {autoTagging
                        ? <><Loader2 size={12} className="animate-spin" /> Tagging...</>
                        : tagSuccess
                          ? <><Check size={12} /> Tagged!</>
                          : <><Sparkles size={12} /> AI Auto-Tag</>
                      }
                    </button>
                  </div>
                </div>

                {/* Elements by Category */}
                <div className="grid grid-cols-1 gap-3">
                  {Object.entries(CATEGORY_LABELS).map(([cat, label]) => {
                    const elements = currentScene.elements?.filter(e => e.category === cat) || []
                    return (
                      <div key={cat} className="nuru-card p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: ELEMENT_COLORS[cat] }}
                          />
                          <h4 className="font-heading font-semibold text-nuru-dgray text-xs uppercase tracking-wide">
                            {label}
                          </h4>
                          <span className="text-gray-400 text-[10px]">({elements.length})</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {elements.map(el => (
                            <div
                              key={el.id}
                              className={cn(
                                'flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-heading font-semibold border',
                                el.confirmed
                                  ? 'bg-gray-100 text-gray-700 border-gray-200'
                                  : 'bg-orange-50 text-orange-700 border-orange-200'
                              )}
                            >
                              {!el.confirmed && (
                                <button
                                  onClick={() => confirmElement(currentScene.id, el.id)}
                                  title="Confirm element"
                                  className="text-green-500 hover:text-green-700"
                                >
                                  <Check size={9} />
                                </button>
                              )}
                              <span>{el.name}</span>
                              {el.aiSuggested && !el.confirmed && (
                                <span className="text-[8px] text-orange-400">AI</span>
                              )}
                              <button
                                onClick={() => removeElement(currentScene.id, el.id)}
                                className="text-gray-400 hover:text-red-500 ml-0.5"
                                title="Remove element"
                              >
                                <X size={9} />
                              </button>
                            </div>
                          ))}
                          {elements.length === 0 && (
                            <span className="text-gray-300 text-[10px] italic">None tagged</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Add Element */}
                <div className="nuru-card border-l-4 border-nuru-orange">
                  <h4 className="font-heading font-semibold text-nuru-dgray text-xs mb-3">
                    + Add Element Manually
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    <select
                      value={newElement.category}
                      onChange={e => setNewElement(p => ({ ...p, category: e.target.value as ElementCategory }))}
                      className="nuru-input text-xs"
                    >
                      {Object.entries(CATEGORY_LABELS).map(([v, l]) => (
                        <option key={v} value={v}>{l}</option>
                      ))}
                    </select>
                    <input
                      value={newElement.name}
                      onChange={e => setNewElement(p => ({ ...p, name: e.target.value }))}
                      onKeyDown={e => e.key === 'Enter' && addElement(currentScene.id)}
                      className="nuru-input text-xs md:col-span-2"
                      placeholder="Element name (e.g. Microphone, Kanga, Matatu)..."
                    />
                    <button
                      onClick={() => addElement(currentScene.id)}
                      disabled={addingElement || !newElement.name.trim()}
                      className="nuru-btn-primary text-xs flex items-center justify-center gap-1"
                    >
                      {addingElement
                        ? <Loader2 size={12} className="animate-spin" />
                        : <Plus size={12} />}
                      Add
                    </button>
                  </div>
                  <p className="text-gray-400 text-[10px] mt-2 font-body">
                    Press Enter or click Add. Orange badges = AI suggested (click ✓ to confirm).
                  </p>
                </div>
              </div>
            ) : (
              <div className="nuru-card text-center py-16">
                <Tag size={40} className="text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 font-heading font-semibold text-sm">Select a scene</p>
                <p className="text-gray-400 text-xs mt-1 font-body">
                  Choose a scene from the list to view and tag its elements
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!selectedProject && (
        <div className="nuru-card text-center py-16">
          <Tag size={48} className="text-gray-200 mx-auto mb-4" />
          <h3 className="font-heading font-bold text-gray-400 text-lg mb-2">Select a Project</h3>
          <p className="text-gray-400 text-sm font-body">
            Choose a project above to start breaking down your script
          </p>
        </div>
      )}
    </div>
  )
}