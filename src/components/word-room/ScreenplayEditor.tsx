'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import {
  ArrowLeft, Save, Sparkles, BookOpen, Globe,
  Loader2, Check, AlertCircle, History, Lock, Unlock
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Script } from '@/types'
import AIAssistantPanel from './AIAssistantPanel'
import BiblicalAnalysisPanel from './BiblicalAnalysisPanel'

interface ScreenplayEditorProps {
  script: Script
  onBack: () => void
  onUpdate: (script: Script) => void
}

// Extract plain text from TipTap JSON content
function extractText(content: any): string {
  if (!content) return ''
  if (typeof content === 'string') return content
  if (content.text) return content.text
  if (content.content && Array.isArray(content.content)) {
    return content.content.map(extractText).join('\n')
  }
  return ''
}

// Convert script content to TipTap-compatible format
function normalizeContent(content: any): any {
  if (!content) return { type: 'doc', content: [{ type: 'paragraph', content: [] }] }

  // Already valid TipTap doc
  if (content.type === 'doc') return content

  // Plain string
  if (typeof content === 'string') {
    const paragraphs = content.split('\n').filter(Boolean).map(line => ({
      type: 'paragraph',
      content: [{ type: 'text', text: line }],
    }))
    return { type: 'doc', content: paragraphs.length > 0 ? paragraphs : [{ type: 'paragraph', content: [] }] }
  }

  // Has content array but wrong type
  if (content.content && Array.isArray(content.content)) {
    return { type: 'doc', content: content.content }
  }

  return { type: 'doc', content: [{ type: 'paragraph', content: [] }] }
}

export default function ScreenplayEditor({ script, onBack, onUpdate }: ScreenplayEditorProps) {
  const [saving, setSaving]             = useState(false)
  const [saveStatus, setSaveStatus]     = useState<'saved' | 'unsaved' | 'saving' | 'error'>('saved')
  const [showAI, setShowAI]             = useState(false)
  const [showBiblical, setShowBiblical] = useState(false)
  const [analyzing, setAnalyzing]       = useState(false)
  const [biblicalResult, setBiblicalResult] = useState<any>(null)
  const [culturalResult, setCulturalResult] = useState<any>(null)
  const [showCultural, setShowCultural] = useState(false)
  const [error, setError]               = useState('')
  const saveTimer = useRef<NodeJS.Timeout>()
  const lastSavedContent = useRef<string>('')

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Highlight.configure({ multicolor: true }),
      Placeholder.configure({
        placeholder: 'Start writing your screenplay...\n\nINT. LOCATION — DAY\n\nAction lines go here.',
      }),
      CharacterCount,
    ],
    content: normalizeContent(script.content),
    onUpdate: ({ editor }) => {
      const json = JSON.stringify(editor.getJSON())
      if (json !== lastSavedContent.current) {
        setSaveStatus('unsaved')
        clearTimeout(saveTimer.current)
        saveTimer.current = setTimeout(() => {
          autoSave(editor.getJSON())
        }, 2500)
      }
    },
  })

  useEffect(() => {
    // Set initial saved content reference
    lastSavedContent.current = JSON.stringify(normalizeContent(script.content))
    return () => clearTimeout(saveTimer.current)
  }, [])

  const autoSave = useCallback(async (content: any) => {
    setSaving(true)
    setSaveStatus('saving')
    try {
      const res = await fetch(`/api/scripts/${script.id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ content }),
      })
      if (!res.ok) throw new Error('Save failed')
      const data = await res.json()
      if (data.data) onUpdate(data.data)
      lastSavedContent.current = JSON.stringify(content)
      setSaveStatus('saved')
      setError('')
    } catch (err: any) {
      setSaveStatus('error')
      setError('Auto-save failed. Click Save to retry.')
    } finally {
      setSaving(false)
    }
  }, [script.id, onUpdate])

  async function manualSave() {
    if (!editor) return
    clearTimeout(saveTimer.current)
    await autoSave(editor.getJSON())
  }

  async function saveVersion() {
    if (!editor) return
    try {
      await fetch(`/api/scripts/${script.id}/versions`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          content: editor.getJSON(),
          notes:   `Version saved ${new Date().toLocaleString()}`,
        }),
      })
      setSaveStatus('saved')
    } catch { setError('Failed to save version') }
  }

  async function analyzeBiblical() {
    if (!editor) return
    setAnalyzing(true)
    setShowBiblical(true)
    setBiblicalResult(null)
    try {
      const text = editor.getText()
      const res  = await fetch('/api/ai/biblical-analyzer', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ scriptText: text, scriptTitle: script.title }),
      })
      const data = await res.json()
      setBiblicalResult(data.analysis)
    } catch { setError('Biblical analysis failed') }
    finally { setAnalyzing(false) }
  }

  async function analyzeCultural() {
    if (!editor) return
    setAnalyzing(true)
    setShowCultural(true)
    try {
      const text = editor.getText()
      const res  = await fetch('/api/ai/cultural-checker', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ scriptText: text }),
      })
      const data = await res.json()
      setCulturalResult(data.analysis)
    } catch { setError('Cultural check failed') }
    finally { setAnalyzing(false) }
  }

  const wordCount = editor?.storage.characterCount.words() || 0
  const charCount = editor?.storage.characterCount.characters() || 0

  const SaveIcon = saveStatus === 'saved'  ? Check :
                   saveStatus === 'error'  ? AlertCircle :
                   saveStatus === 'saving' ? Loader2 : Save

  const saveColor = saveStatus === 'saved'  ? 'text-green-500' :
                    saveStatus === 'error'  ? 'text-red-500' :
                    saveStatus === 'saving' ? 'text-nuru-orange' : 'text-gray-400'

  const saveLabel = saveStatus === 'saved'  ? 'Saved' :
                    saveStatus === 'error'  ? 'Save Error' :
                    saveStatus === 'saving' ? 'Saving...' : 'Unsaved'

  return (
    <div className="flex h-full -m-6 overflow-hidden">
      {/* ── Editor Area ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Toolbar */}
        <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-2 flex-wrap flex-shrink-0">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-gray-500 hover:text-nuru-maroon transition-colors text-sm font-body mr-2"
          >
            <ArrowLeft size={16} /> Scripts
          </button>
          <div className="w-px h-5 bg-gray-200" />

          {/* Title & Stats */}
          <div className="flex-1 min-w-0">
            <h2 className="font-heading font-bold text-nuru-dgray text-sm truncate">{script.title}</h2>
            <p className="text-gray-400 text-[10px]">
              {wordCount.toLocaleString()} words · {charCount.toLocaleString()} chars · v{script.version}
            </p>
          </div>

          {/* Save Status */}
          <div className={cn('flex items-center gap-1 text-xs flex-shrink-0', saveColor)}>
            <SaveIcon size={12} className={saveStatus === 'saving' ? 'animate-spin' : ''} />
            <span className="font-body">{saveLabel}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={manualSave}
              disabled={saving}
              className="nuru-btn-ghost flex items-center gap-1.5 text-xs py-1.5 px-3"
            >
              <Save size={13} /> Save
            </button>
            <button
              onClick={saveVersion}
              className="nuru-btn-ghost flex items-center gap-1.5 text-xs py-1.5 px-3"
              title="Save a named version"
            >
              <History size={13} /> Version
            </button>
            <button
              onClick={analyzeBiblical}
              disabled={analyzing}
              className="nuru-btn-ghost flex items-center gap-1.5 text-xs py-1.5 px-3 text-nuru-maroon"
            >
              <BookOpen size={13} /> Biblical
            </button>
            <button
              onClick={analyzeCultural}
              disabled={analyzing}
              className="nuru-btn-ghost flex items-center gap-1.5 text-xs py-1.5 px-3 text-nuru-blue"
            >
              <Globe size={13} /> Cultural
            </button>
            <button
              onClick={() => setShowAI(!showAI)}
              className={cn(
                'flex items-center gap-1.5 text-xs py-1.5 px-3 rounded-md font-heading font-semibold transition-all',
                showAI ? 'bg-nuru-orange text-white' : 'nuru-btn-ghost text-nuru-orange'
              )}
            >
              <Sparkles size={13} /> AI
            </button>
          </div>
        </div>

        {/* Format Bar */}
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-1.5 flex items-center gap-1 overflow-x-auto flex-shrink-0">
          <span className="text-[10px] text-gray-400 font-heading font-semibold uppercase tracking-wide mr-2 flex-shrink-0">
            Format:
          </span>
          {[
            { label: 'Scene Heading', action: () => editor?.chain().focus().setParagraph().run() },
            { label: 'Action',        action: () => editor?.chain().focus().setParagraph().run() },
            { label: 'Character',     action: () => editor?.chain().focus().setParagraph().run() },
            { label: 'Dialogue',      action: () => editor?.chain().focus().setParagraph().run() },
          ].map(fmt => (
            <button
              key={fmt.label}
              onClick={fmt.action}
              className="flex-shrink-0 px-2 py-0.5 rounded text-[10px] font-heading font-semibold
                         bg-white border border-gray-200 text-gray-600 hover:border-nuru-orange
                         hover:text-nuru-orange transition-colors"
            >
              {fmt.label}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-1 flex-shrink-0">
            {editor && (
              <>
                <button
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  className={cn('px-2 py-0.5 rounded text-[10px] font-bold border',
                    editor.isActive('bold')
                      ? 'bg-nuru-maroon text-white border-nuru-maroon'
                      : 'bg-white border-gray-200 text-gray-600')}
                >B</button>
                <button
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  className={cn('px-2 py-0.5 rounded text-[10px] italic border',
                    editor.isActive('italic')
                      ? 'bg-nuru-maroon text-white border-nuru-maroon'
                      : 'bg-white border-gray-200 text-gray-600')}
                >I</button>
                <button
                  onClick={() => editor.chain().focus().toggleUnderline().run()}
                  className={cn('px-2 py-0.5 rounded text-[10px] underline border',
                    editor.isActive('underline')
                      ? 'bg-nuru-maroon text-white border-nuru-maroon'
                      : 'bg-white border-gray-200 text-gray-600')}
                >U</button>
              </>
            )}
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border-b border-red-200 px-4 py-2 flex items-center gap-2 flex-shrink-0">
            <AlertCircle size={14} className="text-red-500" />
            <p className="text-red-700 text-xs flex-1">{error}</p>
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">
              ×
            </button>
          </div>
        )}

        {/* Editor Content */}
        <div className="flex-1 overflow-y-auto bg-gray-100">
          <div className="max-w-3xl mx-auto my-8 bg-white shadow-sm rounded-sm min-h-screen">
            <div className="screenplay-editor p-12 md:p-16">
              <EditorContent editor={editor} />
            </div>
          </div>
        </div>
      </div>

      {/* ── AI Assistant Panel ───────────────────────────────────────────── */}
      {showAI && (
        <AIAssistantPanel
          scriptTitle={script.title}
          getScriptText={() => editor?.getText() || ''}
          onClose={() => setShowAI(false)}
          onInsert={(text) => {
            if (editor) {
              editor.chain().focus().insertContent(text).run()
            }
          }}
        />
      )}

      {/* ── Biblical Analysis Panel ──────────────────────────────────────── */}
      {showBiblical && (
        <BiblicalAnalysisPanel
          result={biblicalResult}
          analyzing={analyzing}
          onClose={() => setShowBiblical(false)}
        />
      )}

      {/* ── Cultural Analysis Panel ──────────────────────────────────────── */}
      {showCultural && culturalResult && (
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col flex-shrink-0 shadow-xl overflow-y-auto">
          <div className="bg-nuru-blue px-4 py-3 flex items-center justify-between sticky top-0">
            <div className="flex items-center gap-2">
              <Globe size={16} className="text-nuru-orange" />
              <h3 className="font-heading font-bold text-white text-sm">Cultural Check</h3>
            </div>
            <button onClick={() => setShowCultural(false)} className="text-white text-opacity-60 hover:text-white">
              ×
            </button>
          </div>
          <div className="p-4 space-y-3">
            <div className="nuru-card bg-nuru-blue bg-opacity-5">
              <p className="font-heading font-bold text-nuru-blue text-xs mb-1">Authenticity Score</p>
              <p className="font-heading font-black text-nuru-blue text-2xl">
                {culturalResult.authenticityScore}/10
              </p>
            </div>
            {culturalResult.strengths?.length > 0 && (
              <div className="nuru-card">
                <p className="font-heading font-bold text-green-600 text-xs mb-2">✓ Strengths</p>
                {culturalResult.strengths.map((s: string, i: number) => (
                  <p key={i} className="text-xs text-gray-600 font-body mb-1">• {s}</p>
                ))}
              </div>
            )}
            {culturalResult.issues?.length > 0 && (
              <div className="nuru-card">
                <p className="font-heading font-bold text-red-500 text-xs mb-2">⚠ Issues</p>
                {culturalResult.issues.map((issue: any, i: number) => (
                  <div key={i} className="mb-2 border-l-2 border-red-300 pl-2">
                    <p className="text-xs text-gray-700 font-body italic">"{issue.line}"</p>
                    <p className="text-xs text-red-600 mt-0.5">{issue.issue}</p>
                    <p className="text-xs text-green-600 mt-0.5">→ {issue.suggestion}</p>
                  </div>
                ))}
              </div>
            )}
            {culturalResult.recommendations?.length > 0 && (
              <div className="nuru-card">
                <p className="font-heading font-bold text-nuru-dgray text-xs mb-2">Recommendations</p>
                {culturalResult.recommendations.map((r: string, i: number) => (
                  <p key={i} className="text-xs text-gray-600 font-body mb-1">→ {r}</p>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}