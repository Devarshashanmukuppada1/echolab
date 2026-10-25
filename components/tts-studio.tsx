'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { AudioWaveform } from '@/components/audio-waveform'
import { Play, Pause, Volume2, Settings, Save, Download, Copy, Share2, RotateCcw, Upload, Sparkles, Zap, Clock, Info } from 'lucide-react'
import { useVoiceStore } from '@/stores/voice-store'
import { useAudioStore } from '@/stores/audio-store'
import { cn } from '@/lib/utils'
import { apiClient } from '@/lib/api'
import { Voice } from '@/types/voice'

const models = [
  { value: 'sense-s1', label: 'Sense S1', description: 'Professional voice with excellent clarity' },
  { value: 'sense-s2', label: 'Sense S2', description: 'Educational voice optimized for teaching' },
  { value: 'sense-s3', label: 'Sense S3', description: 'Creative and engaging voice' },
  { value: 'sense-s4', label: 'Sense S4', description: 'Natural conversational voice' },
  { value: 'sense-s5', label: 'Sense S5', description: 'Multilingual voice' },
]

const generateModes = [
  { value: 'auto', label: 'Auto', description: 'Smart generation with optimization' },
  { value: 'precise', label: 'Precise', description: 'High quality with detailed control' },
  { value: 'fast', label: 'Fast', description: 'Quick generation for real-time use' },
]

export function TTSStudio() {
  const [text, setText] = useState('')
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null)
  const [audioUrl, setAudioUrl] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [generationHistory, setGenerationHistory] = useState<Array<{ id: string; text: string; timestamp: Date; duration: number }>>([])

  // Controls
  const [stability, setStability] = useState(0.5)
  const [clarity, setClarity] = useState(0.8)
  const [exaggeration, setExaggeration] = useState(0.3)
  const [speed, setSpeed] = useState(1.0)
  const [volume, setVolume] = useState(1.0)
  const [model, setModel] = useState('sense-s1')
  const [format, setFormat] = useState<'mp3' | 'wav'>('mp3')
  const [sampleRate, setSampleRate] = useState(24000)

  const { voices, fetchVoices } = useVoiceStore()
  const { addToHistory, setCurrentAudio } = useAudioStore()

  useEffect(() => {
    fetchVoices()
  }, [fetchVoices])

  const generateAudio = useCallback(async () => {
    if (!text.trim() || !selectedVoice) {
      return
    }

    setIsGenerating(true)
    setAudioUrl('')
    setIsPlaying(false)

    try {
      // Make API call to generate speech
      const response = await apiClient.post('/api/tts', {
        text,
        voice: selectedVoice.id,
        model,
        stability,
        clarity,
        exaggeration,
        speed,
        format,
        sampleRate,
      })

      // Convert response to audio URL
      const audioBlob = new Blob([response as ArrayBuffer], {
        type: format === 'wav' ? 'audio/wav' : 'audio/mpeg'
      })
      const audioUrl = URL.createObjectURL(audioBlob)
      setAudioUrl(audioUrl)

      // Add to history
      const newHistoryItem = {
        id: Date.now().toString(),
        text,
        timestamp: new Date(),
        duration: Math.ceil(text.length / 10), // rough estimation
      }
      setGenerationHistory(prev => [newHistoryItem, ...prev].slice(0, 50))

      // Add to audio store
      addToHistory({
        id: newHistoryItem.id,
        name: `Generated from: ${text.substring(0, 30)}${text.length > 30 ? '...' : ''}`,
        url: audioUrl,
        duration: newHistoryItem.duration,
        size: audioBlob.size,
        format,
        sampleRate,
        bitrate: format === 'mp3' ? 128000 : 1411200,
        createdAt: new Date().toISOString(),
        voiceId: selectedVoice.id,
        voiceName: selectedVoice.name,
        metadata: {
          stability,
          clarity,
          exaggeration,
          speed,
          model,
          language: selectedVoice.language,
        }
      })

      setCurrentAudio(null)

    } catch (error) {
      console.error('Audio generation failed:', error)
    } finally {
      setIsGenerating(false)
    }
  }, [
    text, selectedVoice, model, stability, clarity, exaggeration, speed, format, sampleRate,
    apiClient, addToHistory, setCurrentAudio
  ])

  const playAudio = useCallback(() => {
    setIsPlaying(!isPlaying)
  }, [isPlaying])

  const clearText = () => {
    setText('')
    setAudioUrl('')
    setIsPlaying(false)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }

  const saveAsTemplate = () => {
    const template = {
      text,
      voice: selectedVoice?.id,
      settings: { stability, clarity, exaggeration, speed, model, format, sampleRate }
    }
    localStorage.setItem('tts-template', JSON.stringify(template))
  }

  const loadFromTemplate = () => {
    const template = localStorage.getItem('tts-template')
    if (template) {
      try {
        const parsed = JSON.parse(template)
        setText(parsed.text)
        setSelectedVoice(voices.find(v => v.id === parsed.voice) || null)
        setStability(parsed.settings.stability || 0.5)
        setClarity(parsed.settings.clarity || 0.8)
        setExaggeration(parsed.settings.exaggeration || 0.3)
        setSpeed(parsed.settings.speed || 1.0)
        setModel(parsed.settings.model || 'sense-s1')
        setFormat(parsed.settings.format || 'mp3')
        setSampleRate(parsed.settings.sampleRate || 24000)
      } catch (error) {
        console.error('Failed to load template:', error)
      }
    }
  }

  const characterCount = text.length
  const wordCount = text.split(' ').filter(word => word.length > 0).length
  const estimatedDuration = Math.ceil(characterCount / 15) // 15 chars per second approximation

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">TTS Studio</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Generate high-quality speech with fine-tuned voice controls
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
              <Zap className="h-3 w-3 mr-1" />
              AI Powered
            </Badge>
            <Badge variant="secondary" className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-200">
              <Sparkles className="h-3 w-3 mr-1" />
              Studio Quality
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* Left Panel - Text Input & Controls */}
          <div className="lg:col-span-1 space-y-6 overflow-y-auto">
            {/* Text Input */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Text Input</CardTitle>
                <CardDescription>
                  Enter the text you want to convert to speech
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Type or paste your text here..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="min-h-[120px] resize-none"
                />

                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>{characterCount} characters</span>
                  <span>{wordCount} words</span>
                </div>

                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                    disabled={!text}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={saveAsTemplate}
                    disabled={!text}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Template
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadFromTemplate}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Load
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearText}
                    disabled={!text}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Voice Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Voice Selection</CardTitle>
                <CardDescription>
                  Choose the voice for your generated audio
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select
                  value={selectedVoice?.id || ''}
                  onValueChange={(voiceId) => {
                    const voice = voices.find(v => v.id === voiceId)
                    setSelectedVoice(voice || null)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a voice" />
                  </SelectTrigger>
                  <SelectContent>
                    {voices.map((voice) => (
                      <SelectItem key={voice.id} value={voice.id}>
                        <div className="flex items-center space-x-2">
                          <span>{voice.name}</span>
                          {voice.isPremium && (
                            <Badge variant="secondary" className="text-xs">Premium</Badge>
                          )}
                          {voice.isCloned && (
                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">Cloned</Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedVoice && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                      <div className="flex justify-between">
                        <span>Gender:</span>
                        <span className="font-medium">{selectedVoice.gender}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Accent:</span>
                        <span className="font-medium">{selectedVoice.accent}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Language:</span>
                        <span className="font-medium">{selectedVoice.language}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Category:</span>
                        <span className="font-medium">{selectedVoice.category}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Generation Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Generation Settings</CardTitle>
                <CardDescription>
                  Fine-tune your audio generation parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Model Selection */}
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Select value={model} onValueChange={setModel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {models.map((m) => (
                        <SelectItem key={m.value} value={m.value}>
                          <div>
                            <div className="font-medium">{m.label}</div>
                            <div className="text-xs text-gray-500">{m.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Stability Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="stability">Stability</Label>
                    <span className="text-sm text-gray-500">{(stability * 100).toFixed(0)}%</span>
                  </div>
                  <Slider
                    id="stability"
                    value={[stability]}
                    onValueChange={(value) => setStability(value[0])}
                    max={1}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Less Stable (More Expressive)</span>
                    <span>More Stable (Less Expressive)</span>
                  </div>
                </div>

                {/* Clarity Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="clarity">Clarity</Label>
                    <span className="text-sm text-gray-500">{(clarity * 100).toFixed(0)}%</span>
                  </div>
                  <Slider
                    id="clarity"
                    value={[clarity]}
                    onValueChange={(value) => setClarity(value[0])}
                    max={1}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Less Clear</span>
                    <span>More Clear</span>
                  </div>
                </div>

                {/* Exaggeration Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="exaggeration">Exaggeration</Label>
                    <span className="text-sm text-gray-500">{(exaggeration * 100).toFixed(0)}%</span>
                  </div>
                  <Slider
                    id="exaggeration"
                    value={[exaggeration]}
                    onValueChange={(value) => setExaggeration(value[0])}
                    max={1}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Natural</span>
                    <span>Exaggerated</span>
                  </div>
                </div>

                {/* Speed Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="speed">Speed</Label>
                    <span className="text-sm text-gray-500">{speed.toFixed(1)}x</span>
                  </div>
                  <Slider
                    id="speed"
                    value={[speed]}
                    onValueChange={(value) => setSpeed(value[0])}
                    min={0.5}
                    max={2.0}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>0.5x (Slow)</span>
                    <span>2.0x (Fast)</span>
                  </div>
                </div>

                {/* Format Selection */}
                <div className="space-y-2">
                  <Label>Output Format</Label>
                  <div className="flex space-x-2">
                    <Button
                      variant={format === 'mp3' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFormat('mp3')}
                      className="flex-1"
                    >
                      MP3
                    </Button>
                    <Button
                      variant={format === 'wav' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFormat('wav')}
                      className="flex-1"
                    >
                      WAV
                    </Button>
                  </div>
                </div>

                {/* Sample Rate */}
                <div className="space-y-2">
                  <Label htmlFor="sampleRate">Sample Rate</Label>
                  <Select value={sampleRate.toString()} onValueChange={(value) => setSampleRate(parseInt(value))}>`
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="8000">8 kHz</SelectItem>
                      <SelectItem value="16000">16 kHz</SelectItem>
                      <SelectItem value="22050">22 kHz</SelectItem>
                      <SelectItem value="24000">24 kHz</SelectItem>
                      <SelectItem value="44100">44 kHz</SelectItem>
                      <SelectItem value="48000">48 kHz</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Generate Button */}
            <Button
              size="lg"
              className="w-full"
              onClick={generateAudio}
              disabled={!text.trim() || !selectedVoice || isGenerating}
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Generate Audio
                </>
              )}
            </Button>
          </div>

          {/* Right Panel - Audio Waveform & Playback */}
          <div className="lg:col-span-2 space-y-6 overflow-y-auto">
            {/* Audio Player */}
            {audioUrl ? (
              <AudioWaveform
                audioUrl={audioUrl}
                autoPlay={false}
                showControls={true}
                showMetadata={true}
                showWaveform={true}
              />
            ) : (
              <Card className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                    <Info className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No Audio Generated Yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md">
                    Enter some text, select a voice, and click "Generate Audio" to create your speech synthesis.
                  </p>
                </div>
              </Card>
            )}

            {/* Generation History */}
            {generationHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Generations</CardTitle>
                  <CardDescription>
                    Your recent text-to-speech conversions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {generationHistory.slice(0, 5).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => {
                          setText(item.text)
                          setAudioUrl('')
                          setIsPlaying(false)
                        }}
                      >
                        <div className="flex-1">
                          <div className="text-sm font-medium truncate">{item.text}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {item.timestamp.toLocaleTimeString()} • {item.duration}s
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            setText(item.text)
                          }}
                        >
                          Use
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}