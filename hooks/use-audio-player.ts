'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

export interface AudioPlayerApi {
  audioUrl: string | null
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isLoading: boolean
  canPlay: boolean
  error: string | null
  playAudio: () => Promise<void>
  pauseAudio: () => void
  stopAudio: () => void
  seekTo: (time: number) => void
  setVolume: (v: number) => void
  togglePlayPause: () => void
  playFromUrl: (url: string) => Promise<void>
  setCurrentTime: (t: number) => void
}

export function useAudioPlayer(options: {
  onPlay?: () => void
  onPause?: () => void
  onEnded?: () => void
  onError?: (err: Error) => void
} = {}): AudioPlayerApi {
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolumeState] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const audioRef = useRef<HTMLAudioElement>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const previousVolumeRef = useRef(1)

  const playAudio = useCallback(async (): Promise<void> => {
    if (!audioRef.current) return
    try {
      setError(null)
      setIsLoading(true)
      if (audioRef.current.src !== audioUrl) {
        audioRef.current.src = audioUrl ?? ''
      }
      await audioRef.current.play()
    } catch (err) {
      console.error('Playback error:', err)
      setError('Failed to play audio')
    } finally {
      setIsLoading(false)
    }
  }, [audioUrl])

  const pauseAudio = useCallback((): void => {
    if (!audioRef.current) return
    audioRef.current.pause()
  }, [])

  const stopAudio = useCallback((): void => {
    if (!audioRef.current) return
    audioRef.current.pause()
    audioRef.current.currentTime = 0
  }, [])

  const seekTo = useCallback((t: number): void => {
    if (!audioRef.current) return
    audioRef.current.currentTime = t
  }, [])

  const setVolume = useCallback((v: number): void => {
    if (!audioRef.current) return
    previousVolumeRef.current = audioRef.current.volume
    audioRef.current.volume = v
    setVolumeState(v)
  }, [])

  const togglePlayPause = useCallback((): void => {
    if (isPlaying) pauseAudio()
    else playAudio()
  }, [isPlaying, playAudio, pauseAudio])

  const playFromUrl = useCallback(async (url: string): Promise<void> => {
    if (url === audioRef.current?.src) {
      await playAudio()
    } else {
      await playAudio()
      if (audioRef.current) {
        await audioRef.current.play()
      }
    }
  }, [audioUrl, playAudio])

  return {
    audioUrl,
    isPlaying,
    currentTime,
    duration,
    volume,
    isLoading,
    canPlay: !isLoading && !error,
    error,
    playAudio,
    pauseAudio,
    stopAudio,
    seekTo,
    setVolume,
    togglePlayPause,
    playFromUrl,
    setCurrentTime,
  }
}
