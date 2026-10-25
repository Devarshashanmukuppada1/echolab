'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Download, Play, Pause, Clock, Users, Star, Filter, Search, Trash2, Calendar, BarChart3, Music, Crown, Mic } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAudioStore } from '@/stores/audio-store'

const formatTimeAgo = (timestamp: Date): string => {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - timestamp.getTime()) / 1000)

  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`
  }
  const days = Math.floor(diffInSeconds / 86400)
  return `${days} ${days === 1 ? 'day' : 'days'} ago`
}

const formatDuration = (ms: number): string => {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  }
  return `${seconds}s`
}

export function HistoryDashboard() {
  const [activeTab, setActiveTab] = useState('audio-history')
  const [filterType, setFilterType] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  const { audioHistory, audioStats, loadAudioHistory } = useAudioStore()

  useEffect(() => {
    loadAudioHistory()
  }, [loadAudioHistory])

  const filteredHistory = audioHistory.filter((item) => {
    const matchesType = filterType === 'all' || item.type === filterType
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesType && matchesSearch
  })

  const sortedHistory = [...filteredHistory].sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      case 'duration':
        return b.duration - a.duration
      case 'name':
        return a.title.localeCompare(b.title)
      case 'newest':
      default:
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    }
  })

  const statsCards = [
    {
      icon: Music,
      label: 'Total Audio',
      value: audioStats.totalAudio,
      change: '+12%',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      icon: Clock,
      label: 'Total Duration',
      value: formatDuration(audioStats.totalDuration),
      change: '+8%',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    },
    {
      icon: Crown,
      label: 'Premium Voices',
      value: audioStats.premiumVoices,
      change: '+3%',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20'
    },
    {
      icon: Users,
      label: 'Custom Voices',
      value: audioStats.customVoices,
      change: '+5%',
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    }
  ]

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'tts':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'clone':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'playback':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'tts':
        return '📝'
      case 'clone':
        return '🎤'
      case 'playback':
        return '▶️'
      default:
        return '📁'
    }
  }

  const handleSelectAll = () => {
    if (selectedItems.length === sortedHistory.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(sortedHistory.map(item => item.id))
    }
  }

  const handleSelectItem = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleDelete = (id: string) => {
    // Implementation would call delete function from audio store
    console.log('Delete item:', id)
  }

  const handleDownload = (item: any) => {
    // Implementation would trigger download
    console.log('Download item:', item)
  }

  const handlePlay = (item: any) => {
    // Implementation would play audio
    console.log('Play item:', item)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">History & Projects</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your audio generation history and cloned voices
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Advanced Filters
            </Button>
            <Button variant="outline" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {stat.label}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                        {stat.value}
                      </p>
                      <p className={cn('text-xs mt-1', stat.color)}>
                        {stat.change} vs last week
                      </p>
                    </div>
                    <div className={cn('p-3 rounded-lg', stat.bgColor)}>
                      <Icon className={cn('h-5 w-5', stat.color)} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Filters and Search */}
        <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Filter type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="tts">TTS Generated</SelectItem>
                <SelectItem value="clone">Voice Clones</SelectItem>
                <SelectItem value="playback">Playback History</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="duration">Duration</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="ml-auto">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {sortedHistory.length} items found
            </p>
          </div>
        </div>
      </div>

      {/* Main Content - Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="audio-history">Audio History</TabsTrigger>
          <TabsTrigger value="cloned-voices">Cloned Voices</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Audio History Tab */}
        <TabsContent value="audio-history" className="space-y-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
            {selectedItems.length > 0 && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-600 dark:text-blue-400">
                    {selectedItems.length} items selected
                  </span>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">Play Selected</Button>
                    <Button variant="outline" size="sm">Download Selected</Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      Delete Selected
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {sortedHistory.map((item) => {
                const isSelected = selectedItems.includes(item.id)
                return (
                  <div
                    key={item.id}
                    className={cn(
                      'p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer',
                      isSelected && 'bg-blue-50 dark:bg-blue-900/20 border-r-4 border-blue-500'
                    )}
                    onClick={() => handleSelectItem(item.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="text-2xl">
                          {getFileIcon(item.type)}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                            {item.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {item.description}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-500">
                            <span className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatTimeAgo(item.timestamp)}
                            </span>
                            <span className="flex items-center">
                              <Mic className="h-3 w-3 mr-1" />
                              {item.duration}s
                            </span>
                            <span className="flex items-center">
                              <Star className="h-3 w-3 mr-1" />
                              {item.rating}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <Badge className={cn('text-xs', getTypeColor(item.type))}
                          variant="secondary">
                          {item.type}
                        </Badge>
                        {item.isPremium && (
                          <Badge variant="secondary" className="text-xs">
                            <Crown className="h-3 w-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                        {item.isCloned && (
                          <Badge variant="secondary" className="text-xs">
                            <Mic className="h-3 w-3 mr-1" />
                            Custom
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handlePlay(item)
                          }}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDownload(item)
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(item.id)
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {sortedHistory.length === 0 && (
              <div className="p-12 text-center">
                <Music className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No audio found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Try adjusting your filters or generate some audio first
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Cloned Voices Tab */}
        <TabsContent value="cloned-voices" className="space-y-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-12">
            <div className="text-center">
              <Mic className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Custom Voice Library
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Your collection of cloned voices and custom voice models
              </p>
              <Button>
                Create New Clone
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Usage Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">TTS Usage</span>
                    <span className="font-medium">156 today</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Cloning Jobs</span>
                    <span className="font-medium">23 today</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Most Used Voice</span>
                    <span className="font-medium">Neural-2</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Voice Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">High Quality (4.5+)</span>
                    <span className="font-medium">67%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Medium Quality (3.5-4.5)</span>
                    <span className="font-medium">28%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Low Quality (&lt;3.5)</span>
                    <span className="font-medium">5%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}