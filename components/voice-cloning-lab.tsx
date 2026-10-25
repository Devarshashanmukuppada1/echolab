'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { Upload, Mic, FileAudio, Play, Pause, Volume2, Check, X, AlertCircle, Clock, Music, Brain, Star, Info, Download, Trash2, Edit, Settings, Waveform } from 'lucide-react'
import { useAudioStore } from '@/stores/audio-store'
import { cn } from '@/lib/utils'
import { apiClient } from '@/lib/api'
import { getAudioDuration, isAudioFile, formatFileSize } from '@/lib/audio'

interface ProcessingStep {
  id: string
  title: string
  description: string
  status: 'pending' | 'processing' | 'completed' | 'error'
  duration?: number
}

interface AudioQualityMetrics {
  duration: number
  sampleRate: number
  format: string
  size: number
  qualityScore: number
  noiseLevel: number
  hasClipping: boolean
  spectralCentroid: number
  zeroCrossingRate: number
}

const processingSteps: ProcessingStep[] = [
  {
    id: 'upload',
    title: 'File Upload',
    description: 'Validate and process uploaded audio file',
    status: 'pending'
  },
  {
    id: 'enhancement',
    title: 'Quality Enhancement',
    description: 'Apply noise reduction and audio enhancement',
    status: 'pending'
  },
  {
    id: 'voice-detection',
    title: 'Voice Detection',
    description: 'Extract voice characteristics from audio sample',
    status: 'pending'
  },
  {
    id: 'training',
    title: 'Voice Training',
    description: 'Train the voice cloning model',
    status: 'pending'
  },
  {
    id: 'generation',
    title: 'Generation',
    description: 'Generate the cloned voice model',
    status: 'pending'
  },
]

export function VoiceCloningLab() {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [qualityMetrics, setQualityMetrics] = useState<AudioQualityMetrics | null>(null)
  const [validationWarnings, setValidationWarnings] = useState<string[]>([])

  // Form data
  const [voiceName, setVoiceName] = useState('')
  const [description, setDescription] = useState('')
  const [labels, setLabels] = useState<string[]>([])
  const [labelInput, setLabelInput] = useState('')
  const [noiseReduction, setNoiseReduction] = useState(true)
  const [qualityEnhancement, setQualityEnhancement] = useState(true)

  // Processing steps
  const [processingStepsState, setProcessingSteps] = useState<ProcessingStep[]>(processingSteps)

  const { addToHistory, setCurrentAudio } = useAudioStore()

  const resetProcessing = useCallback(() => {
    setProcessingSteps(processingSteps.map(step => ({ ...step, status: 'pending', duration: undefined })))
    setUploadProgress(0)
    setSelectedFile(null)
    setAudioUrl('')
    setQualityMetrics(null)
    setValidationWarnings([])
    setError(null)
  }, [])

  const validateAudioFile = useCallback(async (file: File): Promise<{ valid: boolean; warnings: string[] }> => {
    const warnings: string[] = []

    // Check file type
    if (!isAudioFile(file)) {
      return { valid: false, warnings: ['Unsupported audio format. Supported: MP3, WAV, FLAC, AAC'] }
    }

    // Check file size
    if (file.size > 50 * 1024 * 1024) {
      warnings.push('File size exceeds 50MB, may affect processing speed')
    } else if (file.size > 10 * 1024 * 1024) {
      warnings.push('Large file size may increase processing time')
    }

    try {
      const duration = await getAudioDuration(file)
      if (duration < 1) {
        return { valid: false, warnings: ['Audio too short (minimum 1 second)'] }
      }
      if (duration > 30) {
        warnings.push('Audio exceeds 30 seconds, consider shorter clips for better quality')
      }

      // Estimate quality based on duration
      const qualityScore = Math.min(duration / 30, 1) * 0.8
      if (qualityScore < 0.3) {
        warnings.push('Very short audio may not provide enough data for voice cloning')
      }

    } catch (err) {
      return { valid: false, warnings: ['Unable to analyze audio file'] }
    }

    return { valid: true, warnings }
  }, [])

  const analyzeAudioQuality = useCallback(async (file: File): Promise<AudioQualityMetrics> => {
    return new Promise((resolve) => {
      const audio = new Audio()
      const url = URL.createObjectURL(file)

      audio.addEventListener('loadedmetadata', () => {
        const duration = audio.duration
        const sampleRate = audio.sampleRate || 44100
        const size = file.size
        const format = file.type.includes('/') ? file.type.split('/')[1] : file.type

        // Simulate quality analysis
        const qualityScore = Math.random() * 0.5 + 0.5 // 0.5-1.0
        const noiseLevel = Math.random() * 0.3 // 0-0.3
        const hasClipping = Math.random() > 0.7 // 30% chance
        const spectralCentroid = Math.random() * 1000 + 500
        const zeroCrossingRate = Math.random() * 0.2

        const metrics: AudioQualityMetrics = {
          duration,
          sampleRate,
          format,
          size,
          qualityScore,
          noiseLevel,
          hasClipping,
          spectralCentroid,
          zeroCrossingRate,
        }

        URL.revokeObjectURL(url)
        resolve(metrics)
      })

      audio.addEventListener('error', () => {
        URL.revokeObjectURL(url)
        resolve({\n          duration: 0,\n          sampleRate: 44100,\n          format: file.type.split('/')[1] || file.type,\n          size: file.size,\n          qualityScore: 0,\n          noiseLevel: 1,\n          hasClipping: true,\n          spectralCentroid: 0,\n          zeroCrossingRate: 1,\n        })
      })

      audio.src = url
    })
  }, [])

  const handleFileUpload = useCallback(async (file: File) => {
    const validation = await validateAudioFile(file)

    if (!validation.valid) {
      setError(validation.warnings.join(', '))
      return
    }

    setValidationWarnings(validation.warnings)
    setSelectedFile(file)
    setError(null)

    // Analyze audio quality
    const metrics = await analyzeAudioQuality(file)
    setQualityMetrics(metrics)

    // Update processing steps
    setProcessingSteps(prev => prev.map((step, index) => {
      if (step.id === 'upload') {
        return { ...step, status: 'completed', duration: 0.5 }
      }
      if (step.id === 'enhancement' && (noiseReduction || qualityEnhancement)) {
        return { ...step, status: 'processing' }
      }
      return step
    }))
  }, [validateAudioFile, analyzeAudioQuality, noiseReduction, qualityEnhancement])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    const audioFile = files.find(isAudioFile)

    if (audioFile) {
      handleFileUpload(audioFile)
    } else {
      setError('Please upload a valid audio file (MP3, WAV, FLAC, AAC)')
    }
  }, [handleFileUpload])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileUpload(files[0])
    }
  }, [handleFileUpload])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const processVoiceClone = useCallback(async () => {
    if (!selectedFile || !voiceName.trim()) {
      setError('Please provide voice name and audio file')
      return
    }

    setIsProcessing(true)
    setError(null)

    // Start processing simulation
    const startTime = Date.now()

    try {
      // Update processing steps
      setProcessingSteps(prev => prev.map(step => {
        if (step.id === 'upload') return { ...step, status: 'completed', duration: 0.5 }
        if (step.id === 'enhancement') {
          setTimeout(() => {
            setProcessingSteps(s => s.map(s => s.id === 'enhancement' ? { ...s, status: 'completed', duration: 1.0 } : s))
          }, 1000)
          return { ...step, status: 'processing' }
        }
        if (step.id === 'voice-detection') {
          setTimeout(() => {
            setProcessingSteps(s => s.map(s => s.id === 'voice-detection' ? { ...s, status: 'completed', duration: 2.0 } : s))
          }, 2000)
          return { ...step, status: 'processing' }
        }
        if (step.id === 'training') {
          setTimeout(() => {
            setProcessingSteps(s => s.map(s => s.id === 'training' ? { ...s, status: 'completed', duration: 5.0 } : s))
          }, 5000)
          return { ...step, status: 'processing' }
        }
        if (step.id === 'generation') {
          setTimeout(() => {
            setProcessingSteps(s => s.map(s => s.id === 'generation' ? { ...s, status: 'completed', duration: 3.0 } : s))
          }, 8000)
          return { ...step, status: 'processing' }
        }
        return step
      }))

      // Simulate API call to clone voice
      const formData = new FormData()
      formData.append('audioFile', selectedFile)
      formData.append('voiceName', voiceName)
      formData.append('description', description)
      formData.append('labels', JSON.stringify(labels))
      formData.append('noiseReduction', noiseReduction.toString())
      formData.append('qualityEnhancement', qualityEnhancement.toString())

      // Mock API call with progress simulation
      const response = await apiClient.upload('/api/clone', selectedFile, {
        voiceName,
        description,
        labels: JSON.stringify(labels),
        noiseReduction: noiseReduction.toString(),
        qualityEnhancement: qualityEnhancement.toString(),
      })

      const processingTime = (Date.now() - startTime) / 1000

      // Generate preview audio
      const audioBlob = new Blob([new ArrayBuffer(1024 * 1024)], { type: 'audio/wav' }) // Mock
      const audioUrl = URL.createObjectURL(audioBlob)
      setAudioUrl(audioUrl)

      // Add to history
      const audioFile: any = {
        id: response.id || Date.now().toString(),
        name: `Cloned: ${voiceName}`,
        url: audioUrl,
        duration: qualityMetrics?.duration || 5,
        size: selectedFile.size,
        format: 'wav',
        sampleRate: qualityMetrics?.sampleRate || 44100,
        bitrate: 128000,
        createdAt: new Date().toISOString(),
        voiceId: response.id,
        voiceName: voiceName,
        metadata: {
          stability: qualityMetrics?.qualityScore || 0.8,
          clarity: 0.9 - (qualityMetrics?.noiseLevel || 0),
          exaggeration: 0.5,
          speed: 1.0,
          model: 'voice-cloning',
          language: 'en',
        }
      }
      addToHistory(audioFile)

      // Complete all processing steps
      setProcessingSteps(prev => prev.map(step => ({ ...step, status: 'completed' })))

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Voice cloning failed')
      setProcessingSteps(prev => prev.map(step =>
        step.status === 'processing' ? { ...step, status: 'error' } : step
      ))
    } finally {
      setIsProcessing(false)
    }
  }, [
    selectedFile, voiceName, description, labels, noiseReduction, qualityEnhancement,
    qualityMetrics, apiClient, addToHistory
  ])

  const addLabel = useCallback(() => {
    if (labelInput.trim() && !labels.includes(labelInput.trim())) {
      setLabels(prev => [...prev, labelInput.trim()])
      setLabelInput('')
    }
  }, [labelInput, labels])

  const removeLabel = useCallback((labelToRemove: string) => {
    setLabels(prev => prev.filter(label => label !== labelToRemove))
  }, [])

  const playAudio = useCallback(() => {
    setIsPlaying(!isPlaying)
    setCurrentAudio(selectedFile ? {\n      id: Date.now().toString(),\n      name: `Preview: ${selectedFile.name}`,\n      url: audioUrl || '',\n      duration: qualityMetrics?.duration || 0,\n      size: selectedFile.size,\n      format: qualityMetrics?.format || 'wav',\n      sampleRate: qualityMetrics?.sampleRate || 44100,\n      bitrate: 128000,\n      createdAt: new Date().toISOString(),\n    } : null)
  }, [isPlaying, selectedFile, audioUrl, qualityMetrics, setCurrentAudio])

  const getStatusColor = (status: ProcessingStep['status']) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-600'
      case 'processing': return 'bg-blue-100 text-blue-600 animate-pulse'
      case 'completed': return 'bg-green-100 text-green-600'
      case 'error': return 'bg-red-100 text-red-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const getStepIcon = (step: ProcessingStep['status']) => {
    switch (step.status) {
      case 'pending': return Clock
      case 'processing': return Waveform
      case 'completed': return Check
      case 'error': return X
      default: return Clock
    }
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Voice Cloning Lab</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Clone voices from audio samples with advanced quality enhancement
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Badge variant="secondary" className="bg-purple-50 text-purple-700 dark:bg-purple-900 dark:text-purple-200">
              <Brain className="h-3 w-3 mr-1" />
              AI Enhanced
            </Badge>
            <Badge variant="secondary" className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-200">
              <Star className="h-3 w-3 mr-1" />
              High Quality
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* Left Panel - Upload & Configuration */}
          <div className="lg:col-span-1 space-y-6 overflow-y-auto">
            {/* File Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Audio Upload</CardTitle>
                <CardDescription>
                  Upload a clean audio file to clone the voice
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Drop Zone */}
                <div
                  className={cn(
                    'border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer',
                    isDragging
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                  )}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => document.getElementById('file-input')?.click()}
                >
                  <div className="space-y-3">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto">
                      <Upload className="h-8 w-8 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Drop audio file here or click to browse
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        MP3, WAV, FLAC, AAC (max 50MB, 1-30 seconds)
                      </p>
                    </div>
                  </div>
                </div>

                <input
                  id="file-input"
                  type="file"
                  accept="audio/mp3,audio/mpeg,audio/wav,audio/flac,audio/aac"
                  onChange={handleFileInput}
                  className="hidden"
                />

                {/* Selected File */}
                {selectedFile && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                          <FileAudio className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium truncate">{selectedFile.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {formatFileSize(selectedFile.size)} • {qualityMetrics?.duration.toFixed(1) || 'N/A'}s
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedFile(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Quality Metrics */}
                    {qualityMetrics && (
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600 dark:text-gray-400">Quality Score:</span>
                          <span className={cn(
                            'font-medium',
                            qualityMetrics.qualityScore > 0.8 ? 'text-green-600' :
                            qualityMetrics.qualityScore > 0.6 ? 'text-yellow-600' : 'text-red-600'
                          )}>{\n                            (qualityMetrics.qualityScore * 100).toFixed(0)}%
                          </span>
                        </div>
                        <Progress value={qualityMetrics.qualityScore * 100} className="h-2" />

                        {qualityMetrics.noiseLevel > 0.2 && (
                          <div className="flex items-center text-xs text-yellow-600">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            High noise level detected
                          </div>
                        )}

                        {qualityMetrics.hasClipping && (
                          <div className="flex items-center text-xs text-red-600">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Audio clipping detected
                          </div>
                        )}
                      </div>
                    )}

                    {/* Validation Warnings */}
                    {validationWarnings.length > 0 && (
                      <div className="mt-3 space-y-1">
                        {validationWarnings.map((warning, index) => (
                          <div key={index} className="flex items-center text-xs text-yellow-600">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {warning}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Voice Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Voice Configuration</CardTitle>
                <CardDescription>
                  Define your cloned voice characteristics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="voice-name">Voice Name</Label>
                  <Input
                    id="voice-name"
                    placeholder="e.g., Professional Male, Custom Voice"
                    value={voiceName}
                    onChange={(e) => setVoiceName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe this voice and its characteristics..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[80px] resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="labels">Labels/Tags</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="labels"
                      placeholder="Add a tag..."
                      value={labelInput}
                      onChange={(e) => setLabelInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLabel())}
                    />
                    <Button variant="outline" size="sm" onClick={addLabel}>
                      Add
                    </Button>
                  </div>

                  {labels.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {labels.map((label) => (
                        <Badge
                          key={label}
                          variant="secondary"
                          className="flex items-center space-x-1"
                        >
                          <span>{label}</span>
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => removeLabel(label)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Processing Options */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Processing Options</CardTitle>
                <CardDescription>
                  Choose enhancement features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="noise-reduction">Noise Reduction</Label>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Remove background noise and improve clarity
                    </div>
                  </div>
                  <Switch
                    id="noise-reduction"
                    checked={noiseReduction}
                    onCheckedChange={setNoiseReduction}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="quality-enhancement">Quality Enhancement</Label>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Apply advanced audio enhancement algorithms
                    </div>
                  </div>
                  <Switch
                    id="quality-enhancement"
                    checked={qualityEnhancement}
                    onCheckedChange={setQualityEnhancement}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Process Button */}
            <Button
              size="lg"
              className="w-full"
              onClick={processVoiceClone}
              disabled={!selectedFile || !voiceName.trim() || isProcessing}
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Clone Voice
                </>
              )}
            </Button>

            {/* Reset Button */}
            <Button
              variant="outline"
              className="w-full"
              onClick={resetProcessing}
              disabled={isProcessing}
            >
              Reset Process
            </Button>
          </div>

          {/* Right Panel - Processing Steps & Preview */}
          <div className="lg:col-span-2 space-y-6 overflow-y-auto">
            {/* Processing Steps */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Processing Pipeline</CardTitle>
                <CardDescription>
                  Real-time status of voice cloning process
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {processingStepsState.map((step, index) => {
                    const Icon = getStepIcon(step.status)
                    const isActive = step.status === 'processing'

                    return (
                      <div key={step.id} className="flex items-center space-x-4">
                        <div className="flex items-center justify-center">
                          <div className={cn(
                            'w-10 h-10 rounded-full border-2 flex items-center justify-center',
                            step.status === 'completed' ? 'bg-green-50 border-green-200' :
                            step.status === 'error' ? 'bg-red-50 border-red-200' :
                            step.status === 'processing' ? 'bg-blue-50 border-blue-200' :
                            'bg-gray-50 border-gray-200'
                          )}
                          >
                            <Icon className={cn(
                              'h-5 w-5',
                              step.status === 'completed' ? 'text-green-600' :
                              step.status === 'error' ? 'text-red-600' :
                              step.status === 'processing' ? 'text-blue-600' :
                              'text-gray-400'
                            )} />
                          </div>
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-sm">{step.title}</h4>
                            {step.duration && (
                              <span className="text-xs text-gray-500">{\n                                step.duration.toFixed(1) + 's'
                              }</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {step.description}
                          </p>
                        </div>

                        <div className="ml-4">
                          <Badge className={cn('text-xs', getStatusColor(step.status))}
                            variant="secondary">
                            {step.status}
                          </Badge>
                        </div>

                        {index < processingStepsState.length - 1 && (
                          <div className="absolute left-5 mt-12 w-0.5 h-8 bg-gray-200 dark:bg-gray-700" />
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Overall Progress */}
                {isProcessing && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Overall Progress</span>
                      <span className="text-sm font-medium">
                        {processingStepsState.filter(s => s.status === 'completed').length} / {processingStepsState.length}
                      </span>
                    </div>
                    <Progress
                      value={(processingStepsState.filter(s => s.status === 'completed').length / processingStepsState.length) * 100}
                      className="h-2"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Audio Preview */}
            {audioUrl && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Voice Preview</CardTitle>
                  <CardDescription>
                    Preview your cloned voice
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Audio Waveform would go here */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
                      <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Music className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Voice model ready for testing
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {voiceName || 'Unnamed Voice'} • Generated from uploaded sample
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={playAudio}
                        >
                          {isPlaying ? (
                            <Pause className="h-4 w-4 mr-2" />
                          ) : (
                            <Play className="h-4 w-4 mr-2" />
                          )}
                          {isPlaying ? 'Pause' : 'Play'} Preview
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download Model
                        </Button>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="text-xs">
                          <Info className="h-3 w-3 mr-1" />
                          Quality: High
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          Ready
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Error Display */}
            {error && (
              <Card className="border-red-200 dark:border-red-800">
                <CardContent className="p-4">
                  <div className="flex items-center text-red-600 dark:text-red-400">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    <span className="text-sm font-medium">Error</span>
                  </div>
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    {error}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}