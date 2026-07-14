'use client'

import { X, BookOpen, Loader2, Star, AlertCircle, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BiblicalAnalysis } from '@/types'

interface BiblicalAnalysisPanelProps {
  result: BiblicalAnalysis | null
  analyzing: boolean
  onClose: () => void
}

export default function BiblicalAnalysisPanel({ result, analyzing, onClose }: BiblicalAnalysisPanelProps) {
  return (
    <div className="w-96 bg-white border-l border-gray-200 flex flex-col flex-shrink-0 shadow-xl overflow-y-auto">
      {/* Header */}
      <div className="bg-nuru-maroon px-4 py-3 flex items-center justify-between flex-shrink-0 sticky top-0">
        <div className="flex items-center gap-2">
          <BookOpen size={16} className="text-nuru-orange" />
          <div>
            <h3 className="font-heading font-bold text-white text-sm">Biblical Analysis</h3>
            <p className="text-white text-opacity-50 text-[10px]">Faith depth · Redemption arcs · Scripture</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-white hover:bg-opacity-10">
          <X size={16} className="text-white text-opacity-60" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {analyzing && (
          <div className="text-center py-8">
            <Loader2 size={32} className="animate-spin text-nuru-orange mx-auto mb-3" />
            <p className="text-gray-500 text-sm font-body">Analyzing biblical themes...</p>
            <p className="text-gray-400 text-xs mt-1">This may take a moment</p>
          </div>
        )}

        {!analyzing && !result && (
          <div className="text-center py-8">
            <BookOpen size={32} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm font-body">Analysis will appear here</p>
          </div>
        )}

        {result && !analyzing && (
          <>
            {/* Faith Depth Score */}
            <div className="nuru-card bg-nuru-maroon bg-opacity-5 border border-nuru-maroon border-opacity-20">
              <div className="flex items-center justify-between mb-2">
                <span className="font-heading font-bold text-nuru-maroon text-sm">Faith Depth Score</span>
                <div className="flex items-center gap-1">
                  {[...Array(10)].map((_, i) => (
                    <Star
                      key={i}
                      size={10}
                      className={i < result.faithDepthScore ? 'text-nuru-orange fill-nuru-orange' : 'text-gray-200'}
                    />
                  ))}
                </div>
              </div>
              <p className="text-nuru-maroon font-heading font-black text-2xl">{result.faithDepthScore}/10</p>
            </div>

            {/* Redemption Arc */}
            <div className="nuru-card">
              <h4 className="font-heading font-bold text-nuru-dgray text-xs uppercase tracking-wide mb-2">
                Redemption Arc
              </h4>
              <div className="flex items-center gap-2 mb-2">
                {result.redemptionArc.present ? (
                  <CheckCircle size={14} className="text-green-500" />
                ) : (
                  <AlertCircle size={14} className="text-red-400" />
                )}
                <span className={cn('text-xs font-heading font-semibold capitalize',
                  result.redemptionArc.present ? 'text-green-600' : 'text-red-500')}>
                  {result.redemptionArc.present ? `Present — ${result.redemptionArc.strength}` : 'Not detected'}
                </span>
              </div>
              {result.redemptionArc.suggestion && (
                <p className="text-gray-500 text-xs font-body italic border-l-2 border-nuru-orange pl-2">
                  {result.redemptionArc.suggestion}
                </p>
              )}
            </div>

            {/* Biblical Themes */}
            {result.biblicalThemes.length > 0 && (
              <div className="nuru-card">
                <h4 className="font-heading font-bold text-nuru-dgray text-xs uppercase tracking-wide mb-2">
                  Biblical Themes
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {result.biblicalThemes.map(theme => (
                    <span key={theme} className="nuru-badge bg-blue-50 text-blue-600 text-[10px]">{theme}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Scripture Parallels */}
            {result.scriptureParallels.length > 0 && (
              <div className="nuru-card">
                <h4 className="font-heading font-bold text-nuru-dgray text-xs uppercase tracking-wide mb-2">
                  Scripture Parallels
                </h4>
                <div className="space-y-2">
                  {result.scriptureParallels.map((p, i) => (
                    <div key={i} className="border-l-2 border-nuru-orange pl-2">
                      <p className="text-nuru-maroon font-heading font-semibold text-xs">{p.reference}</p>
                      <p className="text-gray-400 text-[10px]">{p.scene} — {p.relevance}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {result.recommendations.length > 0 && (
              <div className="nuru-card">
                <h4 className="font-heading font-bold text-nuru-dgray text-xs uppercase tracking-wide mb-2">
                  Recommendations
                </h4>
                <ul className="space-y-1.5">
                  {result.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-gray-600 font-body">
                      <span className="text-nuru-orange mt-0.5 flex-shrink-0">→</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Overall Assessment */}
            {result.overallAssessment && (
              <div className="nuru-card bg-nuru-blue bg-opacity-5 border border-nuru-blue border-opacity-20">
                <h4 className="font-heading font-bold text-nuru-blue text-xs uppercase tracking-wide mb-2">
                  Overall Assessment
                </h4>
                <p className="text-gray-600 text-xs font-body leading-relaxed">{result.overallAssessment}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}