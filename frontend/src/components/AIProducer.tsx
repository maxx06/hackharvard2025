"use client"

import { useState, useRef, useEffect } from 'react'
import { Volume2, VolumeX, Loader2, Sparkles } from 'lucide-react'
import { Node, Edge } from 'reactflow'

interface AIProducerProps {
  nodes: Node[]
  edges: Edge[]
  minNodesForTrigger?: number
  changeContext?: string | null
}

export function AIProducer({
  nodes,
  edges,
  minNodesForTrigger = 2,
  changeContext = null
}: AIProducerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [feedbackText, setFeedbackText] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const lastGraphStateRef = useRef<string>('')
  const triggerTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const currentContextRef = useRef<string | null>(null)

  // Update context when it changes
  useEffect(() => {
    if (changeContext) {
      console.log('AIProducer received context:', changeContext)
      currentContextRef.current = changeContext
    }
  }, [changeContext])

  // Real-time trigger: whenever nodes or edges change
  useEffect(() => {
    // Create a snapshot of the current graph state
    const currentGraphState = JSON.stringify({
      nodeCount: nodes.length,
      edgeCount: edges.length,
      nodeIds: nodes.map(n => n.id).sort(),
      edgeIds: edges.map(e => e.id).sort()
    })

    console.log(`[AIProducer] Graph changed: ${nodes.length} nodes, ${edges.length} edges`)

    // Only trigger if graph actually changed and we have enough nodes
    if (currentGraphState !== lastGraphStateRef.current && nodes.length >= minNodesForTrigger) {
      lastGraphStateRef.current = currentGraphState
      console.log('[AIProducer] Graph state changed, scheduling analysis...')

      // Clear any existing timeout
      if (triggerTimeoutRef.current) {
        clearTimeout(triggerTimeoutRef.current)
      }

      // Wait 2 seconds after last graph change to give feedback
      // This prevents spam if user is making rapid changes
      triggerTimeoutRef.current = setTimeout(() => {
        if (!isAnalyzing) {
          // Use the current context if available
          const contextToUse = currentContextRef.current
          console.log('[AIProducer] Triggering analysis with context:', contextToUse)
          handleAnalyze(contextToUse || undefined)
          // Clear context after using it
          currentContextRef.current = null
        } else {
          console.log('[AIProducer] Skipping - already analyzing')
        }
      }, 2000)
    } else if (nodes.length < minNodesForTrigger) {
      console.log(`[AIProducer] Not enough nodes (${nodes.length} < ${minNodesForTrigger})`)
      lastGraphStateRef.current = currentGraphState
    } else {
      console.log('[AIProducer] Graph state unchanged, skipping')
    }

    return () => {
      if (triggerTimeoutRef.current) {
        clearTimeout(triggerTimeoutRef.current)
      }
    }
  }, [nodes, edges, minNodesForTrigger, isAnalyzing])

  const handleAnalyze = async (context?: string) => {
    if (isAnalyzing) return

    setIsAnalyzing(true)
    setError(null)
    setFeedbackText(null)

    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }

    try {
      const requestData = {
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
        })),
        context: context || null
      }

      console.log('Sending producer request with context:', context)
      console.log('Request data:', requestData)

      const response = await fetch('http://localhost:8000/api/v1/producer/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Producer API error:', response.status, errorText)
        let errorDetail = errorText
        try {
          const errorJson = JSON.parse(errorText)
          errorDetail = errorJson.detail || errorText
        } catch (e) {
          // Keep errorText as is
        }
        throw new Error(`Failed to get producer feedback: ${errorDetail}`)
      }

      // Get feedback text from header
      const feedbackFromHeader = response.headers.get('X-Feedback-Text')
      if (feedbackFromHeader) {
        setFeedbackText(feedbackFromHeader)
      }

      // Get audio blob
      const blob = await response.blob()
      console.log('Received audio blob:', blob.size, 'bytes, type:', blob.type)

      if (blob.size === 0) {
        console.warn('Received empty audio, showing text feedback only')
        setError('Audio generation failed - showing text feedback only')
        return
      }

      // Verify we have valid audio data
      if (blob.size < 100) {
        console.warn('Audio file too small, likely invalid. Showing text feedback only')
        setError('Audio too small - showing text feedback only')
        return
      }

      const audioUrl = URL.createObjectURL(blob)

      // Create and play audio
      const audio = new Audio(audioUrl)
      audioRef.current = audio

      audio.onplay = () => {
        console.log('Audio playback started')
        setIsPlaying(true)
        setError(null) // Clear any previous errors since playback is working
      }

      audio.onended = () => {
        console.log('Audio playback ended')
        setIsPlaying(false)
        URL.revokeObjectURL(audioUrl)
      }

      audio.onerror = (e) => {
        console.error('Audio error event:', e)
        console.error('Audio error details:', audio.error)
        setIsPlaying(false)
        setError(`Audio playback error: ${audio.error?.message || 'Unknown error'}`)
      }

      audio.onloadedmetadata = () => {
        console.log('Audio metadata loaded, duration:', audio.duration)
      }

      audio.oncanplaythrough = () => {
        console.log('Audio can play through without buffering')
      }

      // Load the audio first
      audio.load()

      // Auto-play the feedback after a small delay to ensure it's loaded
      console.log('Attempting to play audio...')
      setTimeout(() => {
        audio.play().catch(err => {
          console.error('Audio play() rejected:', err)
          if (!isPlaying) { // Only show error if playback didn't start
            setError('Click play button to hear feedback (browser blocked auto-play)')
          }
        })
      }, 100)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get producer feedback')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const togglePlayback = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const hasContent = feedbackText || isPlaying || isAnalyzing

  return (
    <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 backdrop-blur-sm border border-blue-500/30 rounded-lg p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center ${isAnalyzing || isPlaying ? 'animate-pulse' : ''}`}>
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-white">AI Producer</h3>
          <p className="text-xs text-blue-300">
            {isAnalyzing ? 'Listening and analyzing...' : isPlaying ? 'Speaking...' : 'Listening for changes'}
          </p>
        </div>
        {isAnalyzing && (
          <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
        )}
      </div>

      {/* Feedback Display */}
      {hasContent && (
        <div className="space-y-2">
          {feedbackText && (
            <div className="bg-black/20 rounded-md p-3 border border-blue-500/20">
              <p className="text-sm text-blue-100 italic">"{feedbackText}"</p>
            </div>
          )}

          {/* Audio Controls */}
          {audioRef.current && (
            <div className="flex items-center gap-2">
              <button
                onClick={togglePlayback}
                className="p-2 bg-blue-600/50 hover:bg-blue-600 rounded-md transition-colors"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <VolumeX className="w-4 h-4 text-white" />
                ) : (
                  <Volume2 className="w-4 h-4 text-white" />
                )}
              </button>
              <div className="flex-1 h-1 bg-blue-900/50 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r from-blue-500 to-blue-600 ${isPlaying ? 'animate-pulse' : ''}`}
                  style={{ width: isPlaying ? '100%' : '0%' }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/30 border border-red-500/50 rounded-md p-2">
          <p className="text-xs text-red-200">{error}</p>
        </div>
      )}

      {/* Hint when no nodes */}
      {nodes.length === 0 && !isAnalyzing && (
        <p className="text-xs text-blue-300/60 italic">
          Add some musical elements to get producer feedback
        </p>
      )}
    </div>
  )
}
