'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Play, Download, Star, Clock, Users, Volume2, VolumeX, Info, Check } from 'lucide-react'
import { useState } from 'react'
import { Voice } from '@/types/voice'
import { useAudioPlayer } from '@/hooks/use-audio-player'

interface VoiceCardProps {
  voice: Voice
  onSelect?: (voice: Voice) => void
  onClone?: (voice: Voice) => void
  showActions?: boolean
  variant?: 'default' | 'compact' | 'detailed'
}

export function VoiceCard({
  voice,
  onSelect,
  onClone,
  showActions = true,
  variant = 'default'
}: VoiceCardProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [audioError, setAudioError] = useState<string | null>(null)

  const { playAudio, stopAudio, isPlaying: isAudioPlaying } = useAudioPlayer(voice.sampleUrl)

  const handlePlay = async () => {
    try {
      setAudioError(null)
      if (isAudioPlaying) {
        stopAudio()
        setIsPlaying(false)
      } else {
        await playAudio()
        setIsPlaying(true)
      }
    } catch (error) {
      setAudioError('Failed to play audio')
    }
  }

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      const response = await fetch(voice.sampleUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${voice.name}-sample.mp3`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
    } finally {
      setIsDownloading(false)
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'built-in':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'famous':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'community':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'custom':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getGenderIcon = (gender: string) => {
    return gender === 'female' ? '👩' : '👨'
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-center p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center text-xl">
          {getGenderIcon(voice.gender)}
        </div>
        <div className="ml-4 flex-1">
          <div className="font-medium text-sm">{voice.name}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{voice.accent} • {voice.language}</div>
        </div>
        <Badge className={cn('text-xs', getCategoryColor(voice.category))} variant="secondary">
          {voice.category}
        </Badge>
        {showActions && (
          <Button
            size="sm"
            variant="ghost"
            className="ml-2"
            onClick={() => onSelect && onSelect(voice)}
          >
            <Play className="h-4 w-4" />
          </Button>
        )}
      </div>
    )
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {voice.name}
              {voice.isCloned && (
                <Check className="h-4 w-4 text-green-500" />
              )}
              {voice.isPremium && (
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
              )}
            </CardTitle>
            <CardDescription className="text-sm mt-1">
              {voice.description}
            </CardDescription>
          </div>
          <Badge className={cn('text-xs', getCategoryColor(voice.category))} variant="secondary">
            {voice.category}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Clock className="h-4 w-4 mr-2" />
            {voice.processingTime}s
          </div>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Users className="h-4 w-4 mr-2" />
            {voice.downloadCount.toLocaleString()}
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-4">
          {voice.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        {audioError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
            <div className="text-sm text-red-600 dark:text-red-400">
              {audioError}
            </div>
          </div>
        )}

        <div className="flex items-center justify-center h-16 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <button
            onClick={handlePlay}
            className="flex flex-col items-center space-y-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors p-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
          >
            {isPlaying || isAudioPlaying ? (
              <VolumeX className="h-8 w-8" />
            ) : (
              <Volume2 className="h-8 w-8" />
            )}
            <div className="text-xs">Preview</div>
          </button>
        </div>
      </CardContent>

      {showActions && (
        <CardFooter className="pt-4">
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleDownload}
              disabled={isDownloading}
            >
              <Download className="h-4 w-4 mr-2" />
              {isDownloading ? 'Downloading...' : 'Download'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSelect && onSelect(voice)}
            >
              <Info className="h-4 w-4 mr-2" />
              Details
            </Button>
            {voice.isCloned && onClone && (
              <Button
                variant="default"
                size="sm"
                onClick={() => onClone(voice)}
              >
                Clone
              </Button>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  )
}