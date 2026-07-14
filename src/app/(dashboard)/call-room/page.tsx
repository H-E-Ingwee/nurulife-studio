'use client'

import { useState, useEffect } from 'react'
import { Plus, Phone, Users, FileText, Loader2, Search, Send, Sparkles, Mail, Clock } from 'lucide-react'
import { cn, formatDate, formatCurrency } from '@/lib/utils'
import type { Contact, CallSheet, Project, PrayerFocus } from '@/types'

const TABS = [
  { id: 'contacts',   label: 'Contacts',    icon: Users },
  { id: 'callsheets', label: 'Call Sheets', icon: FileText },
]

export default function CallRoomPage() {
  const [activeTab, setActiveTab]   = useState('contacts')
  const [contacts, setContacts]     = useState<Contact[]>([])
  const [callSheets, setCallSheets] = useState<CallSheet[]>([])
  const [projects, setProjects]     = useState<Project[]>([])
  const [loading, setLoading]       = useState(false)
  const [search, setSearch]         = useState('')
  const [showCreateContact, setShowCreateContact] = useState(false)
  const [showCreateCallSheet, setShowCreateCallSheet] = useState(false)
  const [selectedProject, setSelectedProject] = useState('')
  const [prayerFocus, setPrayerFocus] = useState<PrayerFocus | null>(null)
  const [generatingPrayer, setGeneratingPrayer] = useState(false)
  const [contactForm, setContactForm] = useState({
    name: '', role: '', department: '', email: '', phone: '',
    whatsapp: '', dayRate: '', dietary: '', transport: '', notes: '',
  })
  const [callSheetForm, setCallSheetForm] = useState({
    projectId: '', dayNumber: '1', date: '', generalCallTime: '06:00',
    location: '', nearestHospital: '', parking: '', advanceSchedule: '',
  })
  const [sending, setSending] = useState<string | null>(null)

  useEffect(() => {
    fetchContacts()
    fetchProjects()
  }, [])

  useEffect(() => {
    if (selectedProject) fetchCallSheets(selectedProject)
  }, [selectedProject])

  async function fetchContacts() {
    setLoading(true)
    try {
      const res = await fetch('/api/contacts')
      const data = await res.json()
      setContacts(data.data || [])
    } finally { setLoading(false) }
  }

  async function fetchProjects() {
    const res = await fetch('/api/projects')
    const data = await res.json()
    setProjects(data.data || [])
  }

  async function fetchCallSheets(projectId: string) {
    setLoading(true)
    try {
      const res = await fetch(`/api/callsheets?projectId=${projectId}`)
      const data = await res.json()
      setCallSheets(data.data || [])
    } finally { setLoading(false) }
  }

  async function createContact(e: React.FormEvent) {
    e.preventDefault()
    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...contactForm, dayRate: contactForm.dayRate ? parseFloat(contactForm.dayRate) : undefined }),
      })
      if (res.ok) { setShowCreateContact(false); fetchContacts(); setContactForm({ name:'',role:'',department:'',email:'',phone:'',whatsapp:'',dayRate:'',dietary:'',transport:'',notes:'' }) }
    } catch (err) { console.error(err) }
  }

  async function generatePrayerFocus(scenes: string) {
    setGeneratingPrayer(true)
    try {
      const res = await fetch('/api/ai/prayer-focus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenesDescription: scenes }),
      })
      const data = await res.json()
      setPrayerFocus(data.prayerFocus)
    } finally { setGeneratingPrayer(false) }
  }

  async function createCallSheet(e: React.FormEvent) {
    e.preventDefault()
    try {
      const res = await fetch('/api/callsheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...callSheetForm, dayNumber: parseInt(callSheetForm.dayNumber), prayerFocus }),
      })
      if (res.ok) { setShowCreateCallSheet(false); if (selectedProject) fetchCallSheets(selectedProject) }
    } catch (err) { console.error(err) }
  }

  async function sendCallSheet(callSheetId: string) {
    setSending(callSheetId)
    try {
      await fetch(`/api/callsheets/${callSheetId}/send`, { method: 'POST' })
      if (selectedProject) fetchCallSheets(selectedProject)
    } finally { setSending(null) }
  }

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.role.toLowerCase().includes(search.toLowerCase()) ||
    (c.department || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading font-black text-nuru-maroon text-2xl">Call Room</h1>
          <p className="text-gray-500 text-sm font-body mt-0.5">Contacts, call sheets & crew communication</p>
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

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-white rounded-lg p-1 shadow-sm border border-gray-100 w-fit">
        {TABS.map(tab => {
          const Icon = tab.icon
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={cn('flex items-center gap-2 px-4 py-2 rounded-md text-sm font-heading font-semibold transition-all',
                activeTab === tab.id ? 'bg-nuru-maroon text-white' : 'text-gray-500 hover:text-nuru-dgray hover:bg-nuru-lgray')}>
              <Icon size={14} />{tab.label}
            </button>
          )
        })}
      </div>

      {/* CONTACTS TAB */}
      {activeTab === 'contacts' && (
        <div>
          <div className="relative mb-4">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search contacts by name, role, department..."
              className="nuru-input pl-9 max-w-sm" />
          </div>

          {loading ? (
            <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-nuru-orange" /></div>
          ) : (
            <div className="nuru-card overflow-hidden p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-nuru-maroon">
                    {['Name','Role','Department','Email','Phone','Day Rate','Actions'].map(h => (
                      <th key={h} className="text-left py-3 px-4 font-heading font-bold text-nuru-maroon text-xs uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredContacts.map((contact, i) => (
                    <tr key={contact.id} className={cn('border-b border-gray-50 hover:bg-nuru-lgray transition-colors', i % 2 === 0 ? 'bg-white' : 'bg-gray-50')}>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-nuru-maroon flex items-center justify-center text-white text-[10px] font-heading font-bold flex-shrink-0">
                            {contact.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
                          </div>
                          <span className="font-heading font-semibold text-nuru-dgray text-sm">{contact.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-sm">{contact.role}</td>
                      <td className="py-3 px-4 text-gray-500 text-xs">{contact.department || '—'}</td>
                      <td className="py-3 px-4 text-gray-500 text-xs">{contact.email || '—'}</td>
                      <td className="py-3 px-4 text-gray-500 text-xs">{contact.phone || '—'}</td>
                      <td className="py-3 px-4 text-gray-500 text-xs">
                        {contact.dayRate ? formatCurrency(contact.dayRate) : '—'}
                      </td>
                      <td className="py-3 px-4">
                        <button onClick={async () => {
                          if (confirm(`Delete ${contact.name}?`)) {
                            await fetch(`/api/contacts/${contact.id}`, { method: 'DELETE' })
                            fetchContacts()
                          }
                        }} className="text-red-400 hover:text-red-600 text-xs font-body">Delete</button>
                      </td>
                    </tr>
                  ))}
                  {filteredContacts.length === 0 && (
                    <tr><td colSpan={7} className="py-12 text-center text-gray-400 text-sm font-body">
                      {search ? 'No contacts match your search.' : 'No contacts yet. Add your first cast or crew member.'}
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* CALL SHEETS TAB */}
      {activeTab === 'callsheets' && (
        <div>
          <div className="mb-4 max-w-xs">
            <label className="nuru-label">Filter by Project</label>
            <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)} className="nuru-input">
              <option value="">All projects</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </div>

          {loading ? (
            <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-nuru-orange" /></div>
          ) : (
            <div className="space-y-4">
              {callSheets.map(cs => (
                <div key={cs.id} className="nuru-card">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn('nuru-badge text-[10px]',
                          cs.status === 'SENT' ? 'bg-green-100 text-green-600' :
                          cs.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-600' :
                          'bg-gray-100 text-gray-500')}>
                          {cs.status}
                        </span>
                        <span className="text-gray-400 text-xs">Day {cs.dayNumber}</span>
                      </div>
                      <h3 className="font-heading font-bold text-nuru-dgray text-sm">{formatDate(cs.date)}</h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Clock size={11} /> {cs.generalCallTime}</span>
                        <span>{cs.location}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {cs.status === 'DRAFT' && (
                        <button onClick={() => sendCallSheet(cs.id)} disabled={sending === cs.id}
                          className="nuru-btn-primary flex items-center gap-1.5 text-xs py-1.5 px-3">
                          {sending === cs.id ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                          Send
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Prayer Focus */}
                  {cs.prayerFocus && (
                    <div className="mt-3 p-3 bg-orange-50 border-l-4 border-nuru-orange rounded-r-lg">
                      <p className="text-[10px] font-heading font-bold text-nuru-orange uppercase tracking-wide mb-1">🙏 Prayer Focus</p>
                      <p className="text-nuru-blue text-xs italic">"{(cs.prayerFocus as PrayerFocus).scripture}"</p>
                      <p className="text-nuru-maroon text-[10px] font-semibold mt-0.5">— {(cs.prayerFocus as PrayerFocus).reference}</p>
                    </div>
                  )}

                  {/* Entries */}
                  {cs.entries && cs.entries.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-[10px] font-heading font-semibold text-gray-400 uppercase mb-2">
                        {cs.entries.length} Recipients
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {cs.entries.map(entry => (
                          <div key={entry.id} className="flex items-center gap-1 bg-gray-50 rounded px-2 py-1">
                            <span className="text-[10px] font-heading font-semibold text-nuru-dgray">{entry.contact?.name}</span>
                            <span className="text-[10px] text-nuru-orange font-bold">{entry.callTime}</span>
                            {entry.deliveryStatus && (
                              <span className={cn('text-[9px]',
                                entry.deliveryStatus === 'opened' ? 'text-green-500' :
                                entry.deliveryStatus === 'delivered' ? 'text-blue-500' : 'text-gray-400')}>
                                ● {entry.deliveryStatus}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {callSheets.length === 0 && (
                <div className="nuru-card text-center py-12">
                  <FileText size={40} className="text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm font-body">No call sheets yet. Create your first one.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* CREATE CONTACT MODAL */}
      {showCreateContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="font-heading font-bold text-nuru-maroon text-lg">Add Contact</h2>
              <button onClick={() => setShowCreateContact(false)} className="p-2 rounded-lg hover:bg-nuru-lgray">
                <Plus size={18} className="text-gray-400 rotate-45" />
              </button>
            </div>
            <form onSubmit={createContact} className="p-6 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="nuru-label">Full Name *</label>
                  <input value={contactForm.name} onChange={e => setContactForm(p => ({...p, name: e.target.value}))}
                    className="nuru-input" placeholder="Grace Kanyiri" required />
                </div>
                <div>
                  <label className="nuru-label">Role *</label>
                  <input value={contactForm.role} onChange={e => setContactForm(p => ({...p, role: e.target.value}))}
                    className="nuru-input" placeholder="Lead Actor" required />
                </div>
                <div>
                  <label className="nuru-label">Department</label>
                  <input value={contactForm.department} onChange={e => setContactForm(p => ({...p, department: e.target.value}))}
                    className="nuru-input" placeholder="Cast" />
                </div>
                <div>
                  <label className="nuru-label">Email</label>
                  <input type="email" value={contactForm.email} onChange={e => setContactForm(p => ({...p, email: e.target.value}))}
                    className="nuru-input" placeholder="grace@email.com" />
                </div>
                <div>
                  <label className="nuru-label">Phone</label>
                  <input value={contactForm.phone} onChange={e => setContactForm(p => ({...p, phone: e.target.value}))}
                    className="nuru-input" placeholder="+254 700 000 000" />
                </div>
                <div>
                  <label className="nuru-label">WhatsApp</label>
                  <input value={contactForm.whatsapp} onChange={e => setContactForm(p => ({...p, whatsapp: e.target.value}))}
                    className="nuru-input" placeholder="+254 700 000 000" />
                </div>
                <div>
                  <label className="nuru-label">Day Rate (KES)</label>
                  <input type="number" value={contactForm.dayRate} onChange={e => setContactForm(p => ({...p, dayRate: e.target.value}))}
                    className="nuru-input" placeholder="5000" />
                </div>
                <div>
                  <label className="nuru-label">Dietary Requirements</label>
                  <input value={contactForm.dietary} onChange={e => setContactForm(p => ({...p, dietary: e.target.value}))}
                    className="nuru-input" placeholder="Vegetarian, Halal, etc." />
                </div>
                <div className="col-span-2">
                  <label className="nuru-label">Transport Needs</label>
                  <input value={contactForm.transport} onChange={e => setContactForm(p => ({...p, transport: e.target.value}))}
                    className="nuru-input" placeholder="Own transport, needs pickup, etc." />
                </div>
                <div className="col-span-2">
                  <label className="nuru-label">Notes</label>
                  <textarea value={contactForm.notes} onChange={e => setContactForm(p => ({...p, notes: e.target.value}))}
                    className="nuru-input resize-none" rows={2} placeholder="Any additional notes..." />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreateContact(false)} className="flex-1 nuru-btn-ghost border border-gray-200">Cancel</button>
                <button type="submit" className="flex-1 nuru-btn-primary">Add Contact</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE CALL SHEET MODAL */}
      {showCreateCallSheet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="font-heading font-bold text-nuru-maroon text-lg">New Call Sheet</h2>
              <button onClick={() => setShowCreateCallSheet(false)} className="p-2 rounded-lg hover:bg-nuru-lgray">
                <Plus size={18} className="text-gray-400 rotate-45" />
              </button>
            </div>
            <form onSubmit={createCallSheet} className="p-6 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="nuru-label">Project *</label>
                  <select value={callSheetForm.projectId} onChange={e => setCallSheetForm(p => ({...p, projectId: e.target.value}))}
                    className="nuru-input" required>
                    <option value="">Select project...</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="nuru-label">Shoot Day #</label>
                  <input type="number" value={callSheetForm.dayNumber} onChange={e => setCallSheetForm(p => ({...p, dayNumber: e.target.value}))}
                    className="nuru-input" min="1" />
                </div>
                <div>
                  <label className="nuru-label">Date *</label>
                  <input type="date" value={callSheetForm.date} onChange={e => setCallSheetForm(p => ({...p, date: e.target.value}))}
                    className="nuru-input" required />
                </div>
                <div>
                  <label className="nuru-label">General Call Time *</label>
                  <input type="time" value={callSheetForm.generalCallTime} onChange={e => setCallSheetForm(p => ({...p, generalCallTime: e.target.value}))}
                    className="nuru-input" required />
                </div>
                <div>
                  <label className="nuru-label">Location *</label>
                  <input value={callSheetForm.location} onChange={e => setCallSheetForm(p => ({...p, location: e.target.value}))}
                    className="nuru-input" placeholder="MUT Campus, Murang'a" required />
                </div>
                <div>
                  <label className="nuru-label">Nearest Hospital</label>
                  <input value={callSheetForm.nearestHospital} onChange={e => setCallSheetForm(p => ({...p, nearestHospital: e.target.value}))}
                    className="nuru-input" placeholder="Murang'a Level 5 Hospital" />
                </div>
                <div>
                  <label className="nuru-label">Parking</label>
                  <input value={callSheetForm.parking} onChange={e => setCallSheetForm(p => ({...p, parking: e.target.value}))}
                    className="nuru-input" placeholder="Main gate parking available" />
                </div>
                <div className="col-span-2">
                  <label className="nuru-label">Advance Schedule</label>
                  <textarea value={callSheetForm.advanceSchedule} onChange={e => setCallSheetForm(p => ({...p, advanceSchedule: e.target.value}))}
                    className="nuru-input resize-none" rows={2} placeholder="Tomorrow: INT. CHURCH HALL - DAY (Scenes 5, 6, 7)" />
                </div>

                {/* Prayer Focus Generator */}
                <div className="col-span-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-heading font-semibold text-nuru-maroon text-xs">🙏 Prayer Focus</p>
                    <button type="button" onClick={() => generatePrayerFocus(callSheetForm.advanceSchedule || 'general production day')}
                      disabled={generatingPrayer}
                      className="flex items-center gap-1 text-[10px] text-nuru-orange font-heading font-semibold hover:underline">
                      {generatingPrayer ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
                      Generate AI Prayer Focus
                    </button>
                  </div>
                  {prayerFocus ? (
                    <div>
                      <p className="text-nuru-blue text-xs italic">"{prayerFocus.scripture}"</p>
                      <p className="text-nuru-maroon text-[10px] font-semibold mt-0.5">— {prayerFocus.reference}</p>
                      <p className="text-gray-600 text-xs mt-1">{prayerFocus.prayer}</p>
                    </div>
                  ) : (
                    <p className="text-gray-400 text-xs">Click "Generate AI Prayer Focus" to add a scripture and prayer for today's shoot.</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreateCallSheet(false)} className="flex-1 nuru-btn-ghost border border-gray-200">Cancel</button>
                <button type="submit" className="flex-1 nuru-btn-primary">Create Call Sheet</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}