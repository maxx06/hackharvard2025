"use client"

import { useState } from 'react'
import { Music, Loader2 } from 'lucide-react'

export function MusicGenerator() {
  const [prompt, setPrompt] = useState('')
  const [duration, setDuration] = useState(10000)
  const [isGenerating, setIsGenerating] = useState(false)
  const [audioURL, setAudioURL] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt')
      return
    }

    setIsGenerating(true)
    setError(null)
    setAudioURL(null)

    try {
      const response = await fetch('http://localhost:8000/api/v1/music/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          duration_ms: duration,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to generate music')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      setAudioURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate music')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6 space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium mb-2">
            Music Description
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., hiphop style, quick tempo, drums, guitar"
            className="w-full p-3 border rounded-lg min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isGenerating}
          />
        </div>

        <div>
          <label htmlFor="duration" className="block text-sm font-medium mb-2">
            Duration: {duration / 1000}s
          </label>
          <input
            id="duration"
            type="range"
            min="1000"
            max="60000"
            step="1000"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full"
            disabled={isGenerating}
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Music className="w-5 h-5" />
              Generate Music
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {audioURL && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-green-600">Music generated successfully!</p>
          <audio src={audioURL} controls className="w-full" />
        </div>
      )}
    </div>
  )
}
