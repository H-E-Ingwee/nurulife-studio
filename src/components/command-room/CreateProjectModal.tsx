'use client'

import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'

const PROJECT_TYPES = [
  { value: 'SHORT_FILM',       label: 'Short Film' },
  { value: 'FEATURE_FILM',     label: 'Feature Film' },
  { value: 'STAGE_PRODUCTION', label: 'Stage Production' },
  { value: 'PODCAST',          label: 'Podcast' },
  { value: 'DOCUMENTARY',      label: 'Documentary' },
  { value: 'MUSIC_VIDEO',      label: 'Music Video' },
  { value: 'COMMERCIAL',       label: 'Commercial' },
]

interface CreateProjectModalProps {
  onClose: () => void
  onCreated: () => void
}

export default function CreateProjectModal({ onClose, onCreated }: CreateProjectModalProps) {
  const [form, setForm] = useState({
    title: '', type: 'SHORT_FILM', description: '', logline: '',
    startDate: '', endDate: '', budget: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) { setError('Project title is required.'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          budget: form.budget ? parseFloat(form.budget) : undefined,
          startDate: form.startDate || undefined,
          endDate: form.endDate || undefined,
        }),
      })
      if (!res.ok) throw new Error('Failed to create project')
      onCreated()
    } catch (err: any) {
      setError(err.message || 'Failed to create project')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="font-heading font-bold text-nuru-maroon text-lg">New Project</h2>
            <p className="text-gray-400 text-xs mt-0.5">Create a new NuruLife production</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-nuru-lgray transition-colors">
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-md p-3 text-sm">{error}</div>
          )}

          <div>
            <label className="nuru-label">Project Title *</label>
            <input name="title" type="text" value={form.title} onChange={handleChange}
              className="nuru-input" placeholder="Beneath the Silence" required />
          </div>

          <div>
            <label className="nuru-label">Project Type *</label>
            <select name="type" value={form.type} onChange={handleChange} className="nuru-input">
              {PROJECT_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="nuru-label">Logline</label>
            <input name="logline" type="text" value={form.logline} onChange={handleChange}
              className="nuru-input" placeholder="One-sentence story summary..." />
          </div>

          <div>
            <label className="nuru-label">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange}
              className="nuru-input resize-none" rows={3}
              placeholder="Brief description of the project..." />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="nuru-label">Start Date</label>
              <input name="startDate" type="date" value={form.startDate} onChange={handleChange} className="nuru-input" />
            </div>
            <div>
              <label className="nuru-label">End Date</label>
              <input name="endDate" type="date" value={form.endDate} onChange={handleChange} className="nuru-input" />
            </div>
          </div>

          <div>
            <label className="nuru-label">Budget (KES)</label>
            <input name="budget" type="number" value={form.budget} onChange={handleChange}
              className="nuru-input" placeholder="150000" min="0" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 nuru-btn-ghost border border-gray-200">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 nuru-btn-primary flex items-center justify-center gap-2">
              {loading ? <><Loader2 size={14} className="animate-spin" />Creating...</> : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}