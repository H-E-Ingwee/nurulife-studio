'use client'

import { useState, useEffect } from 'react'
import { Plus, Loader2, AlertCircle, Clock, CheckCircle2, Eye } from 'lucide-react'
import { cn, PRIORITY_COLORS, formatDate } from '@/lib/utils'
import type { Task, Priority, TaskStatus } from '@/types'

const COLUMNS: { id: TaskStatus; label: string; icon: any; color: string }[] = [
  { id: 'TODO',        label: 'To Do',       icon: Clock,         color: 'text-gray-500' },
  { id: 'IN_PROGRESS', label: 'In Progress', icon: AlertCircle,   color: 'text-nuru-orange' },
  { id: 'REVIEW',      label: 'Review',      icon: Eye,           color: 'text-blue-500' },
  { id: 'DONE',        label: 'Done',        icon: CheckCircle2,  color: 'text-green-500' },
]

interface CreateTaskForm {
  title: string
  priority: Priority
  dueDate: string
  projectId: string
}

export default function TaskBoard() {
  const [tasks, setTasks]       = useState<Task[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading]   = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState<CreateTaskForm>({
    title: '', priority: 'MEDIUM', dueDate: '', projectId: '',
  })

  useEffect(() => {
    Promise.all([fetchTasks(), fetchProjects()])
  }, [])

  async function fetchTasks() {
    try {
      const res = await fetch('/api/tasks')
      const data = await res.json()
      setTasks(data.data || [])
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

  async function createTask(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.projectId) return
    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      setShowCreate(false)
      setForm({ title: '', priority: 'MEDIUM', dueDate: '', projectId: '' })
      fetchTasks()
    } catch (err) { console.error(err) }
  }

  async function updateTaskStatus(taskId: string, status: TaskStatus) {
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t))
    } catch (err) { console.error(err) }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <Loader2 size={24} className="animate-spin text-nuru-orange" />
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="nuru-section-title mb-0">Task Board</h2>
        <button onClick={() => setShowCreate(true)} className="nuru-btn-primary flex items-center gap-2">
          <Plus size={14} /> New Task
        </button>
      </div>

      {/* Create Task Form */}
      {showCreate && (
        <div className="nuru-card mb-4 border-l-4 border-nuru-orange">
          <h3 className="font-heading font-semibold text-nuru-dgray text-sm mb-3">Create New Task</h3>
          <form onSubmit={createTask} className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="nuru-label">Task Title *</label>
              <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                className="nuru-input" placeholder="e.g. Lock script for Beneath the Silence" required />
            </div>
            <div>
              <label className="nuru-label">Project *</label>
              <select value={form.projectId} onChange={e => setForm(p => ({ ...p, projectId: e.target.value }))}
                className="nuru-input" required>
                <option value="">Select project...</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>
            <div>
              <label className="nuru-label">Priority</label>
              <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value as Priority }))}
                className="nuru-input">
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
            <div>
              <label className="nuru-label">Due Date</label>
              <input type="date" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))}
                className="nuru-input" />
            </div>
            <div className="flex gap-2 items-end">
              <button type="button" onClick={() => setShowCreate(false)} className="nuru-btn-ghost border border-gray-200 flex-1">Cancel</button>
              <button type="submit" className="nuru-btn-primary flex-1">Create</button>
            </div>
          </form>
        </div>
      )}

      {/* Kanban Columns */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map(col => {
          const colTasks = tasks.filter(t => t.status === col.id)
          const Icon = col.icon
          return (
            <div key={col.id} className="kanban-column flex-shrink-0">
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Icon size={14} className={col.color} />
                  <span className="font-heading font-semibold text-nuru-dgray text-xs">{col.label}</span>
                </div>
                <span className="bg-gray-200 text-gray-600 text-[10px] font-heading font-bold px-2 py-0.5 rounded-full">
                  {colTasks.length}
                </span>
              </div>

              {/* Task Cards */}
              <div className="space-y-2 min-h-32">
                {colTasks.map(task => (
                  <div key={task.id} className="kanban-card">
                    <p className="font-heading font-semibold text-nuru-dgray text-xs mb-2 leading-snug">
                      {task.title}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className={cn('nuru-badge text-[10px]', PRIORITY_COLORS[task.priority])}>
                        {task.priority}
                      </span>
                      {task.dueDate && (
                        <span className="text-[10px] text-gray-400">{formatDate(task.dueDate)}</span>
                      )}
                    </div>
                    {/* Status Change */}
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <select
                        value={task.status}
                        onChange={e => updateTaskStatus(task.id, e.target.value as TaskStatus)}
                        className="w-full text-[10px] border border-gray-200 rounded px-1 py-0.5 text-gray-500 bg-white"
                      >
                        {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                      </select>
                    </div>
                  </div>
                ))}
                {colTasks.length === 0 && (
                  <div className="text-center py-6 text-gray-300 text-xs font-body">No tasks</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}