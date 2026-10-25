'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent } from '@/components/ui/card'
import {
  Play,
  Pause,
  Volume2,
  Download,
  Maximize2,
  Minimize2,
  SkipBack,
  SkipForward,
  Clock,
  WavesLadder,
  Settings,
  Music
} from 'lucide-react'
import { useRef, useState, useCallback, useEffect } from 'react'
import WaveSurfer from 'wavesurfer.js'
import 'wavesurfer.js/dist/wavesurfer.min.js'
import { formatTime } from '@/lib/audio'

interface AudioWaveformProps {
  audioUrl: string
  onPlay?: () => void
  onPause?: () => void
  onEnded?: () => void
  onProgress?: (progress: number) => void
  className?: string
  showControls?: boolean
  showWaveform?: boolean
  showMetadata?: boolean
  autoPlay?: boolean
}

export function AudioWaveform({
  audioUrl,
  onPlay,
  onPause,
  onEnded,
  onProgress,
  className,
  showControls = true,
  showWaveform = true,
  showMetadata = true,
  autoPlay = false
}: AudioWaveformProps) {
  const waveformRef = useRef<HTMLDivElement>(null)
  const wavesurferRef = useRef<WaveSurfer | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!waveformRef.current) return

    // Initialize WaveSurfer
    wavesurferRef.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: 'rgb(99, 102, 241)',
      progressColor: 'rgb(99, 102, 241)',
      cursorColor: 'rgb(99, 102, 241)',
      barWidth: 2,
      barGap: 1,
      barRadius: 3,
      height: 60,
      normalize: true,
      audioContextDestination: 'mediaelement',
      xhr: {
        cache: 'force-cache',
      },
    })

    // Event handlers
    wavesurferRef.current.on('ready', () => {
      setDuration(wavesurferRef.current?.getDuration() || 0)
      setIsLoading(false)
      if (autoPlay) {
        wavesurferRef.current?.play()
        setIsPlaying(true)
      }
    })

    wavesurferRef.current.on('play', () => {
      setIsPlaying(true)
      onPlay && onPlay()
    })

    wavesurferRef.current.on('pause', () => {
      setIsPlaying(false)
      onPause && onPause()
    })

    wavesurferRef.current.on('finish', () => {
      setIsPlaying(false)
      setCurrentTime(0)
      onEnded && onEnded()
    })

    wavesurferRef.current.on('timeupdate', () => {
      if (!isDragging) {
        setCurrentTime(wavesurferRef.current?.getCurrentTime() || 0)
        onProgress && onProgress((wavesurferRef.current?.getCurrentTime() || 0) / duration)
      }
    })

    wavesurferRef.current.on('error', (err) => {
      console.error('WaveSurfer error:', err)
      setError(`Audio error: ${err.message}`)
      setIsLoading(false)
    })

    // Load audio file
    setIsLoading(true)
    wavesurferRef.current.load(audioUrl)

    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy()
        wavesurferRef.current = null
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }
  }, [audioUrl, autoPlay, onPlay, onPause, onEnded, onProgress])

  useEffect(() => {
    if (wavesurferRef.current) {
      wavesurferRef.current.setVolume(volume)
    }
  }, [volume])

  const handlePlayPause = useCallback(() => {
    if (!wavesurferRef.current) return

    if (isPlaying) {
      wavesurferRef.current.pause()
    } else {
      wavesurferRef.current.play()
    }
  }, [isPlaying])

  const handleSeek = useCallback((value: number[]) => {
    if (!wavesurferRef.current) return

    const seekTime = value[0]
    setIsDragging(true)
    wavesurferRef.current.seekTo(seekTime)

    // Update current time after seek
    setTimeout(() => {
      setCurrentTime(wavesurferRef.current?.getCurrentTime() || 0)
      setIsDragging(false)
    }, 100)
  }, [])

  const handleVolumeChange = useCallback((value: number[]) => {
    setVolume(value[0])
  }, [])

  const handleSkip = useCallback((seconds: number) => {
    if (!wavesurferRef.current) return

    const current = wavesurferRef.current.getCurrentTime()
    const newTime = Math.max(0, Math.min(duration, current + seconds))
    wavesurferRef.current.seekTo(newTime / duration)
  }, [duration])

  const handleDownload = useCallback(async () => {
    try {
      const response = await fetch(audioUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `audio-${Date.now()}.${blob.type.split('/')[1]}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
      setError('Download failed')
    }
  }, [audioUrl])

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen)
  }, [isFullscreen])

  return (
    <Card className={cn('w-full', className, isFullscreen ? 'fixed inset-0 z-50 m-4' : '')}>
      <CardContent className="p-4">
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
            <div className="text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          </div>
        )}

        {/* Waveform Display */}
        {showWaveform && (
          <div ref={waveformRef} className="mb-4" />
        )}

        {/* Metadata */}
        {showMetadata && (
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
              </div>
              <div className="flex items-center">
                <Music className="h-4 w-4 mr-1" />
                <span>48kHz 16bit</span>
              </div>
              {isLoading && (
                <div className="flex items-center">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full mr-2" />
                  <span>Loading...</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Controls */}
        {showControls && (
          <div className="space-y-4">
            {/* Main Controls */}
            <div className="flex items-center justify-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSkip(-10)}
                disabled={isLoading}
              >
                <SkipBack className="h-4 w-4" />
              </Button>

              <Button
                variant="default"
                size="sm"
                onClick={handlePlayPause}
                disabled={isLoading}
                className="w-12 h-12 rounded-full"
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5 ml-0.5" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSkip(10)}
                disabled={isLoading}
              >
                <SkipForward className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center space-x-3 px-4">
              <Volume2 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <Slider
                value={[volume]}
                onValueChange={handleVolumeChange}
                max={1}
                step={0.1}
                className="flex-1"
              />
              <span className="text-xs text-gray-500 dark:text-gray-500 w-8">
                {Math.round(volume * 100)}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="px-4">
              <Slider
                value={[currentTime / duration || 0]}
                onValueChange={handleSeek}
                max={1}
                step={0.01}
                className="w-full"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}