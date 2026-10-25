export interface AudioFile {
  id: string
  name: string
  url: string
  duration: number
  size: number
  format: 'mp3' | 'wav' | 'pcm'
  sampleRate: number
  bitrate: number
  createdAt: string
  voiceId?: string
  voiceName?: string
  metadata?: {
    stability?: number
    clarity?: number
    exaggeration?: number
    speed?: number
    model?: string
    language?: string
  }
}

export interface AudioGenerationRequest {
  text: string
  voiceId: string
  voiceSettings?: {
    stability?: number
    clarity?: number
    exaggeration?: number
    speed?: number
  }
  model?: string
  format?: 'mp3' | 'wav' | 'pcm'
  sampleRate?: number
}

export interface AudioGenerationResponse {
  id: string
  audioUrl: string
  duration: number
  size: number
  format: string
  metadata: AudioGenerationRequest
  createdAt: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
}

export interface VoiceCloneRequest {
  audioFile: File
  voiceName: string
  description: string
  labels: string[]
  metadata?: {
    duration: number
    sampleRate: number
    quality: number
    noiseReduction?: boolean
    qualityEnhancement?: boolean
  }
}

export interface VoiceCloneResponse {
  id: string
  voiceName: string
  description: string
  labels: string[]
  downloadUrl: string
  status: 'processing' | 'completed' | 'failed'
  createdAt: string
  processingTime: number
  metadata: {
    originalDuration: number
    processedDuration: number
    qualityScore: number
    noiseReduction: number
  }
}