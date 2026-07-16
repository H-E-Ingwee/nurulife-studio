'use client'

import { useState, useEffect } from 'react'
import {
  Plus, Phone, Users, FileText, Loader2, Search,
  Send, Sparkles, Clock, AlertCircle, X, Check,
  Trash2, RefreshCw, ChevronDown, ChevronUp, Edit2
} from 'lucide-react'
import { cn, formatDate, formatCurrency } from '@/lib/utils'
import type { Contact, CallSheet, Project, PrayerFocus } from '@/types'

const TABS = [
  { id: 'contacts',   label: 'Contacts',    icon: Users },
  { id: 'callsheets', label: 'Call Sheets', icon: FileText },
]

// ── Contact Form ───────────────────────────────────────────────────────────────
const EMPTY_CONTACT = {
  name: '', role: '', department: '', email: '', phone: '',
  whatsapp: '', dayRate: '', dietary: '', transport: '', notes: '',
}

// ── Call Sheet Form ────────────────────────────────────────────────────────────
const EMPTY_CALLSHEET = {
  projectId: '', dayNumber: '1', date: '', generalCallTime: '06:00',
  location: '', nearestHospital: '', parking: '', advanceSchedule: '',
}

export default function CallRoomPage() {
  const [activeTab, setActiveTab]     = useState('contacts')
  const [contacts, setContacts]       = useState<Contact[]>([])
  const [callSheets, setCallSheets]   = useState<CallSheet[]>([])
  const [projects, setProjects]       = useState<Project[]>([])
  const [loading, setLoading]         = useState(false)
  const [search, setSearch]           = useState('')
  const [error, setError]             = useState('')
  const [success, setSuccess]         = useState('')

  // Contact modal
  const [showCreateContact, setShowCreateContact] = useState(false)
  const [contactForm, setContactForm] = useState({ ...EMPTY_CONTACT })
  const [savingContact, setSavingContact] = useState(false)

  // Call sheet modal
  const [showCreateCallSheet, setShowCreateCallSheet] = useState(false)
  const [callSheetForm, setCallSheetForm] = useState({ ...EMPTY_CALLSHEET })
  const [prayerFocus, setPrayerFocus] = useState<PrayerFocus | null>(null)
  const [generatingPrayer, setGeneratingPrayer] = useState(false)
  const [savingCallSheet, setSavingCallSheet] = useState(false)

  // Call sheet detail
  const [expandedSheet, setExpandedSheet] = useState<string | null>(null)
  const [selectedProject, setSelectedProject] = useState('')
  const [sending, setSending]         = useState<string | null>(null)

  // Entry management
  const [addingEntry, setAddingEntry] = useState<string | null>(null)
  const [entryForm, setEntryForm]     = useState({ contactId: '', callTime: '06:00', makeupTime: '', onSetTime: '', notes: '' })

  useEffect(() => {
    fetchContacts()
    fetchProjects()
  }, [])

  useEffect(() => {
    if (selectedProject) fetchCallSheets(selectedProject)
    else fetchCallSheets()
  }, [selectedProject])

  function showSuccess(msg: string) {
    setSuccess(msg)
    setTimeout(() => setSuccess(''), 3000)
  }

  async function fetchContacts() {
    setLoading(true)
    try {
      const res  = await fetch('/api/contacts')
      const data = await res.json()
      setContacts(data.data || [])
    } catch { setError('Failed to load contacts') }
    finally { setLoading(false) }
  }

  async function fetchProjects() {
    const res  = await fetch('/api/projects')
    const data = await res.json()
    setProjects(data.data || [])
  }

  async function fetchCallSheets(projectId?: string) {
    setLoading(true)
    try {
      const url  = projectId ? `/api/callsheets?projectId=${projectId}` : '/api/callsheets'
      const res  = await fetch(url)
      const data = await res.json()
      setCallSheets(data.data || [])
    } catch { setError('Failed to load call sheets') }
    finally { setLoading(false) }
  }

  // ── Contacts ────────────────────────────────────────────────────────────────
  async function createContact(e: React.FormEvent) {
    e.preventDefault()
    setSavingContact(true)
    setError('')
    try {
      const res = await fetch('/api/contacts', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          ...contactForm,
          dayRate: contactForm.dayRate ? parseFloat(contactForm.dayRate) : undefined,
        }),
      })
      if (!res.ok) throw new Error('Failed to create contact')
      setShowCreateContact(false)
      setContactForm({ ...EMPTY_CONTACT })
      await fetchContacts()
      showSuccess('Contact added successfully!')
    } catch (err: any) {
      setError(err.message)
    } finally { setSavingContact(false) }
  }

  async function deleteContact(id: string, name: string) {
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return
    try {
      await fetch(`/api/contacts/${id}`, { method: 'DELETE' })
      await fetchContacts()
      showSuccess('Contact deleted.')
    } catch { setError('Failed to delete contact') }
  }

  // ── Prayer Focus ─────────────────────────────────────────────────────────────
  async function generatePrayerFocus() {
    setGeneratingPrayer(true)
    try {
      const project = projects.find(p => p.id === callSheetForm.projectId)
      const res  = await fetch('/api/ai/prayer-focus', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          scenesDescription: callSheetForm.advanceSchedule || 'General production day',
          projectName:       project?.title || 'NuruLife Production',
        }),
      })
      const data = await res.json()
      if (data.prayerFocus) setPrayerFocus(data.prayerFocus)
    } catch { setError('Failed to generate prayer focus') }
    finally { setGeneratingPrayer(false) }
  }

  // ── Call Sheets ──────────────────────────────────────────────────────────────
  async function createCallSheet(e: React.FormEvent) {
    e.preventDefault()
    if (!callSheetForm.projectId) { setError('Please select a project'); return }
    if (!callSheetForm.date)      { setError('Please select a date'); return }
    setSavingCallSheet(true)
    setError('')
    try {
      const res = await fetch('/api/callsheets', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          ...callSheetForm,
          dayNumber:   parseInt(callSheetForm.dayNumber) || 1,
          prayerFocus: prayerFocus || undefined,
        }),
      })
      if (!res.ok) throw new Error('Failed to create call sheet')
      setShowCreateCallSheet(false)
      setCallSheetForm({ ...EMPTY_CALLSHEET })
      setPrayerFocus(null)
      await fetchCallSheets(selectedProject || undefined)
      showSuccess('Call sheet created!')
    } catch (err: any) {
      setError(err.message)
    } finally { setSavingCallSheet(false) }
  }

  async function addEntry(callSheetId: string) {
    if (!entryForm.contactId || !entryForm.callTime) {
      setError('Please select a contact and call time')
      return
    }
    try {
      const res = await fetch(`/api/callsheets/${callSheetId}/entries`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(entryForm),
      })
      if (!res.ok) throw new Error('Failed to add entry')
      setAddingEntry(null)
      setEntryForm({ contactId: '', callTime: '06:00', makeupTime: '', onSetTime: '', notes: '' })
      await fetchCallSheets(selectedProject || undefined)
      showSuccess('Cast/crew added to call sheet!')
    } catch (err: any) {
      setError(err.message)
    }
  }

  async function sendCallSheet(callSheetId: string) {
    const sheet = callSheets.find(cs => cs.id === callSheetId)
    if (!sheet?.entries?.length) {
      setError('Add cast & crew to the call sheet before sending.')
      return
    }
    const hasEmails = sheet.entries.some(e => e.contact?.email)
    if (!hasEmails) {
      setError('No recipients have email addresses. Add emails to contacts first.')
      return
    }
    setSending(callSheetId)
    try {
      const res = await fetch(`/api/callsheets/${callSheetId}/send`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Send failed')
      await fetchCallSheets(selectedProject || undefined)
      showSuccess(data.message || 'Call sheet sent!')
    } catch (err: any) {
      setError(err.message)
    } finally { setSending(null) }
  }

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.role.toLowerCase().includes(search.toLowerCase()) ||
    (c.department || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading font-black text-nuru-maroon text-2xl">Call Room</h1>
          <p className="text-gray-500 text-sm font-body mt-0.5">
            Contacts, call sheets & crew communication
          </p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'contacts' && (
            <button onClick={() => setShowCreateContact(true)} className="nuru-btn-primary flex items-center gap-2">
              <Plus size={16} /> Add Contact
            </button>
          )}
          {activeTab === 'callsheets' && (
            <button onClick={() => setShowCreateCallSheet(true)} className="nuru-btn-primary flex items-center gap-2">
              <Plus size={16} /> New Call Sheet
            </button>
          )}
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center gap-2">
          <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
          <p className="text-red-700 text-sm flex-1">{error}</p>
          <button onClick={() => setError('')}><X size={14} className="text-red-400" /></button>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 flex items-center gap-2">
          <Check size={16} className="text-green-500 flex-shrink-0" />
          <p className="text-green-700 text-sm">{success}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-white rounded-lg p-1 shadow-sm border border-gray-100 w-fit">
        {TABS.map(tab => {
          const Icon = tab.icon
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-heading font-semibold transition-all',
                activeTab === tab.id
                  ? 'bg-nuru-maroon text-white'
                  : 'text-gray-500 hover:text-nuru-dgray hover:bg-nuru-lgray'
              )}>
              <Icon size={14} />{tab.label}
              <span className={cn(
                'text-[10px] px-1.5 py-0.5 rounded-full font-bold',
                activeTab === tab.id ? 'bg-white text-nuru-maroon' : 'bg-gray-100 text-gray-500'
              )}>
                {tab.id === 'contacts' ? contacts.length : callSheets.length}
              </span>
            </button>
          )
        })}
      </div>

      {/* ── CONTACTS TAB ──────────────────────────────────────────────────── */}
      {activeTab === 'contacts' && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, role, department..."
                className="nuru-input pl-9"
              />
            </div>
            <button onClick={fetchContacts} className="nuru-btn-ghost flex items-center gap-1 text-sm">
              <RefreshCw size={14} /> Refresh
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 size={24} className="animate-spin text-nuru-orange" />
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="nuru-card text-center py-12">
              <Users size={40} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm font-body">
                {search ? 'No contacts match your search.' : 'No contacts yet. Add your first cast or crew member.'}
              </p>
              {!search && (
                <button onClick={() => setShowCreateContact(true)} className="nuru-btn-primary mt-4">
                  Add First Contact
                </button>
              )}
            </div>
          ) : (
            <div className="nuru-card overflow-hidden p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-nuru-maroon bg-gray-50">
                    {['Name & Role', 'Department', 'Email', 'Phone', 'Day Rate', ''].map(h => (
                      <th key={h} className="text-left py-3 px-4 font-heading font-bold text-nuru-maroon text-xs uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredContacts.map((contact, i) => (
                    <tr key={contact.id}
                      className={cn('border-b border-gray-50 hover:bg-nuru-lgray transition-colors',
                        i % 2 === 0 ? 'bg-white' : 'bg-gray-50')}>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-nuru-maroon flex items-center justify-center text-white text-[10px] font-heading font-bold flex-shrink-0">
                            {contact.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-heading font-semibold text-nuru-dgray text-sm">{contact.name}</p>
                            <p className="text-gray-400 text-xs">{contact.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-500 text-xs">{contact.department || '—'}</td>
                      <td className="py-3 px-4 text-gray-500 text-xs">{contact.email || '—'}</td>
                      <td className="py-3 px-4 text-gray-500 text-xs">{contact.phone || '—'}</td>
                      <td className="py-3 px-4 text-gray-500 text-xs">
                        {contact.dayRate ? formatCurrency(contact.dayRate) : '—'}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => deleteContact(contact.id, contact.name)}
                          className="text-gray-300 hover:text-red-500 transition-colors"
                          title="Delete contact"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── CALL SHEETS TAB ───────────────────────────────────────────────── */}
      {activeTab === 'callsheets' && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="max-w-xs">
              <label className="nuru-label">Filter by Project</label>
              <select
                value={selectedProject}
                onChange={e => setSelectedProject(e.target.value)}
                className="nuru-input"
              >
                <option value="">All projects</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <button onClick={() => fetchCallSheets(selectedProject || undefined)}
                className="nuru-btn-ghost flex items-center gap-1 text-sm">
                <RefreshCw size={14} /> Refresh
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 size={24} className="animate-spin text-nuru-orange" />
            </div>
          ) : callSheets.length === 0 ? (
            <div className="nuru-card text-center py-12">
              <FileText size={40} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm font-body">No call sheets yet.</p>
              <button onClick={() => setShowCreateCallSheet(true)} className="nuru-btn-primary mt-4">
                Create First Call Sheet
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {callSheets.map(cs => (
                <div key={cs.id} className="nuru-card">
                  {/* Call Sheet Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={cn('nuru-badge text-[10px]',
                          cs.status === 'SENT'      ? 'bg-green-100 text-green-700' :
                          cs.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-500')}>
                          {cs.status}
                        </span>
                        <span className="text-gray-400 text-xs font-heading font-semibold">
                          Day {cs.dayNumber}
                        </span>
                        <span className="text-gray-300">·</span>
                        <span className="text-gray-500 text-xs">{formatDate(cs.date)}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Clock size={11} className="text-nuru-orange" />
                          <strong className="text-nuru-maroon">{cs.generalCallTime}</strong>
                        </span>
                        <span>{cs.location}</span>
                        {cs.entries && (
                          <span>{cs.entries.length} recipients</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => setExpandedSheet(expandedSheet === cs.id ? null : cs.id)}
                        className="nuru-btn-ghost text-xs flex items-center gap-1 py-1.5 px-3"
                      >
                        {expandedSheet === cs.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        {expandedSheet === cs.id ? 'Collapse' : 'Manage'}
                      </button>
                      {cs.status === 'DRAFT' && (
                        <button
                          onClick={() => sendCallSheet(cs.id)}
                          disabled={sending === cs.id}
                          className="nuru-btn-primary flex items-center gap-1.5 text-xs py-1.5 px-3"
                        >
                          {sending === cs.id
                            ? <Loader2 size={12} className="animate-spin" />
                            : <Send size={12} />}
                          Send
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Prayer Focus */}
                  {cs.prayerFocus && (
                    <div className="mt-3 p-3 bg-orange-50 border-l-4 border-nuru-orange rounded-r-lg">
                      <p className="text-[10px] font-heading font-bold text-nuru-orange uppercase tracking-wide mb-1">
                        🙏 Prayer Focus
                      </p>
                      <p className="text-nuru-blue text-xs italic">
                        "{(cs.prayerFocus as PrayerFocus).scripture}"
                      </p>
                      <p className="text-nuru-maroon text-[10px] font-semibold mt-0.5">
                        — {(cs.prayerFocus as PrayerFocus).reference}
                      </p>
                      {(cs.prayerFocus as PrayerFocus).prayer && (
                        <p className="text-gray-600 text-xs mt-1">
                          {(cs.prayerFocus as PrayerFocus).prayer}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Expanded: Entries Management */}
                  {expandedSheet === cs.id && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-heading font-bold text-nuru-dgray text-sm">
                          Cast & Crew Call Times
                        </h4>
                        <button
                          onClick={() => setAddingEntry(addingEntry === cs.id ? null : cs.id)}
                          className="nuru-btn-outline text-xs py-1 px-2 flex items-center gap-1"
                        >
                          <Plus size={11} /> Add Person
                        </button>
                      </div>

                      {/* Add Entry Form */}
                      {addingEntry === cs.id && (
                        <div className="bg-nuru-lgray rounded-lg p-3 mb-3">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
                            <div className="md:col-span-2">
                              <label className="nuru-label">Contact *</label>
                              <select
                                value={entryForm.contactId}
                                onChange={e => setEntryForm(p => ({ ...p, contactId: e.target.value }))}
                                className="nuru-input text-xs"
                              >
                                <option value="">Select contact...</option>
                                {contacts.map(c => (
                                  <option key={c.id} value={c.id}>
                                    {c.name} — {c.role}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="nuru-label">Call Time *</label>
                              <input
                                type="time"
                                value={entryForm.callTime}
                                onChange={e => setEntryForm(p => ({ ...p, callTime: e.target.value }))}
                                className="nuru-input text-xs"
                              />
                            </div>
                            <div>
                              <label className="nuru-label">Makeup Time</label>
                              <input
                                type="time"
                                value={entryForm.makeupTime}
                                onChange={e => setEntryForm(p => ({ ...p, makeupTime: e.target.value }))}
                                className="nuru-input text-xs"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="nuru-label">On Set Time</label>
                              <input
                                type="time"
                                value={entryForm.onSetTime}
                                onChange={e => setEntryForm(p => ({ ...p, onSetTime: e.target.value }))}
                                className="nuru-input text-xs"
                              />
                            </div>
                            <div>
                              <label className="nuru-label">Notes</label>
                              <input
                                value={entryForm.notes}
                                onChange={e => setEntryForm(p => ({ ...p, notes: e.target.value }))}
                                className="nuru-input text-xs"
                                placeholder="Any special notes..."
                              />
                            </div>
                          </div>
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => addEntry(cs.id)}
                              className="nuru-btn-primary text-xs flex items-center gap-1"
                            >
                              <Plus size={12} /> Add to Call Sheet
                            </button>
                            <button
                              onClick={() => setAddingEntry(null)}
                              className="nuru-btn-ghost text-xs border border-gray-200"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Entries Table */}
                      {cs.entries && cs.entries.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="border-b border-gray-200">
                                {['Name', 'Role', 'Call Time', 'Makeup', 'On Set', 'Status', ''].map(h => (
                                  <th key={h} className="text-left py-2 px-2 font-heading font-semibold text-nuru-maroon text-[10px] uppercase">
                                    {h}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {cs.entries.map(entry => (
                                <tr key={entry.id} className="border-b border-gray-50 hover:bg-nuru-lgray">
                                  <td className="py-2 px-2 font-heading font-semibold text-nuru-dgray">
                                    {entry.contact?.name}
                                  </td>
                                  <td className="py-2 px-2 text-gray-500">{entry.contact?.role}</td>
                                  <td className="py-2 px-2 font-bold text-nuru-maroon">{entry.callTime}</td>
                                  <td className="py-2 px-2 text-gray-500">{entry.makeupTime || '—'}</td>
                                  <td className="py-2 px-2 text-gray-500">{entry.onSetTime || '—'}</td>
                                  <td className="py-2 px-2">
                                    <span className={cn('nuru-badge text-[9px]',
                                      entry.deliveryStatus === 'opened'    ? 'bg-green-100 text-green-600' :
                                      entry.deliveryStatus === 'delivered' ? 'bg-blue-100 text-blue-600' :
                                      entry.deliveryStatus === 'sent'      ? 'bg-gray-100 text-gray-500' :
                                      entry.deliveryStatus === 'bounced'   ? 'bg-red-100 text-red-500' :
                                      'bg-gray-100 text-gray-400')}>
                                      {entry.deliveryStatus || 'pending'}
                                    </span>
                                  </td>
                                  <td className="py-2 px-2">
                                    <button
                                      onClick={async () => {
                                        await fetch(`/api/callsheets/${cs.id}/entries`, {
                                          method:  'DELETE',
                                          headers: { 'Content-Type': 'application/json' },
                                          body:    JSON.stringify({ entryId: entry.id }),
                                        })
                                        fetchCallSheets(selectedProject || undefined)
                                      }}
                                      className="text-gray-300 hover:text-red-400"
                                    >
                                      <X size={12} />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-6 text-gray-400 text-xs font-body">
                          No cast or crew added yet. Click "+ Add Person" to add call times.
                        </div>
                      )}

                      {/* Send reminder */}
                      {cs.status === 'DRAFT' && cs.entries && cs.entries.length > 0 && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
                          <p className="text-blue-700 text-xs font-body">
                            Ready to send to {cs.entries.filter(e => e.contact?.email).length} recipients with email addresses.
                          </p>
                          <button
                            onClick={() => sendCallSheet(cs.id)}
                            disabled={sending === cs.id}
                            className="nuru-btn-primary text-xs flex items-center gap-1 py-1.5 px-3"
                          >
                            {sending === cs.id ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                            Send Now
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── CREATE CONTACT MODAL ──────────────────────────────────────────── */}
      {showCreateContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="font-heading font-bold text-nuru-maroon text-lg">Add Contact</h2>
              <button onClick={() => setShowCreateContact(false)} className="p-2 rounded-lg hover:bg-nuru-lgray">
                <X size={18} className="text-gray-400" />
              </button>
            </div>
            <form onSubmit={createContact} className="p-6 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="nuru-label">Full Name *</label>
                  <input value={contactForm.name} onChange={e => setContactForm(p => ({ ...p, name: e.target.value }))}
                    className="nuru-input" placeholder="Grace Kanyiri" required />
                </div>
                <div>
                  <label className="nuru-label">Role *</label>
                  <input value={contactForm.role} onChange={e => setContactForm(p => ({ ...p, role: e.target.value }))}
                    className="nuru-input" placeholder="Lead Actor" required />
                </div>
                <div>
                  <label className="nuru-label">Department</label>
                  <input value={contactForm.department} onChange={e => setContactForm(p => ({ ...p, department: e.target.value }))}
                    className="nuru-input" placeholder="Cast" />
                </div>
                <div>
                  <label className="nuru-label">Email</label>
                  <input type="email" value={contactForm.email} onChange={e => setContactForm(p => ({ ...p, email: e.target.value }))}
                    className="nuru-input" placeholder="grace@email.com" />
                </div>
                <div>
                  <label className="nuru-label">Phone</label>
                  <input value={contactForm.phone} onChange={e => setContactForm(p => ({ ...p, phone: e.target.value }))}
                    className="nuru-input" placeholder="+254 700 000 000" />
                </div>
                <div>
                  <label className="nuru-label">WhatsApp</label>
                  <input value={contactForm.whatsapp} onChange={e => setContactForm(p => ({ ...p, whatsapp: e.target.value }))}
                    className="nuru-input" placeholder="+254 700 000 000" />
                </div>
                <div>
                  <label className="nuru-label">Day Rate (KES)</label>
                  <input type="number" value={contactForm.dayRate} onChange={e => setContactForm(p => ({ ...p, dayRate: e.target.value }))}
                    className="nuru-input" placeholder="5000" min="0" />
                </div>
                <div>
                  <label className="nuru-label">Dietary Requirements</label>
                  <input value={contactForm.dietary} onChange={e => setContactForm(p => ({ ...p, dietary: e.target.value }))}
                    className="nuru-input" placeholder="Vegetarian, Halal..." />
                </div>
                <div className="col-span-2">
                  <label className="nuru-label">Transport Needs</label>
                  <input value={contactForm.transport} onChange={e => setContactForm(p => ({ ...p, transport: e.target.value }))}
                    className="nuru-input" placeholder="Own transport, needs pickup from town..." />
                </div>
                <div className="col-span-2">
                  <label className="nuru-label">Notes</label>
                  <textarea value={contactForm.notes} onChange={e => setContactForm(p => ({ ...p, notes: e.target.value }))}
                    className="nuru-input resize-none" rows={2} placeholder="Any additional notes..." />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreateContact(false)}
                  className="flex-1 nuru-btn-ghost border border-gray-200">Cancel</button>
                <button type="submit" disabled={savingContact}
                  className="flex-1 nuru-btn-primary flex items-center justify-center gap-2">
                  {savingContact ? <><Loader2 size={14} className="animate-spin" />Saving...</> : 'Add Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── CREATE CALL SHEET MODAL ───────────────────────────────────────── */}
      {showCreateCallSheet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="font-heading font-bold text-nuru-maroon text-lg">New Call Sheet</h2>
              <button onClick={() => setShowCreateCallSheet(false)} className="p-2 rounded-lg hover:bg-nuru-lgray">
                <X size={18} className="text-gray-400" />
              </button>
            </div>
            <form onSubmit={createCallSheet} className="p-6 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="nuru-label">Project *</label>
                  <select value={callSheetForm.projectId}
                    onChange={e => setCallSheetForm(p => ({ ...p, projectId: e.target.value }))}
                    className="nuru-input" required>
                    <option value="">Select project...</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="nuru-label">Shoot Day #</label>
                  <input type="number" value={callSheetForm.dayNumber}
                    onChange={e => setCallSheetForm(p => ({ ...p, dayNumber: e.target.value }))}
                    className="nuru-input" min="1" />
                </div>
                <div>
                  <label className="nuru-label">Date *</label>
                  <input type="date" value={callSheetForm.date}
                    onChange={e => setCallSheetForm(p => ({ ...p, date: e.target.value }))}
                    className="nuru-input" required />
                </div>
                <div>
                  <label className="nuru-label">General Call Time *</label>
                  <input type="time" value={callSheetForm.generalCallTime}
                    onChange={e => setCallSheetForm(p => ({ ...p, generalCallTime: e.target.value }))}
                    className="nuru-input" required />
                </div>
                <div>
                  <label className="nuru-label">Location *</label>
                  <input value={callSheetForm.location}
                    onChange={e => setCallSheetForm(p => ({ ...p, location: e.target.value }))}
                    className="nuru-input" placeholder="MUT University Chapel" required />
                </div>
                <div>
                  <label className="nuru-label">Nearest Hospital</label>
                  <input value={callSheetForm.nearestHospital}
                    onChange={e => setCallSheetForm(p => ({ ...p, nearestHospital: e.target.value }))}
                    className="nuru-input" placeholder="Murang'a Level 5 Hospital" />
                </div>
                <div>
                  <label className="nuru-label">Parking</label>
                  <input value={callSheetForm.parking}
                    onChange={e => setCallSheetForm(p => ({ ...p, parking: e.target.value }))}
                    className="nuru-input" placeholder="Main gate parking available" />
                </div>
                <div className="col-span-2">
                  <label className="nuru-label">Advance Schedule (Tomorrow's scenes)</label>
                  <textarea value={callSheetForm.advanceSchedule}
                    onChange={e => setCallSheetForm(p => ({ ...p, advanceSchedule: e.target.value }))}
                    className="nuru-input resize-none" rows={2}
                    placeholder="Tomorrow: INT. CHURCH HALL - DAY (Scenes 5, 6, 7)" />
                </div>

                {/* Prayer Focus */}
                <div className="col-span-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-heading font-semibold text-nuru-maroon text-xs flex items-center gap-1">
                      🙏 Prayer Focus
                    </p>
                    <button
                      type="button"
                      onClick={generatePrayerFocus}
                      disabled={generatingPrayer}
                      className="flex items-center gap-1 text-[10px] text-nuru-orange font-heading font-semibold hover:underline"
                    >
                      {generatingPrayer
                        ? <><Loader2 size={10} className="animate-spin" /> Generating...</>
                        : <><Sparkles size={10} /> Generate AI Prayer Focus</>}
                    </button>
                  </div>
                  {prayerFocus ? (
                    <div>
                      <p className="text-nuru-blue text-xs italic">"{prayerFocus.scripture}"</p>
                      <p className="text-nuru-maroon text-[10px] font-semibold mt-0.5">— {prayerFocus.reference}</p>
                      <p className="text-gray-600 text-xs mt-1">{prayerFocus.prayer}</p>
                      <button type="button" onClick={() => setPrayerFocus(null)}
                        className="text-[10px] text-gray-400 hover:text-red-400 mt-1">
                        Remove
                      </button>
                    </div>
                  ) : (
                    <p className="text-gray-400 text-xs font-body">
                      Click "Generate AI Prayer Focus" to add a scripture and prayer for today's shoot.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreateCallSheet(false)}
                  className="flex-1 nuru-btn-ghost border border-gray-200">Cancel</button>
                <button type="submit" disabled={savingCallSheet}
                  className="flex-1 nuru-btn-primary flex items-center justify-center gap-2">
                  {savingCallSheet
                    ? <><Loader2 size={14} className="animate-spin" />Creating...</>
                    : 'Create Call Sheet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}