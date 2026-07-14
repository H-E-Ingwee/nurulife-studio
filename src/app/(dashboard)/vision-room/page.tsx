'use client'

import { useState, useEffect } from 'react'
import { Plus, Eye, Image, List, Film, Loader2, Sparkles, Upload, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Project, MoodBoard, ShotList, Storyboard } from '@/types'

const TABS = [
  { id: 'moodboards',  label: 'Mood Boards',  icon: Image },
  { id: 'shotlists',   label: 'Shot Lists',   icon: List },
  { id: 'storyboards', label: 'Storyboards',  icon: Film },
]

const STORYBOARD_STYLES = [
  { value: 'cinematic',    label: 'Cinematic' },
  { value: 'sketch',       label: 'Sketch' },
  { value: 'contemporary', label: 'Contemporary Nairobi' },
  { value: 'traditional',  label: 'Traditional Kenya' },
  { value: 'afrofuturist', label: 'Afrofuturist' },
]

const SHOT_SIZES = ['ECU','CU','MCU','MS','MLS','LS','ELS']
const SHOT_ANGLES = ['Eye Level','Low Angle','High Angle','Dutch','Overhead','POV']
const SHOT_MOVEMENTS = ['Static','Pan','Tilt','Dolly','Handheld','Crane','Steadicam','Zoom']

export default function VisionRoomPage() {
  const [activeTab, setActiveTab]   = useState('moodboards')
  const [projects, setProjects]     = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState('')
  const [moodBoards, setMoodBoards] = useState<MoodBoard[]>([])
  const [shotLists, setShotLists]   = useState<ShotList[]>([])
  const [storyboards, setStoryboards] = useState<Storyboard[]>([])
  const [loading, setLoading]       = useState(false)
  const [generating, setGenerating] = useState(false)
  const [aiPrompt, setAiPrompt]     = useState('')
  const [aiStyle, setAiStyle]       = useState('cinematic')
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [showAiGenerator, setShowAiGenerator] = useState(false)

  useEffect(() => { fetchProjects() }, [])
  useEffect(() => { if (selectedProject) fetchVisionData(selectedProject) }, [selectedProject, activeTab])

  async function fetchProjects() {
    const res = await fetch('/api/projects')
    const data = await res.json()
    setProjects(data.data || [])
  }

  async function fetchVisionData(projectId: string) {
    setLoading(true)
    try {
      if (activeTab === 'moodboards') {
        const res = await fetch(`/api/vision/moodboards?projectId=${projectId}`)
        const data = await res.json()
        setMoodBoards(data.data || [])
      } else if (activeTab === 'shotlists') {
        const res = await fetch(`/api/vision/shotlists?projectId=${projectId}`)
        const data = await res.json()
        setShotLists(data.data || [])
      } else if (activeTab === 'storyboards') {
        const res = await fetch(`/api/vision/storyboards?projectId=${projectId}`)
        const data = await res.json()
        setStoryboards(data.data || [])
      }
    } finally { setLoading(false) }
  }

  async function generateStoryboardPanel() {
    if (!aiPrompt.trim()) return
    setGenerating(true)
    try {
      const res = await fetch('/api/ai/storyboard-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sceneDescription: aiPrompt, style: aiStyle }),
      })
      const data = await res.json()
      if (data.imageUrl) setGeneratedImages(prev => [data.imageUrl, ...prev])
    } catch (err) {
      console.error('Generation failed:', err)
    } finally { setGenerating(false) }
  }

  async function generateShotList() {
    if (!aiPrompt.trim() || !selectedProject) return
    setGenerating(true)
    try {
      const res = await fetch('/api/ai/shot-list-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sceneDescription: aiPrompt, projectId: selectedProject }),
      })
      const data = await res.json()
      if (data.shotList) {
        await fetch('/api/vision/shotlists', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectId: selectedProject, title: `AI Shot List — ${new Date().toLocaleDateString()}`, shots: data.shotList.shots }),
        })
        fetchVisionData(selectedProject)
        setShowAiGenerator(false)
      }
    } finally { setGenerating(false) }
  }

  async function createMoodBoard() {
    const title = prompt('Mood board title:')
    if (!title || !selectedProject) return
    const res = await fetch('/api/vision/moodboards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId: selectedProject, title }),
    })
    const data = await res.json()
    if (data.data) setMoodBoards(prev => [...prev, data.data])
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading font-black text-nuru-maroon text-2xl">Vision Room</h1>
          <p className="text-gray-500 text-sm font-body mt-0.5">Mood boards, shot lists & storyboards</p>
        </div>
        <button onClick={() => setShowAiGenerator(!showAiGenerator)}
          className="nuru-btn-secondary flex items-center gap-2">
          <Sparkles size={16} /> AI Generator
        </button>
      </div>

      {/* AI Generator Panel */}
      {showAiGenerator && (
        <div className="nuru-card border-l-4 border-nuru-orange mb-6 animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-heading font-bold text-nuru-maroon text-sm flex items-center gap-2">
              <Sparkles size={14} className="text-nuru-orange" /> AI Vision Generator
            </h3>
            <button onClick={() => setShowAiGenerator(false)}><X size={16} className="text-gray-400" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <div className="md:col-span-2">
              <label className="nuru-label">Scene Description</label>
              <textarea value={aiPrompt} onChange={e => setAiPrompt(e.target.value)}
                className="nuru-input resize-none" rows={2}
                placeholder="e.g. A young woman prays alone in a dimly lit Nairobi church at night, tears on her face, moonlight through stained glass..." />
            </div>
            <div>
              <label className="nuru-label">Visual Style</label>
              <select value={aiStyle} onChange={e => setAiStyle(e.target.value)} className="nuru-input mb-2">
                {STORYBOARD_STYLES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              <div className="flex gap-2">
                <button onClick={generateStoryboardPanel} disabled={generating || !aiPrompt.trim()}
                  className="flex-1 nuru-btn-primary text-xs flex items-center justify-center gap-1">
                  {generating ? <Loader2 size={12} className="animate-spin" /> : <Image size={12} />}
                  Storyboard
                </button>
                <button onClick={generateShotList} disabled={generating || !aiPrompt.trim() || !selectedProject}
                  className="flex-1 nuru-btn-outline text-xs flex items-center justify-center gap-1">
                  {generating ? <Loader2 size={12} className="animate-spin" /> : <List size={12} />}
                  Shot List
                </button>
              </div>
            </div>
          </div>
          {generatedImages.length > 0 && (
            <div>
              <p className="nuru-label mb-2">Generated Panels</p>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {generatedImages.map((url, i) => (
                  <div key={i} className="flex-shrink-0 w-48 h-32 rounded-lg overflow-hidden border border-gray-200">
                    <img src={url} alt={`Panel ${i+1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Project Selector */}
      <div className="nuru-card mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 max-w-xs">
            <label className="nuru-label">Project</label>
            <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)} className="nuru-input">
              <option value="">Select project...</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </div>
          {selectedProject && (
            <div className="flex items-end">
              {activeTab === 'moodboards' && (
                <button onClick={createMoodBoard} className="nuru-btn-primary flex items-center gap-2">
                  <Plus size={14} /> New Mood Board
                </button>
              )}
              {activeTab === 'shotlists' && (
                <button onClick={async () => {
                  const title = prompt('Shot list title:')
                  if (!title) return
                  const res = await fetch('/api/vision/shotlists', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ projectId: selectedProject, title }),
                  })
                  const data = await res.json()
                  if (data.data) setShotLists(prev => [...prev, data.data])
                }} className="nuru-btn-primary flex items-center gap-2">
                  <Plus size={14} /> New Shot List
                </button>
              )}
              {activeTab === 'storyboards' && (
                <button onClick={async () => {
                  const title = prompt('Storyboard title:')
                  if (!title) return
                  const res = await fetch('/api/vision/storyboards', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ projectId: selectedProject, title }),
                  })
                  const data = await res.json()
                  if (data.data) setStoryboards(prev => [...prev, data.data])
                }} className="nuru-btn-primary flex items-center gap-2">
                  <Plus size={14} /> New Storyboard
                </button>
              )}
            </div>
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

      {loading && <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-nuru-orange" /></div>}

      {/* Mood Boards */}
      {activeTab === 'moodboards' && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {moodBoards.map(board => (
            <div key={board.id} className="nuru-card-hover">
              <div className="h-32 bg-gradient-to-br from-nuru-blue to-nuru-maroon rounded-lg mb-3 overflow-hidden flex items-center justify-center">
                {board.items && board.items.length > 0 ? (
                  <div className="grid grid-cols-2 gap-0.5 w-full h-full">
                    {board.items.slice(0, 4).map(item => (
                      <img key={item.id} src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                    ))}
                  </div>
                ) : (
                  <Image size={32} className="text-white text-opacity-30" />
                )}
              </div>
              <h3 className="font-heading font-bold text-nuru-dgray text-sm">{board.title}</h3>
              {board.group && <p className="text-gray-400 text-xs">{board.group}</p>}
              <p className="text-gray-400 text-xs mt-1">{board.items?.length || 0} images</p>
            </div>
          ))}
          {moodBoards.length === 0 && selectedProject && (
            <div className="col-span-3 nuru-card text-center py-12">
              <Image size={40} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No mood boards yet. Create your first one.</p>
            </div>
          )}
        </div>
      )}

      {/* Shot Lists */}
      {activeTab === 'shotlists' && !loading && (
        <div className="space-y-4">
          {shotLists.map(list => (
            <div key={list.id} className="nuru-card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-heading font-bold text-nuru-dgray text-sm">{list.title}</h3>
                <span className="text-gray-400 text-xs">{list.shots?.length || 0} shots</span>
              </div>
              {list.shots && list.shots.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-100">
                        {['#','Description','Size','Angle','Lens','Movement','Notes'].map(h => (
                          <th key={h} className="text-left py-1.5 px-2 font-heading font-semibold text-nuru-maroon text-[10px] uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {list.shots.map(shot => (
                        <tr key={shot.id} className="border-b border-gray-50 hover:bg-nuru-lgray">
                          <td className="py-1.5 px-2 font-heading font-bold text-nuru-maroon">{shot.shotNumber}</td>
                          <td className="py-1.5 px-2 text-nuru-dgray max-w-xs truncate">{shot.description}</td>
                          <td className="py-1.5 px-2 text-gray-500">{shot.shotSize || '—'}</td>
                          <td className="py-1.5 px-2 text-gray-500">{shot.angle || '—'}</td>
                          <td className="py-1.5 px-2 text-gray-500">{shot.lens || '—'}</td>
                          <td className="py-1.5 px-2 text-gray-500">{shot.movement || '—'}</td>
                          <td className="py-1.5 px-2 text-gray-400 max-w-xs truncate">{shot.notes || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
          {shotLists.length === 0 && selectedProject && (
            <div className="nuru-card text-center py-12">
              <List size={40} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No shot lists yet. Create one or use the AI generator.</p>
            </div>
          )}
        </div>
      )}

      {/* Storyboards */}
      {activeTab === 'storyboards' && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {storyboards.map(board => (
            <div key={board.id} className="nuru-card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-heading font-bold text-nuru-dgray text-sm">{board.title}</h3>
                <span className="nuru-badge bg-gray-100 text-gray-500 text-[10px]">{board.aspectRatio}</span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {board.panels?.map(panel => (
                  <div key={panel.id} className="flex-shrink-0 w-32 h-20 rounded border border-gray-200 overflow-hidden bg-gray-100">
                    {panel.imageUrl ? (
                      <img src={panel.imageUrl} alt={`Panel ${panel.panelNumber}`} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Film size={16} className="text-gray-300" />
                      </div>
                    )}
                  </div>
                ))}
                {(!board.panels || board.panels.length === 0) && (
                  <p className="text-gray-400 text-xs py-4">No panels yet</p>
                )}
              </div>
              <p className="text-gray-400 text-xs">{board.panels?.length || 0} panels</p>
            </div>
          ))}
          {storyboards.length === 0 && selectedProject && (
            <div className="col-span-2 nuru-card text-center py-12">
              <Film size={40} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No storyboards yet. Create one or use the AI generator.</p>
            </div>
          )}
        </div>
      )}

      {!selectedProject && (
        <div className="nuru-card text-center py-16">
          <Eye size={48} className="text-gray-200 mx-auto mb-4" />
          <h3 className="font-heading font-bold text-gray-400 text-lg mb-2">Select a Project</h3>
          <p className="text-gray-400 text-sm font-body">Choose a project to view mood boards, shot lists, and storyboards</p>
        </div>
      )}
    </div>
  )
}