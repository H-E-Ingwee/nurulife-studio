'use client'

import { useState, useEffect } from 'react'
import {
  Plus, CalendarDays, Loader2, GripVertical, Clock,
  MapPin, Sparkles, AlertCircle, X, Edit2, Check,
  ChevronDown, ChevronUp, Trash2, RefreshCw
} from 'lucide-react'
import {
  DndContext, closestCenter, PointerSensor,
  KeyboardSensor, useSensor, useSensors, DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext, verticalListSortingStrategy,
  useSortable, sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn, formatDate } from '@/lib/utils'
import type { Schedule, ShootDay, Strip, Project, Scene } from '@/types'

const STATUS_COLORS: Record<string, string> = {
  NOT_STARTED: 'border-l-gray-300 bg-white',
  IN_PROGRESS: 'border-l-nuru-orange bg-orange-50',
  COMPLETED:   'border-l-green-500 bg-green-50',
  POSTPONED:   'border-l-red-400 bg-red-50',
}
const STATUS_LABELS: Record<string, string> = {
  NOT_STARTED: 'Not Started',
  IN_PROGRESS: 'In Progress',
  COMPLETED:   'Completed',
  POSTPONED:   'Postponed',
}

// ── Sortable Strip Card ────────────────────────────────────────────────────────
function SortableStrip({
  strip, onStatusChange, onRemove,
}: {
  strip: Strip
  onStatusChange: (id: string, status: string) => void
  onRemove: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: strip.id })
  const style = { transform: CSS.Transform.toString(transform), transition }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'strip-card border-l-4 mb-1.5 rounded-md p-2 shadow-sm',
        STATUS_COLORS[strip.status],
        isDragging ? 'opacity-50 shadow-lg scale-105' : ''
      )}
    >
      <div className="flex items-start gap-1.5">
        <div {...attributes} {...listeners} className="cursor-grab mt-0.5 text-gray-300 hover:text-gray-500 flex-shrink-0">
          <GripVertical size={12} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="font-heading font-bold text-nuru-maroon text-[10px]">
              Sc. {strip.scene?.sceneNumber}
            </span>
            <span className="text-gray-400 text-[9px] flex-shrink-0">
              {strip.scene?.pageCount}p
            </span>
          </div>
          <p className="text-nuru-dgray text-[10px] truncate leading-tight mt-0.5">
            {strip.scene?.heading}
          </p>
          {strip.estimatedMinutes && (
            <div className="flex items-center gap-1 mt-0.5">
              <Clock size={8} className="text-gray-400" />
              <span className="text-gray-400 text-[9px]">{strip.estimatedMinutes}min</span>
            </div>
          )}
          <div className="flex items-center justify-between mt-1">
            <select
              value={strip.status}
              onChange={e => onStatusChange(strip.id, e.target.value)}
              className="text-[9px] border border-gray-200 rounded px-1 py-0.5 bg-white text-gray-500 flex-1 mr-1"
              onClick={e => e.stopPropagation()}
            >
              {Object.entries(STATUS_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
            <button
              onClick={() => onRemove(strip.id)}
              className="text-gray-300 hover:text-red-400 flex-shrink-0"
            >
              <X size={10} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Shoot Day Column ───────────────────────────────────────────────────────────
function ShootDayColumn({
  day, scenes, scheduleId, onUpdate,
}: {
  day: ShootDay
  scenes: Scene[]
  scheduleId: string
  onUpdate: () => void
}) {
  const [editing, setEditing]       = useState(false)
  const [editForm, setEditForm]     = useState({
    date:            day.date ? new Date(day.date).toISOString().split('T')[0] : '',
    generalCallTime: day.generalCallTime || '',
    location:        day.location || '',
    notes:           day.notes || '',
  })
  const [showAddScene, setShowAddScene] = useState(false)
  const [saving, setSaving]         = useState(false)
  const [addingStrip, setAddingStrip] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  async function saveDay() {
    setSaving(true)
    try {
      await fetch(`/api/schedules/${scheduleId}/shoot-days/${day.id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(editForm),
      })
      setEditing(false)
      onUpdate()
    } finally { setSaving(false) }
  }

  async function addStrip(sceneId: string) {
    setAddingStrip(true)
    try {
      await fetch(`/api/schedules/${scheduleId}/shoot-days/${day.id}/strips`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ sceneId }),
      })
      setShowAddScene(false)
      onUpdate()
    } finally { setAddingStrip(false) }
  }

  async function updateStripStatus(stripId: string, status: string) {
    await fetch(`/api/schedules/${scheduleId}/shoot-days/${day.id}/strips/${stripId}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ status }),
    })
    onUpdate()
  }

  async function removeStrip(stripId: string) {
    await fetch(`/api/schedules/${scheduleId}/shoot-days/${day.id}/strips/${stripId}`, {
      method: 'DELETE',
    })
    onUpdate()
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    await fetch(`/api/schedules/${scheduleId}/shoot-days/${day.id}/strips/reorder`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ activeId: active.id, overId: over.id }),
    })
    onUpdate()
  }

  const totalMinutes = (day.strips || []).reduce((sum, s) => sum + (s.estimatedMinutes || 0), 0)
  const usedSceneIds = new Set((day.strips || []).map(s => s.sceneId))
  const availableScenes = scenes.filter(s => !usedSceneIds.has(s.id))

  return (
    <div className="flex-shrink-0 w-52 bg-white rounded-lg shadow-sm border border-gray-100 flex flex-col">
      {/* Day Header */}
      <div className={cn('p-3 rounded-t-lg', day.isWrapDay ? 'bg-nuru-maroon' : 'bg-nuru-blue')}>
        <div className="flex items-center justify-between mb-1">
          <span className="font-heading font-bold text-white text-sm">Day {day.dayNumber}</span>
          <div className="flex items-center gap-1">
            {day.isWrapDay && (
              <span className="nuru-badge bg-nuru-orange text-white text-[9px]">WRAP</span>
            )}
            <button onClick={() => setEditing(!editing)} className="text-white text-opacity-60 hover:text-white">
              <Edit2 size={11} />
            </button>
          </div>
        </div>

        {editing ? (
          <div className="space-y-1.5 mt-2">
            <input
              type="date"
              value={editForm.date}
              onChange={e => setEditForm(p => ({ ...p, date: e.target.value }))}
              className="w-full text-[10px] rounded px-1.5 py-1 bg-white text-gray-700 border-0"
            />
            <input
              type="time"
              value={editForm.generalCallTime}
              onChange={e => setEditForm(p => ({ ...p, generalCallTime: e.target.value }))}
              className="w-full text-[10px] rounded px-1.5 py-1 bg-white text-gray-700 border-0"
              placeholder="Call time"
            />
            <input
              value={editForm.location}
              onChange={e => setEditForm(p => ({ ...p, location: e.target.value }))}
              className="w-full text-[10px] rounded px-1.5 py-1 bg-white text-gray-700 border-0"
              placeholder="Location"
            />
            <div className="flex gap-1">
              <button onClick={saveDay} disabled={saving}
                className="flex-1 bg-nuru-orange text-white text-[10px] rounded py-1 font-heading font-semibold">
                {saving ? '...' : 'Save'}
              </button>
              <button onClick={() => setEditing(false)}
                className="flex-1 bg-white bg-opacity-20 text-white text-[10px] rounded py-1">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            {editForm.date && (
              <p className="text-white text-opacity-60 text-[10px]">
                {new Date(editForm.date).toLocaleDateString('en-KE', { weekday: 'short', day: 'numeric', month: 'short' })}
              </p>
            )}
            {editForm.generalCallTime && (
              <div className="flex items-center gap-1 mt-0.5">
                <Clock size={9} className="text-nuru-orange" />
                <span className="text-nuru-orange text-[10px] font-semibold">
                  Call: {editForm.generalCallTime}
                </span>
              </div>
            )}
            {editForm.location && (
              <div className="flex items-center gap-1 mt-0.5">
                <MapPin size={9} className="text-white text-opacity-50" />
                <span className="text-white text-opacity-50 text-[10px] truncate">
                  {editForm.location}
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Strips */}
      <div className="flex-1 p-2 min-h-24 overflow-y-auto max-h-80">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={(day.strips || []).map(s => s.id)}
            strategy={verticalListSortingStrategy}
          >
            {(day.strips || []).map(strip => (
              <SortableStrip
                key={strip.id}
                strip={strip}
                onStatusChange={updateStripStatus}
                onRemove={removeStrip}
              />
            ))}
          </SortableContext>
        </DndContext>

        {(!day.strips || day.strips.length === 0) && (
          <p className="text-center text-gray-300 text-[10px] py-4 font-body">
            No scenes yet
          </p>
        )}
      </div>

      {/* Add Scene */}
      <div className="p-2 border-t border-gray-100">
        {showAddScene ? (
          <div>
            <div className="max-h-32 overflow-y-auto space-y-1 mb-1">
              {availableScenes.length === 0 ? (
                <p className="text-gray-400 text-[10px] text-center py-2">All scenes added</p>
              ) : (
                availableScenes.map(scene => (
                  <button
                    key={scene.id}
                    onClick={() => addStrip(scene.id)}
                    disabled={addingStrip}
                    className="w-full text-left p-1.5 rounded hover:bg-nuru-lgray transition-colors"
                  >
                    <p className="text-[10px] font-heading font-semibold text-nuru-maroon">
                      Sc. {scene.sceneNumber}
                    </p>
                    <p className="text-[9px] text-gray-500 truncate">{scene.heading}</p>
                  </button>
                ))
              )}
            </div>
            <button onClick={() => setShowAddScene(false)}
              className="w-full text-[10px] text-gray-400 hover:text-gray-600 py-0.5">
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between text-[10px] text-gray-400">
            <span>{(day.strips || []).length} scenes · {totalMinutes}min</span>
            <button
              onClick={() => setShowAddScene(true)}
              className="flex items-center gap-0.5 text-nuru-orange hover:text-nuru-maroon font-heading font-semibold"
            >
              <Plus size={10} /> Scene
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function ScheduleRoomPage() {
  const [projects, setProjects]           = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState('')
  const [schedules, setSchedules]         = useState<Schedule[]>([])
  const [activeSchedule, setActiveSchedule] = useState<Schedule | null>(null)
  const [shootDays, setShootDays]         = useState<ShootDay[]>([])
  const [allScenes, setAllScenes]         = useState<Scene[]>([])
  const [loading, setLoading]             = useState(false)
  const [smartScheduling, setSmartScheduling] = useState(false)
  const [error, setError]                 = useState('')

  useEffect(() => { fetchProjects() }, [])
  useEffect(() => {
    if (selectedProject) {
      setActiveSchedule(null)
      setShootDays([])
      fetchSchedules(selectedProject)
      fetchAllScenes(selectedProject)
    }
  }, [selectedProject])

  async function fetchProjects() {
    const res  = await fetch('/api/projects')
    const data = await res.json()
    setProjects(data.data || [])
  }

  async function fetchSchedules(projectId: string) {
    setLoading(true)
    try {
      const res  = await fetch(`/api/schedules?projectId=${projectId}`)
      const data = await res.json()
      setSchedules(data.data || [])
      const active = (data.data || []).find((s: Schedule) => s.isActive)
      if (active) {
        setActiveSchedule(active)
        fetchShootDays(active.id)
      }
    } finally { setLoading(false) }
  }

  async function fetchAllScenes(projectId: string) {
    try {
      const bdRes  = await fetch(`/api/breakdowns?projectId=${projectId}`)
      const bdData = await bdRes.json()
      const bds    = bdData.data || []
      if (bds.length > 0) {
        const scRes  = await fetch(`/api/breakdowns/${bds[0].id}/scenes`)
        const scData = await scRes.json()
        setAllScenes(scData.data || [])
      }
    } catch { /* no breakdown yet */ }
  }

  async function fetchShootDays(scheduleId: string) {
    const res  = await fetch(`/api/schedules/${scheduleId}/shoot-days`)
    const data = await res.json()
    setShootDays(data.data || [])
  }

  async function createSchedule() {
    const res  = await fetch('/api/schedules', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        projectId: selectedProject,
        name:      `Version ${schedules.length + 1}`,
      }),
    })
    const data = await res.json()
    if (data.data) {
      setSchedules(prev => [...prev, data.data])
      setActiveSchedule(data.data)
      setShootDays([])
    }
  }

  async function addShootDay() {
    if (!activeSchedule) return
    const res  = await fetch(`/api/schedules/${activeSchedule.id}/shoot-days`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ dayNumber: shootDays.length + 1 }),
    })
    const data = await res.json()
    if (data.data) setShootDays(prev => [...prev, data.data])
  }

  async function runSmartScheduler() {
    if (!activeSchedule) return
    setSmartScheduling(true)
    try {
      const res  = await fetch('/api/ai/smart-scheduler', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ scheduleId: activeSchedule.id, projectId: selectedProject }),
      })
      const data = await res.json()
      if (data.suggestion) {
        const msg = data.suggestion.keyConsiderations?.join('\n') || 'Smart schedule generated!'
        alert(`Smart Scheduler Recommendations:\n\n${msg}`)
      }
    } finally { setSmartScheduling(false) }
  }

  function refreshDays() {
    if (activeSchedule) fetchShootDays(activeSchedule.id)
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading font-black text-nuru-maroon text-2xl">Schedule Room</h1>
          <p className="text-gray-500 text-sm font-body mt-0.5">
            Stripboard, shooting schedule & day planning
          </p>
        </div>
        <div className="flex gap-2">
          {activeSchedule && (
            <>
              <button onClick={refreshDays} className="nuru-btn-ghost flex items-center gap-2 text-sm">
                <RefreshCw size={14} /> Refresh
              </button>
              <button
                onClick={runSmartScheduler}
                disabled={smartScheduling}
                className="nuru-btn-secondary flex items-center gap-2 text-sm"
              >
                {smartScheduling
                  ? <Loader2 size={14} className="animate-spin" />
                  : <Sparkles size={14} />}
                Smart Schedule
              </button>
            </>
          )}
          {selectedProject && (
            <button onClick={createSchedule} className="nuru-btn-primary flex items-center gap-2">
              <Plus size={16} /> New Schedule
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center gap-2">
          <AlertCircle size={16} className="text-red-500" />
          <p className="text-red-700 text-sm flex-1">{error}</p>
          <button onClick={() => setError('')}><X size={14} className="text-red-400" /></button>
        </div>
      )}

      {/* Controls */}
      <div className="nuru-card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="nuru-label">Project</label>
            <select
              value={selectedProject}
              onChange={e => setSelectedProject(e.target.value)}
              className="nuru-input"
            >
              <option value="">Select project...</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>

          {schedules.length > 0 && (
            <div>
              <label className="nuru-label">Schedule Version</label>
              <select
                value={activeSchedule?.id || ''}
                onChange={e => {
                  const s = schedules.find(sc => sc.id === e.target.value) || null
                  setActiveSchedule(s)
                  if (s) fetchShootDays(s.id)
                }}
                className="nuru-input"
              >
                {schedules.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name}{s.isActive ? ' (Active)' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {activeSchedule && (
            <div className="flex items-end">
              <button onClick={addShootDay} className="nuru-btn-outline flex items-center gap-2">
                <Plus size={14} /> Add Shoot Day
              </button>
            </div>
          )}
        </div>

        {/* Scene count info */}
        {allScenes.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
            <span className="text-xs text-gray-500 font-body">
              {allScenes.length} scenes available from breakdown
            </span>
            <span className="text-gray-300">·</span>
            <span className="text-xs text-nuru-orange font-heading font-semibold">
              Click "+ Scene" on any shoot day to add them
            </span>
          </div>
        )}
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 size={24} className="animate-spin text-nuru-orange" />
        </div>
      )}

      {/* Stripboard */}
      {activeSchedule && !loading && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="nuru-section-title mb-0">
              Stripboard — {activeSchedule.name}
              <span className="text-gray-400 font-body font-normal text-sm ml-2">
                ({shootDays.length} shoot days)
              </span>
            </h2>
          </div>

          {shootDays.length === 0 ? (
            <div className="nuru-card text-center py-12">
              <CalendarDays size={40} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-heading font-semibold text-sm mb-1">
                No shoot days yet
              </p>
              <p className="text-gray-400 text-xs font-body mb-4">
                Add shoot days to start building your schedule
              </p>
              <button onClick={addShootDay} className="nuru-btn-primary">
                Add First Shoot Day
              </button>
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-4">
              {shootDays.map(day => (
                <ShootDayColumn
                  key={day.id}
                  day={day}
                  scenes={allScenes}
                  scheduleId={activeSchedule.id}
                  onUpdate={refreshDays}
                />
              ))}
              {/* Add day button */}
              <div className="flex-shrink-0 w-52">
                <button
                  onClick={addShootDay}
                  className="w-full h-32 border-2 border-dashed border-gray-200 rounded-lg
                             flex flex-col items-center justify-center gap-2
                             hover:border-nuru-orange hover:bg-orange-50 transition-all"
                >
                  <Plus size={20} className="text-gray-300" />
                  <span className="text-gray-400 text-xs font-heading font-semibold">
                    Add Shoot Day
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {!selectedProject && (
        <div className="nuru-card text-center py-16">
          <CalendarDays size={48} className="text-gray-200 mx-auto mb-4" />
          <h3 className="font-heading font-bold text-gray-400 text-lg mb-2">Select a Project</h3>
          <p className="text-gray-400 text-sm font-body">
            Choose a project to view or create a shooting schedule
          </p>
        </div>
      )}
    </div>
  )
}