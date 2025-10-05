'use client'

import { useState, useEffect, useRef } from 'react'
import { Sparkles, GripVertical, Loader2 } from 'lucide-react'
import { Node, Edge } from 'reactflow'

interface InstrumentRecommendation {
  instrument_id: string
  instrument_name: string
  culture: string
  genre: string
  type: string
  reason: string
}

interface RecommendationsProps {
  nodes: Node[]
  edges: Edge[]
}

export function Recommendations({ nodes, edges }: RecommendationsProps) {
  const [recommendations, setRecommendations] = useState<InstrumentRecommendation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Only generate recommendations if there are nodes in the graph
    if (nodes.length === 0) {
      setRecommendations([])
      return
    }

    // Debounce API calls - wait 1.5 seconds after last graph change
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    debounceTimer.current = setTimeout(() => {
      fetchRecommendations()
    }, 1500)

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [nodes, edges])

  const fetchRecommendations = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('http://localhost:8000/api/v1/recommendations/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nodes: nodes.map(n => ({
            id: n.id,
            data: n.data,
            position: n.position
          })),
          edges: edges.map(e => ({
            id: e.id,
            source: e.source,
            target: e.target,
            label: e.label
          }))
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch recommendations: ${response.status}`)
      }

      const data = await response.json()
      setRecommendations(data.recommendations || [])
    } catch (err) {
      console.error('Error fetching recommendations:', err)
      setError(err instanceof Error ? err.message : 'Failed to load recommendations')
    } finally {
      setIsLoading(false)
    }
  }

  const onDragStart = (event: React.DragEvent, instrument: InstrumentRecommendation) => {
    event.dataTransfer.setData('application/reactflow', instrument.type)
    event.dataTransfer.setData('instrument-name', instrument.instrument_name)
    event.dataTransfer.effectAllowed = 'move'
  }

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'drum': return 'bg-red-500'
      case 'bassline': return 'bg-purple-600'
      case 'melody': return 'bg-blue-500'
      case 'synth': return 'bg-cyan-500'
      case 'vocal': return 'bg-green-500'
      case 'fx': return 'bg-orange-500'
      case 'chord': return 'bg-indigo-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="bg-slate-900/50 rounded-lg border border-slate-800 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-violet-400" />
        <h3 className="text-sm font-semibold text-white">Culturally-Aware Recommendations</h3>
      </div>

      {nodes.length === 0 ? (
        <p className="text-xs text-slate-500 italic">
          Add some elements to your graph to get culturally-aware suggestions
        </p>
      ) : isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />
          <span className="ml-2 text-xs text-slate-400">Analyzing your composition...</span>
        </div>
      ) : error ? (
        <p className="text-xs text-red-400 italic">
          {error}
        </p>
      ) : recommendations.length === 0 ? (
        <p className="text-xs text-slate-500 italic">
          Add genre nodes to get culturally-specific recommendations
        </p>
      ) : (
        <>
          <p className="text-xs text-slate-400 mb-3">
            Drag these instruments to your canvas
          </p>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {recommendations.map((rec) => (
              <div
                key={rec.instrument_id}
                draggable
                onDragStart={(e) => onDragStart(e, rec)}
                className="group flex items-center gap-2 p-2.5 bg-slate-950/50 border border-slate-700 rounded-md hover:border-violet-500 hover:bg-slate-900/70 transition-colors cursor-move"
              >
                <GripVertical className="w-4 h-4 text-slate-600 group-hover:text-violet-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-slate-200">{rec.instrument_name}</p>
                    <span className={`px-1.5 py-0.5 text-xs rounded ${getNodeColor(rec.type)} text-white flex-shrink-0`}>
                      {rec.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs text-violet-400 font-medium">{rec.culture}</span>
                    <span className="text-xs text-slate-600">•</span>
                    <span className="text-xs text-slate-500 truncate">{rec.genre}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    💡 {rec.reason}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="mt-3 p-2 bg-violet-900/20 border border-violet-800/30 rounded text-xs text-violet-300">
        💡 <strong>Tip:</strong> Mix cultures! Hip-Hop + Afrobeat djembe = 🔥
      </div>
    </div>
  )
}
