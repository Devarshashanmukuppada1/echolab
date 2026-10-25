'use client'

import { useState, useCallback } from 'react'

export interface CloneResult {
  audioUrl: string
  durationMs: number
}

interface UseVoiceCloneOptions {
  onProgress?: (pct: number) => void
  onError?: (err: Error) => void
}

export function useVoiceClone() {
  const [cloning, setCloning] = useState(false)
  const [lastResult, setLastResult] = useState<CloneResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const cloneVoice = useCallback(async (formData: FormData): Promise<CloneResult | null> => {
    setCloning(true)
    setError(null)

    try {
      const res = await fetch('/api/clone', { method: 'POST', body: formData })
      if (!res.ok) {
        throw new Error(`Clone failed: ${res.status}`)
      }
      const data = await res.json().catch(() => null) as CloneResult | null
      setCloning(false)
      if (!data?.audioUrl) throw new Error('No audioUrl in response')
      setLastResult(data)
      return data
    } catch (err) {
      setCloning(false)
      setError((err as Error).message)
      return null
    }
  }, [])

  return { cloning, lastResult, error, cloneVoice }
}
