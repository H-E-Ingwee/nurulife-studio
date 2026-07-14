'use client'

import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import type { Project } from '@/types'

const SCRIPT_TYPES = [
  { value: 'SCREENPLAY', label: 'Screenplay', desc: 'Feature film or short film script' },
  { value: 'AV_SCRIPT',  label: 'AV Script',  desc: 'Two-column format for music videos, podcasts, commercials' },
  { value: 'DOCUMENT',   label: 'Document',   desc: 'Contracts, release forms, production notes' },
  { value: 'TEMPLATE',   label: 'Template',   desc: 'Reusable document template' },
]

interface CreateScriptModalProps {
  projects: Project[]
  onClose: () => void
  onCreated: () => void
}

export default function CreateScriptModal({ projects, onClose, onCreated }: CreateScriptModalProps) {
  const [form, setForm] = useState({ title: '', type: 'SCREENPLAY', projectId: '', notes: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) { setError('Script title is required.'); return }
    if (!form.projectId) { setError('Please select a project.'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/scripts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Failed to create script')
      onCreated()
    } catch (err: any) {
      setError(err.message || 'Failed to create script')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-fade-in">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="font-heading font-bold text-nuru-maroon text-lg">New Script</h2>
            <p className="text-gray-400 text-xs mt-0.5">Create a new writing document</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-nuru-lgray">
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-md p-3 text-sm">{error}</div>}

          <div>
            <label className="nuru-label">Script Title *</label>
            <input name="title" type="text" value={form.title} onChange={handleChange}
              className="nuru-input" placeholder="Beneath the Silence — Draft 1" required />
          </div>

          <div>
            <label className="nuru-label">Project *</label>
            <select name="projectId" value={form.projectId} onChange={handleChange} className="nuru-input" required>
              <option value="">Select a project...</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </div>

          <div>
            <label className="nuru-label">Script Type *</label>
            <div className="grid grid-cols-2 gap-2">
              {SCRIPT_TYPES.map(type => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, type: type.value }))}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    form.type === type.value
                      ? 'border-nuru-maroon bg-nuru-maroon bg-opacity-5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className={`font-heading font-semibold text-xs ${form.type === type.value ? 'text-nuru-maroon' : 'text-nuru-dgray'}`}>
                    {type.label}
                  </p>
                  <p className="text-gray-400 text-[10px] mt-0.5">{type.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="nuru-label">Notes (optional)</label>
            <textarea name="notes" value={form.notes} onChange={handleChange}
              className="nuru-input resize-none" rows={2} placeholder="Any notes about this script..." />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 nuru-btn-ghost border border-gray-200">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 nuru-btn-primary flex items-center justify-center gap-2">
              {loading ? <><Loader2 size={14} className="animate-spin" />Creating...</> : 'Create Script'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}