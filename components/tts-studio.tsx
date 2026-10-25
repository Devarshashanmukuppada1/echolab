'use client'

import { useState, useRef, useEffect } from 'react'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Play, Pause, Volume2, Settings, FileText, Zap, PauseCircle } from 'lucide-react'
import { useTTS } from '@/hooks/use-tts'
import { useAudioPlayer } from '@/hooks/use-audio-player'

export function TTSStudio() {
  const [text, setText] = useState('')
  const [voice, setVoice] = useState('neural')
  const [stability, setStability] = useState(0.5)
  const [clarity, setClarity] = useState(0.5)
  const [exaggeration, setExaggeration] = useState(0.5)
  const [model, setModel] = useState('multilingual')
  const [showAdvanced, setShowAdvanced] = useState(false)

  const { generate, isGenerating, lastResult, error } = useTTS()
  const player = useAudioPlayer(lastResult?.audioUrl ?? null)

  const handleGenerate = async () => {
    if (!text.trim()) return
    await generate(text)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleGenerate()
    }
  }

  const voiceOptions = [
    { value: 'neural', label: 'Neural' },
    { value: 'fast', label: 'Fast' },
    { value: 'clear', label: 'Clear' },
  ]

  const modelOptions = [
    { value: 'multilingual', label: 'Multilingual' },
    { value: 'expressive', label: 'Expressive' },
    { value: 'low-latency', label: 'Low Latency' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Text-to-Speech Studio
          </CardTitle>
          <CardDescription>
            Generate high-quality speech from text with customizable voice settings
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Main Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Text Input */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Text Input</CardTitle>
              <CardDescription>
                Enter or paste your text (max 5000 characters)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <textarea
                placeholder="Type your text here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyPress={handleKeyPress}
                maxLength={5000}
                className="w-full h-32 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
              />
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {text.length}/5000 characters
                </span>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !text.trim()}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" />
                      Generate Audio
                    </>
                  )}
                </button>
              </div>
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <div className="text-sm text-red-600 dark:text-red-400">
                    Error: {error}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Advanced Settings */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Voice Settings
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="ml-auto text-sm text-blue-500 hover:text-blue-600"
                >
                  {showAdvanced ? 'Hide' : 'Show'}
                </button>
              </CardTitle>
            </CardHeader>
            {showAdvanced && (
              <CardContent className="space-y-6">
                {/* Voice Selection */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Voice Type</label>
                  <Select value={voice} onValueChange={setVoice}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {voiceOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Model Selection */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Model</label>
                  <Select value={model} onValueChange={setModel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {modelOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sliders */}
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">Stability</label>
                      <span className="text-sm text-gray-500">{(stability * 100).toFixed(0)}%</span>
                    </div>
                    <Slider
                      value={[stability]}
                      onValueChange={(value) => setStability(value[0])}
                      max={1}
                      step={0.1}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">Clarity</label>
                      <span className="text-sm text-gray-500">{(clarity * 100).toFixed(0)}%</span>
                    </div>
                    <Slider
                      value={[clarity]}
                      onValueChange={(value) => setClarity(value[0])}
                      max={1}
                      step={0.1}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">Exaggeration</label>
                      <span className="text-sm text-gray-500">{(exaggeration * 100).toFixed(0)}%</span>
                    </div>
                    <Slider
                      value={[exaggeration]}
                      onValueChange={(value) => setExaggeration(value[0])}
                      max={1}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Audio Player Panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Volume2 className="h-5 w-5" />
                Audio Player
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lastResult?.audioUrl ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Duration</span>
                      <span className="font-mono">{(lastResult.durationMs / 1000).toFixed(1)}s</span>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Generated</span>
                      <span className="text-sm">Today</span>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Quality</span>
                      <Badge variant="secondary">High</Badge>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={player.isPlaying ? player.pauseAudio : player.playAudio}
                      disabled={!player.canPlay}
                      className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                      {player.isPlaying ? (
                        <PauseCircle className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                      {player.isPlaying ? 'Pause' : 'Play'}
                    </button>
                    <button
                      onClick={player.stopAudio}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      Stop
                    </button>
                  </div>

                  {player.error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                      <div className="text-sm text-red-600 dark:text-red-400">
                        Error: {player.error}
                      </div>
                    </div>
                  )}

                  {player.isLoading && (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Loading...</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center py-12 text-center">
                  <div className="text-gray-500 dark:text-gray-400">
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No audio generated yet</p>
                    <p className="text-xs mt-1">Enter text and click "Generate Audio"</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}