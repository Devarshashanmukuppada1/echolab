'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AudioWaveform } from '@/components/audio-waveform'
import { VoiceCard } from '@/components/voice-card'
import { Search, Filter, Download, Trash2, Play, Pause, Clock, Music, User, Volume2, Grid, List, Calendar, FileAudio, Eye, Settings, BarChart3, TrendingUp, TrendingDown } from 'lucide-react'
import { useAudioStore } from '@/stores/audio-store'
import { useVoiceStore } from '@/stores/voice-store'
import { cn } from '@/lib/utils'
import { Voice } from '@/types/voice'
import { AudioFile } from '@/types/audio'

const HISTORY_TYPES = [
  { value: 'all', label: 'All History' },
  { value: 'tts', label: 'TTS Generations' },
  { value: 'clone', label: 'Voice Clones' },
  { value: 'imported', label: 'Imported Voices' },
]

const TIME_FILTERS = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'year', label: 'This Year' },
]

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'duration', label: 'Duration' },
  { value: 'size', label: 'File Size' },
]

export function HistoryDashboard() {
  const [activeTab, setActiveTab] = useState('audio')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('all')
  const [selectedSort, setSelectedSort] = useState('newest')
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [playingItem, setPlayingItem] = useState<string | null>(null)

  const { audioHistory, removeFromHistory, clearHistory, setCurrentAudio } = useAudioStore()
  const { clonedVoices, fetchVoices } = useVoiceStore()

  useEffect(() => {
    fetchVoices()
  }, [fetchVoices])

  const filteredAudioHistory = audioHistory.filter((item) => {
    // Search filter
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !(item.voiceName && item.voiceName.toLowerCase().includes(searchQuery.toLowerCase()))) {
      return false
    }

    // Type filter
    if (selectedType === 'tts' && !item.voiceName) return false
    if (selectedType === 'clone' && !item.voiceId) return false

    // Time filter
    const itemDate = new Date(item.createdAt)
    const now = new Date()
    switch (selectedTimeFilter) {
      case 'today':
        if (itemDate.toDateString() !== now.toDateString()) return false
        break
      case 'week':
        const weekAgo = new Date(now.setDate(now.getDate() - 7))
        if (itemDate < weekAgo) return false
        break
      case 'month':
        const monthAgo = new Date(now.setMonth(now.getMonth() - 1))
        if (itemDate < monthAgo) return false
        break
      case 'year':
        const yearAgo = new Date(now.setFullYear(now.getFullYear() - 1))
        if (itemDate < yearAgo) return false
        break
    }

    return true
  }).sort((a, b) => {
    switch (selectedSort) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case 'duration':
        return b.duration - a.duration
      case 'size':
        return b.size - a.size
      default:
        return 0
    }
  })

  const filteredClonedVoices = clonedVoices.filter((voice) => {
    if (searchQuery && !voice.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }

    return true
  })

  const toggleSelectItem = (id: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const selectAll = () => {
    setSelectedItems(new Set(filteredAudioHistory.map(item => item.id)))
  }

  const clearSelection = () => {
    setSelectedItems(new Set())
  }

  const deleteSelected = () => {
    selectedItems.forEach(id => {
      removeFromHistory(id)
    })
    clearSelection()
  }

  const playAudioItem = (item: AudioFile) => {
    setPlayingItem(item.id)
    setCurrentAudio(item)
  }

  const stopAudioItem = () => {
    setPlayingItem(null)
    setCurrentAudio(null)
  }

  const playVoiceClone = (voice: Voice) => {
    // In a real implementation, this would trigger voice synthesis
    console.log('Playing voice clone:', voice.name)
  }

  const getFileIcon = (format: string) => {
    switch (format) {
      case 'mp3':
      case 'mpeg':
        return Music
      default:
        return FileAudio
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return 'Today'
    } else if (diffDays === 1) {
      return 'Yesterday'
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    } else if (diffDays < 30) {
      return `${Math.floor(diffDays / 7)} weeks ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const stats = {
    totalAudio: audioHistory.length,
    ttsCount: audioHistory.filter(item => !item.voiceId).length,
    cloneCount: audioHistory.filter(item => item.voiceId).length,
    totalSize: audioHistory.reduce((sum, item) => sum + item.size, 0),
    uniqueVoices: new Set(audioHistory.map(item => item.voiceName).filter(Boolean)).size,
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">History Dashboard</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              View and manage your audio generation and voice cloning history
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
              <BarChart3 className="h-3 w-3 mr-1" />
              {stats.totalAudio} Total Items
            </Badge>
            <Badge variant="secondary" className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-200">
              <TrendingUp className="h-3 w-3 mr-1" />
              {stats.uniqueVoices} Voices
            </Badge>
            <Badge variant="secondary" className="bg-purple-50 text-purple-700 dark:bg-purple-900 dark:text-purple-200">
              <Calendar className="h-3 w-3 mr-1" />
              {formatDate(new Date().toISOString())}
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-200">TTS Generations</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {stats.ttsCount}
                  </p>
                </div>
                <Music className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900 dark:to-green-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 dark:text-green-200">Voice Clones</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {stats.cloneCount}
                  </p>
                </div>
                <User className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 dark:text-purple-200">Total Storage</p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    {(stats.totalSize / (1024 * 1024)).toFixed(1)} MB
                  </p>
                </div>
                <FileAudio className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 dark:text-orange-200">Unique Voices</p>
                  <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                    {stats.uniqueVoices}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex-1 overflow-hidden p-6">
        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search history...
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {HISTORY_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedTimeFilter} onValueChange={setSelectedTimeFilter}>
              <SelectTrigger className="w-32">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIME_FILTERS.map((filter) => (
                  <SelectItem key={filter.value} value={filter.value}>
                    {filter.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedSort} onValueChange={setSelectedSort}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex border rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            {selectedItems.size > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedItems.size} selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={deleteSelected}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearSelection}
                >
                  Clear
                </Button>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={selectAll}
              disabled={filteredAudioHistory.length === 0}
            >
              Select All
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => clearHistory()}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="audio" className="flex items-center space-x-2">
              <Music className="h-4 w-4" />
              <span>Audio History ({filteredAudioHistory.length})</span>
            </TabsTrigger>
            <TabsTrigger value="voices" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Voice Clones ({filteredClonedVoices.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="audio" className="space-y-6">
            {filteredAudioHistory.length === 0 ? (
              <Card className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                    <Music className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No Audio History Found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md">
                    You haven't generated any audio yet. Visit the TTS Studio to create your first audio file.
                  </p>
                </div>
              </Card>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAudioHistory.map((item) => (
                  <Card
                    key={item.id}
                    className={cn(
                      'cursor-pointer transition-all duration-200',
                      selectedItems.has(item.id) && 'ring-2 ring-blue-500',
                      playingItem === item.id && 'bg-blue-50 dark:bg-blue-900/20'
                    )}
                    onClick={() => toggleSelectItem(item.id)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2">
                            {selectedItems.has(item.id) && (
                              <div className="w-4 h-4 bg-blue-500 rounded flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded" />
                              </div>
                            )}
                            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                              <Music className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              playAudioItem(item)
                            }}
                            className="ml-auto"
                          >
                            {playingItem === item.id ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>
                        </div>

                        <div>
                          <h3 className="font-medium text-sm truncate">{item.name}</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {item.voiceName || 'Generated'}
                          </p>
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{item.duration}s</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <FileAudio className="h-3 w-3" />
                            <span>{(item.size / 1024).toFixed(0)} KB</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="text-xs">
                            {item.format.toUpperCase()}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {formatDate(item.createdAt)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-200 dark:divide-gray-800">
                    {filteredAudioHistory.map((item) => (
                      <div
                        key={item.id}
                        className={cn(
                          'flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer',
                          selectedItems.has(item.id) && 'bg-blue-50 dark:bg-blue-900/20',
                          playingItem === item.id && 'bg-blue-100 dark:bg-blue-900/30'
                        )}
                        onClick={() => toggleSelectItem(item.id)}
                      >
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                            <Music className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              {selectedItems.has(item.id) && (
                                <div className="w-4 h-4 bg-blue-500 rounded flex items-center justify-center">
                                  <div className="w-2 h-2 bg-white rounded" />
                                </div>
                              )}
                              <h3 className="font-medium">{item.name}</h3>
                              {item.voiceName && (
                                <Badge variant="secondary" className="text-xs">
                                  {item.voiceName}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{item.duration}s</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <FileAudio className="h-3 w-3" />
                                <span>{(item.size / 1024).toFixed(0)} KB</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span>{formatDate(item.createdAt)}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Badge variant="secondary" className="text-xs">
                                  {item.format.toUpperCase()}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              playAudioItem(item)
                            }}
                          >
                            {playingItem === item.id ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeFromHistory(item.id)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="voices" className="space-y-6">
            {filteredClonedVoices.length === 0 ? (
              <Card className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                    <User className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No Voice Clones Found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md">
                    You haven't cloned any voices yet. Visit the Voice Cloning Lab to create your first voice clone.
                  </p>
                </div>
              </Card>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredClonedVoices.map((voice) => (
                  <VoiceCard
                    key={voice.id}
                    voice={voice}
                    onSelect={() => {}}
                    showActions={false}
                    variant="default"
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-200 dark:divide-gray-800">
                    {filteredClonedVoices.map((voice) => (
                      <div
                        key={voice.id}
                        className="flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                      >
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center text-xl">
                            {voice.gender === 'female' ? '👩' : '👨'}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium">{voice.name}</h3>
                              {voice.isPremium && (
                                <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                                  <Star className="h-3 w-3 mr-1" />
                                  Premium
                                </Badge>
                              )}
                              {voice.isCloned && (
                                <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                  <Check className="h-3 w-3 mr-1" />
                                  Cloned
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{voice.processingTime}s</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Music className="h-3 w-3" />
                                <span>{voice.downloadCount.toLocaleString()} downloads</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Star className="h-3 w-3" />
                                <span>{voice.rating}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => playVoiceClone(voice)}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Test Voice
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}