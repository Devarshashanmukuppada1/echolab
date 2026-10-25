'use client'

import { useState, useCallback } from 'react'

interface TTSServiceResult {
  audioUrl: string
  durationMs: number
}

interface UseTTSOptions {
  onPlay?: () => void
  onError?: (err: Error) => void
}

export function useTTS() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [lastResult, setLastResult] = useState<TTSServiceResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const generate = useCallback(async (text: string): Promise<TTSServiceResult | null> => {
    if (!text.trim()) return null
    setIsGenerating(true)
    setError(null)

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })

      const data = await res.json().catch(() => null) as TTSServiceResult | null

      if (!res.ok || !data?.audioUrl) {
        throw new Error('TTS generation failed')
      }

      setIsGenerating(false)
      setLastResult(data)
      return data
    } catch (err) {
      setIsGenerating(false)
      setError((err as Error).message)
      return null
    }
  }, [])

  return { isGenerating, lastResult, error, generate }
}
