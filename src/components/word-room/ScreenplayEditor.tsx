'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import {
  ArrowLeft, Save, Lock, Unlock, History, Sparkles,
  BookOpen, Globe, Loader2, ChevronDown, Eye
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

const SCRIPT_FORMATS = [
  { label: 'Scene Heading', shortcut: 'INT./EXT.', style: 'scene-heading' },
  { label: 'Action',        shortcut: 'Action',    style: 'action' },
  { label: 'Character',     shortcut: 'Character', style: 'character' },
  { label: 'Dialogue',      shortcut: 'Dialogue',  style: 'dialogue' },
  { label: 'Parenthetical', shortcut: '(beat)',    style: 'parenthetical' },
  { label: 'Transition',    shortcut: 'CUT TO:',   style: 'transition' },
]

export default function ScreenplayEditor({ script, onBack, onUpdate }: ScreenplayEditorProps) {
  const [saving, setSaving]               = useState(false)
  const [saved, setSaved]                 = useState(true)
  const [showAI, setShowAI]               = useState(false)
  const [showBiblical, setShowBiblical]   = useState(false)
  const [showCultural, setShowCultural]   = useState(false)
  const [analyzing, setAnalyzing]         = useState(false)
  const [biblicalResult, setBiblicalResult] = useState<any>(null)
  const [culturalResult, setCulturalResult] = useState<any>(null)
  const saveTimer = useRef<NodeJS.Timeout>()

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Highlight.configure({ multicolor: true }),
      Placeholder.configure({
        placeholder: 'Start writing your screenplay... (INT. LOCATION - DAY)',
      }),
      CharacterCount,
    ],
    content: script.content || '',
    onUpdate: ({ editor }) => {
      setSaved(false)
      clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => {
        autoSave(editor.getJSON())
      }, 2000)
    },
  })

  useEffect(() => {
    return () => clearTimeout(saveTimer.current)
  }, [])

  const autoSave = useCallback(async (content: any) => {
    setSaving(true)
    try {
      const res = await fetch(`/api/scripts/${script.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      const data = await res.json()
      if (data.data) onUpdate(data.data)
      setSaved(true)
    } catch (err) {
      console.error('Auto-save failed:', err)
    } finally {
      setSaving(false)
    }
  }, [script.id, onUpdate])

  async function manualSave() {
    if (!editor) return
    await autoSave(editor.getJSON())
  }

  async function analyzeBiblical() {
    if (!editor) return
    setAnalyzing(true)
    setShowBiblical(true)
    try {
      const text = editor.getText()
      const res = await fetch('/api/ai/biblical-analyzer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scriptText: text, scriptTitle: script.title }),
      })
      const data = await res.json()
      setBiblicalResult(data.analysis)
    } catch (err) {
      console.error('Biblical analysis failed:', err)
    } finally {
      setAnalyzing(false)
    }
  }

  async function analyzeCultural() {
    if (!editor) return
    setAnalyzing(true)
    try {
      const text = editor.getText()
      const res = await fetch('/api/ai/cultural-checker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scriptText: text }),
      })
      const data = await res.json()
      setCulturalResult(data.analysis)
      setShowCultural(true)
    } catch (err) {
      console.error('Cultural check failed:', err)
    } finally {
      setAnalyzing(false)
    }
  }

  const wordCount = editor?.storage.characterCount.words() || 0
  const charCount = editor?.storage.characterCount.characters() || 0

  return (
    <div className="flex h-full -m-6">
      {/* Editor Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-2 flex-wrap">
          {/* Back */}
          <button onClick={onBack} className="flex items-center gap-1.5 text-gray-500 hover:text-nuru-maroon transition-colors text-sm font-body mr-2">
            <ArrowLeft size={16} /> Scripts
          </button>
          <div className="w-px h-5 bg-gray-200" />

          {/* Script Title */}
          <div className="flex-1 min-w-0">
            <h2 className="font-heading font-bold text-nuru-dgray text-sm truncate">{script.title}</h2>
            <p className="text-gray-400 text-[10px]">
              {wordCount.toLocaleString()} words · {charCount.toLocaleString()} characters
            </p>
          </div>

          {/* Save Status */}
          <div className="flex items-center gap-1 text-xs">
            {saving ? (
              <><Loader2 size={12} className="animate-spin text-nuru-orange" /><span className="text-gray-400">Saving...</span></>
            ) : saved ? (
              <span className="text-green-500 font-body">✓ Saved</span>
            ) : (
              <span className="text-gray-400 font-body">Unsaved changes</span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button onClick={manualSave} className="nuru-btn-ghost flex items-center gap-1.5 text-xs py-1.5 px-3">
              <Save size={13} /> Save
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
              <Sparkles size={13} /> AI Assistant
            </button>
          </div>
        </div>

        {/* Format Bar */}
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-1.5 flex items-center gap-1 overflow-x-auto">
          <span className="text-[10px] text-gray-400 font-heading font-semibold uppercase tracking-wide mr-2 flex-shrink-0">Format:</span>
          {SCRIPT_FORMATS.map(fmt => (
            <button
              key={fmt.style}
              onClick={() => {
                if (!editor) return
                editor.chain().focus().setParagraph().run()
              }}
              className="flex-shrink-0 px-2 py-0.5 rounded text-[10px] font-heading font-semibold
                         bg-white border border-gray-200 text-gray-600 hover:border-nuru-orange
                         hover:text-nuru-orange transition-colors"
            >
              {fmt.label}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2 flex-shrink-0">
            {editor && (
              <>
                <button
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  className={cn('px-2 py-0.5 rounded text-[10px] font-bold border',
                    editor.isActive('bold') ? 'bg-nuru-maroon text-white border-nuru-maroon' : 'bg-white border-gray-200 text-gray-600')}
                >B</button>
                <button
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  className={cn('px-2 py-0.5 rounded text-[10px] italic border',
                    editor.isActive('italic') ? 'bg-nuru-maroon text-white border-nuru-maroon' : 'bg-white border-gray-200 text-gray-600')}
                >I</button>
                <button
                  onClick={() => editor.chain().focus().toggleUnderline().run()}
                  className={cn('px-2 py-0.5 rounded text-[10px] underline border',
                    editor.isActive('underline') ? 'bg-nuru-maroon text-white border-nuru-maroon' : 'bg-white border-gray-200 text-gray-600')}
                >U</button>
              </>
            )}
          </div>
        </div>

        {/* Editor Content */}
        <div className="flex-1 overflow-y-auto bg-gray-100">
          <div className="max-w-3xl mx-auto my-8 bg-white shadow-sm rounded-sm min-h-screen">
            <div className="screenplay-editor p-16">
              <EditorContent editor={editor} />
            </div>
          </div>
        </div>
      </div>

      {/* AI Assistant Panel */}
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

      {/* Biblical Analysis Panel */}
      {showBiblical && (
        <BiblicalAnalysisPanel
          result={biblicalResult}
          analyzing={analyzing}
          onClose={() => setShowBiblical(false)}
        />
      )}
    </div>
  )
}