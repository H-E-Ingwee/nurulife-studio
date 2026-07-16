'use client'

import { useState, useEffect } from 'react'
import {
  Plus, Loader2, AlertCircle, Clock, CheckCircle2,
  Eye, X, Check, Trash2, RefreshCw, Filter
} from 'lucide-react'
import { cn, PRIORITY_COLORS, formatDate } from '@/lib/utils'
import type { Task, Priority, TaskStatus, Project } from '@/types'

const COLUMNS: { id: TaskStatus; label: string; icon: any; color: string; bg: string }[] = [
  { id: 'TODO',        label: 'To Do',       icon: Clock,        color: 'text-gray-500',        bg: 'bg-gray-100' },
  { id: 'IN_PROGRESS', label: 'In Progress', icon: AlertCircle,  color: 'text-nuru-orange',     bg: 'bg-orange-100' },
  { id: 'REVIEW',      label: 'Review',      icon: Eye,          color: 'text-blue-500',        bg: 'bg-blue-100' },
  { id: 'DONE',        label: 'Done',        icon: CheckCircle2, color: 'text-green-500',       bg: 'bg-green-100' },
]

const BOARDS = ['Production', 'Marketing', 'Technology', 'Finance']

interface CreateTaskForm {
  title:       string
  description: string
  priority:    Priority
  dueDate:     string
  projectId:   string
  board:       string
}

const EMPTY_FORM: CreateTaskForm = {
  title: '', description: '', priority: 'MEDIUM', dueDate: '', projectId: '', board: 'Production',
}

export default function TaskBoard() {
  const [tasks, setTasks]         = useState<Task[]>([])
  const [projects, setProjects]   = useState<Project[]>([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm]           = useState<CreateTaskForm>({ ...EMPTY_FORM })
  const [saving, setSaving]       = useState(false)
  const [filterProject, setFilterProject] = useState('')
  const [filterBoard, setFilterBoard]     = useState('Production')
  const [showFilters, setShowFilters]     = useState(false)

  useEffect(() => {
    fetchProjects()
    fetchTasks()
  }, [filterProject, filterBoard])

  async function fetchProjects() {
    try {
      const res  = await fetch('/api/projects')
      const data = await res.json()
      setProjects(data.data || [])
      // Auto-select first project if none selected
      if (!filterProject && data.data?.length > 0) {
        setFilterProject(data.data[0].id)
        setForm(prev => ({ ...prev, projectId: data.data[0].id }))
      }
    } catch { /* silent */ }
  }

  async function fetchTasks() {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (filterProject) params.set('projectId', filterProject)
      if (filterBoard)   params.set('board', filterBoard)
      const res  = await fetch(`/api/tasks?${params.toString()}`)
      const data = await res.json()
      setTasks(data.data || [])
    } catch { setError('Failed to load tasks') }
    finally { setLoading(false) }
  }

  async function createTask(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) { setError('Task title is required'); return }
    if (!form.projectId)    { setError('Please select a project'); return }
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/tasks', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          ...form,
          dueDate: form.dueDate || undefined,
        }),
      })
      if (!res.ok) throw new Error('Failed to create task')
      setShowCreate(false)
      setForm({ ...EMPTY_FORM, projectId: filterProject, board: filterBoard })
      await fetchTasks()
    } catch (err: any) {
      setError(err.message)
    } finally { setSaving(false) }
  }

  async function updateStatus(taskId: string, status: TaskStatus) {
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ status }),
      })
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t))
    } catch { setError('Failed to update task') }
  }

  async function deleteTask(taskId: string) {
    if (!confirm('Delete this task?')) return
    try {
      await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' })
      setTasks(prev => prev.filter(t => t.id !== taskId))
    } catch { setError('Failed to delete task') }
  }

  const getColumnTasks = (status: TaskStatus) =>
    tasks.filter(t => t.status === status)

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="nuru-section-title mb-0">Task Board</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn('nuru-btn-ghost flex items-center gap-1.5 text-sm',
              showFilters ? 'text-nuru-orange' : '')}
          >
            <Filter size={14} /> Filters
          </button>
          <button onClick={fetchTasks} className="nuru-btn-ghost flex items-center gap-1.5 text-sm">
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="nuru-btn-primary flex items-center gap-2"
          >
            <Plus size={14} /> New Task
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="nuru-card mb-4 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="nuru-label">Filter by Project</label>
              <select
                value={filterProject}
                onChange={e => { setFilterProject(e.target.value); setForm(p => ({ ...p, projectId: e.target.value })) }}
                className="nuru-input"
              >
                <option value="">All projects</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>
            <div>
              <label className="nuru-label">Filter by Board</label>
              <select
                value={filterBoard}
                onChange={e => { setFilterBoard(e.target.value); setForm(p => ({ ...p, board: e.target.value })) }}
                className="nuru-input"
              >
                <option value="">All boards</option>
                {BOARDS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center gap-2">
          <AlertCircle size={16} className="text-red-500" />
          <p className="text-red-700 text-sm flex-1">{error}</p>
          <button onClick={() => setError('')}><X size={14} className="text-red-400" /></button>
        </div>
      )}

      {/* Create Task Form */}
      {showCreate && (
        <div className="nuru-card mb-4 border-l-4 border-nuru-orange animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-heading font-semibold text-nuru-dgray text-sm">Create New Task</h3>
            <button onClick={() => setShowCreate(false)}>
              <X size={16} className="text-gray-400" />
            </button>
          </div>
          <form onSubmit={createTask} className="space-y-3">
            <div>
              <label className="nuru-label">Task Title *</label>
              <input
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                className="nuru-input"
                placeholder="e.g. Lock script for Beneath the Silence"
                required
              />
            </div>
            <div>
              <label className="nuru-label">Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                className="nuru-input resize-none"
                rows={2}
                placeholder="Optional details..."
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="nuru-label">Project *</label>
                <select
                  value={form.projectId}
                  onChange={e => setForm(p => ({ ...p, projectId: e.target.value }))}
                  className="nuru-input"
                  required
                >
                  <option value="">Select...</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </div>
              <div>
                <label className="nuru-label">Board</label>
                <select
                  value={form.board}
                  onChange={e => setForm(p => ({ ...p, board: e.target.value }))}
                  className="nuru-input"
                >
                  {BOARDS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="nuru-label">Priority</label>
                <select
                  value={form.priority}
                  onChange={e => setForm(p => ({ ...p, priority: e.target.value as Priority }))}
                  className="nuru-input"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
              <div>
                <label className="nuru-label">Due Date</label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))}
                  className="nuru-input"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="nuru-btn-ghost border border-gray-200 flex-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="nuru-btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {saving ? <><Loader2 size={14} className="animate-spin" />Creating...</> : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-nuru-orange" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="nuru-card text-center py-12">
          <CheckCircle2 size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-heading font-semibold text-sm mb-1">No tasks yet</p>
          <p className="text-gray-400 text-xs font-body mb-4">
            {filterProject ? 'No tasks for this project.' : 'Select a project to see its tasks.'}
          </p>
          <button onClick={() => setShowCreate(true)} className="nuru-btn-primary">
            Create First Task
          </button>
        </div>
      ) : (
        /* Kanban Columns */
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map(col => {
            const colTasks = getColumnTasks(col.id)
            const Icon     = col.icon
            return (
              <div key={col.id} className="kanban-column flex-shrink-0">
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={cn('w-6 h-6 rounded-md flex items-center justify-center', col.bg)}>
                      <Icon size={12} className={col.color} />
                    </div>
                    <span className="font-heading font-semibold text-nuru-dgray text-xs">{col.label}</span>
                  </div>
                  <span className={cn(
                    'text-[10px] font-heading font-bold px-2 py-0.5 rounded-full',
                    col.bg, col.color
                  )}>
                    {colTasks.length}
                  </span>
                </div>

                {/* Task Cards */}
                <div className="space-y-2 min-h-24">
                  {colTasks.map(task => (
                    <div key={task.id} className="kanban-card group">
                      {/* Task Title */}
                      <p className="font-heading font-semibold text-nuru-dgray text-xs mb-2 leading-snug">
                        {task.title}
                      </p>

                      {/* Description */}
                      {task.description && (
                        <p className="text-gray-400 text-[10px] mb-2 line-clamp-2 font-body">
                          {task.description}
                        </p>
                      )}

                      {/* Meta */}
                      <div className="flex items-center justify-between mb-2">
                        <span className={cn('nuru-badge text-[10px]', PRIORITY_COLORS[task.priority])}>
                          {task.priority}
                        </span>
                        {task.dueDate && (
                          <span className={cn(
                            'text-[10px] font-body',
                            new Date(task.dueDate) < new Date() && task.status !== 'DONE'
                              ? 'text-red-500 font-semibold'
                              : 'text-gray-400'
                          )}>
                            {formatDate(task.dueDate)}
                          </span>
                        )}
                      </div>

                      {/* Status Change */}
                      <div className="flex items-center gap-1">
                        <select
                          value={task.status}
                          onChange={e => updateStatus(task.id, e.target.value as TaskStatus)}
                          className="flex-1 text-[10px] border border-gray-200 rounded px-1 py-0.5 text-gray-500 bg-white"
                        >
                          {COLUMNS.map(c => (
                            <option key={c.id} value={c.id}>{c.label}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="text-gray-200 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                          title="Delete task"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {colTasks.length === 0 && (
                    <div className="text-center py-6 text-gray-300 text-[10px] font-body border-2 border-dashed border-gray-100 rounded-lg">
                      No tasks
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}