'use client'

import { useState, useEffect } from 'react'
import { Plus, CalendarDays, Loader2, GripVertical, Clock, MapPin, Sparkles } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn, formatDate } from '@/lib/utils'
import type { Schedule, ShootDay, Strip, Project } from '@/types'

const STATUS_COLORS: Record<string, string> = {
  NOT_STARTED: 'border-l-gray-300',
  IN_PROGRESS: 'border-l-nuru-orange',
  COMPLETED:   'border-l-green-500',
  POSTPONED:   'border-l-red-400',
}

function SortableStrip({ strip }: { strip: Strip }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: strip.id })
  const style = { transform: CSS.Transform.toString(transform), transition }
  return (
    <div ref={setNodeRef} style={style}
      className={cn('strip-card border-l-4', STATUS_COLORS[strip.status], isDragging ? 'opacity-50 shadow-lg' : '')}>
      <div className="flex items-center gap-2">
        <div {...attributes} {...listeners} className="cursor-grab text-gray-300 hover:text-gray-500">
          <GripVertical size={12} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="font-heading font-bold text-nuru-maroon text-[10px]">
              Sc. {strip.scene?.sceneNumber}
            </span>
            <span className="text-gray-400 text-[9px]">{strip.scene?.pageCount}p</span>
          </div>
          <p className="text-nuru-dgray text-[10px] truncate">{strip.scene?.heading}</p>
          {strip.estimatedMinutes && (
            <div className="flex items-center gap-1 mt-0.5">
              <Clock size={8} className="text-gray-400" />
              <span className="text-gray-400 text-[9px]">{strip.estimatedMinutes}min</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ScheduleRoomPage() {
  const [projects, setProjects]     = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState('')
  const [schedules, setSchedules]   = useState<Schedule[]>([])
  const [activeSchedule, setActiveSchedule] = useState<Schedule | null>(null)
  const [shootDays, setShootDays]   = useState<ShootDay[]>([])
  const [loading, setLoading]       = useState(false)
  const [smartScheduling, setSmartScheduling] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  useEffect(() => { fetchProjects() }, [])
  useEffect(() => { if (selectedProject) fetchSchedules(selectedProject) }, [selectedProject])

  async function fetchProjects() {
    const res = await fetch('/api/projects')
    const data = await res.json()
    setProjects(data.data || [])
  }

  async function fetchSchedules(projectId: string) {
    setLoading(true)
    try {
      const res = await fetch(`/api/schedules?projectId=${projectId}`)
      const data = await res.json()
      setSchedules(data.data || [])
      const active = data.data?.find((s: Schedule) => s.isActive)
      if (active) { setActiveSchedule(active); fetchShootDays(active.id) }
    } finally { setLoading(false) }
  }

  async function fetchShootDays(scheduleId: string) {
    const res = await fetch(`/api/schedules/${scheduleId}/shoot-days`)
    const data = await res.json()
    setShootDays(data.data || [])
  }

  async function createSchedule() {
    const res = await fetch('/api/schedules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId: selectedProject, name: `Version ${schedules.length + 1}` }),
    })
    const data = await res.json()
    if (data.data) { setSchedules(prev => [...prev, data.data]); setActiveSchedule(data.data); setShootDays([]) }
  }

  async function addShootDay() {
    if (!activeSchedule) return
    const res = await fetch(`/api/schedules/${activeSchedule.id}/shoot-days`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dayNumber: shootDays.length + 1 }),
    })
    const data = await res.json()
    if (data.data) setShootDays(prev => [...prev, data.data])
  }

  async function handleDragEnd(event: DragEndEvent, dayId: string) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    await fetch(`/api/schedules/${activeSchedule?.id}/shoot-days/${dayId}/strips/reorder`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activeId: active.id, overId: over.id }),
    })
    if (activeSchedule) fetchShootDays(activeSchedule.id)
  }

  async function runSmartScheduler() {
    if (!activeSchedule) return
    setSmartScheduling(true)
    try {
      const res = await fetch('/api/ai/smart-scheduler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduleId: activeSchedule.id, projectId: selectedProject }),
      })
      const data = await res.json()
      if (data.suggestion) alert(`Smart Scheduler Suggestion:\n\n${JSON.stringify(data.suggestion, null, 2)}`)
    } finally { setSmartScheduling(false) }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading font-black text-nuru-maroon text-2xl">Schedule Room</h1>
          <p className="text-gray-500 text-sm font-body mt-0.5">Stripboard, shooting schedule & day planning</p>
        </div>
        <div className="flex gap-2">
          {activeSchedule && (
            <button onClick={runSmartScheduler} disabled={smartScheduling}
              className="nuru-btn-secondary flex items-center gap-2 text-sm">
              {smartScheduling ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              Smart Schedule
            </button>
          )}
          {selectedProject && (
            <button onClick={createSchedule} className="nuru-btn-primary flex items-center gap-2">
              <Plus size={16} /> New Schedule
            </button>
          )}
        </div>
      </div>

      {/* Project & Schedule Selector */}
      <div className="nuru-card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="nuru-label">Project</label>
            <select value={selectedProject} onChange={e => { setSelectedProject(e.target.value); setActiveSchedule(null); setShootDays([]) }}
              className="nuru-input">
              <option value="">Select project...</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </div>
          {schedules.length > 0 && (
            <div>
              <label className="nuru-label">Schedule Version</label>
              <select value={activeSchedule?.id || ''} onChange={e => {
                const s = schedules.find(sc => sc.id === e.target.value) || null
                setActiveSchedule(s)
                if (s) fetchShootDays(s.id)
              }} className="nuru-input">
                {schedules.map(s => <option key={s.id} value={s.id}>{s.name}{s.isActive ? ' (Active)' : ''}</option>)}
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
      </div>

      {loading && <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-nuru-orange" /></div>}

      {/* Stripboard */}
      {activeSchedule && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="nuru-section-title mb-0">
              Stripboard — {activeSchedule.name} ({shootDays.length} shoot days)
            </h2>
          </div>

          {shootDays.length === 0 ? (
            <div className="nuru-card text-center py-12">
              <CalendarDays size={40} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm font-body mb-4">No shoot days yet. Add your first shoot day to start building the schedule.</p>
              <button onClick={addShootDay} className="nuru-btn-primary">Add First Shoot Day</button>
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-4">
              {shootDays.map(day => (
                <div key={day.id} className="flex-shrink-0 w-52 bg-white rounded-lg shadow-sm border border-gray-100">
                  {/* Day Header */}
                  <div className="bg-nuru-blue p-3 rounded-t-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-heading font-bold text-white text-sm">Day {day.dayNumber}</span>
                      {day.isWrapDay && <span className="nuru-badge bg-nuru-orange text-white text-[9px]">WRAP</span>}
                    </div>
                    {day.date && <p className="text-white text-opacity-60 text-[10px] mt-0.5">{formatDate(day.date)}</p>}
                    {day.generalCallTime && (
                      <div className="flex items-center gap-1 mt-1">
                        <Clock size={9} className="text-nuru-orange" />
                        <span className="text-nuru-orange text-[10px] font-semibold">Call: {day.generalCallTime}</span>
                      </div>
                    )}
                    {day.location && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <MapPin size={9} className="text-white text-opacity-50" />
                        <span className="text-white text-opacity-50 text-[10px] truncate">{day.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Strips */}
                  <div className="p-2 min-h-32">
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={(e) => handleDragEnd(e, day.id)}
                    >
                      <SortableContext
                        items={(day.strips || []).map(s => s.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {(day.strips || []).map(strip => (
                          <SortableStrip key={strip.id} strip={strip} />
                        ))}
                      </SortableContext>
                    </DndContext>
                    {(!day.strips || day.strips.length === 0) && (
                      <p className="text-center text-gray-300 text-[10px] py-4 font-body">Drop scenes here</p>
                    )}
                  </div>

                  {/* Day Footer */}
                  <div className="p-2 border-t border-gray-100">
                    <div className="flex items-center justify-between text-[10px] text-gray-400">
                      <span>{day.strips?.length || 0} scenes</span>
                      <span>{day.strips?.reduce((sum, s) => sum + (s.estimatedMinutes || 0), 0) || 0}min</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!selectedProject && (
        <div className="nuru-card text-center py-16">
          <CalendarDays size={48} className="text-gray-200 mx-auto mb-4" />
          <h3 className="font-heading font-bold text-gray-400 text-lg mb-2">Select a Project</h3>
          <p className="text-gray-400 text-sm font-body">Choose a project to view or create a shooting schedule</p>
        </div>
      )}
    </div>
  )
}