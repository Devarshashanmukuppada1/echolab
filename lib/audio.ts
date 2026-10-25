export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function getAudioDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const audio = new Audio()
    const url = URL.createObjectURL(file)

    audio.addEventListener('loadedmetadata', () => {
      resolve(audio.duration)
      URL.revokeObjectURL(url)
    })

    audio.addEventListener('error', () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load audio file'))
    })

    audio.src = url
  })
}

export function createAudioFromBuffer(audioBuffer: AudioBuffer): AudioBufferSourceNode {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  const source = audioContext.createBufferSource()
  source.buffer = audioBuffer
  source.connect(audioContext.destination)
  return source
}

export function getAudioQualityScore(audioBuffer: AudioBuffer): number {
  const channelData = audioBuffer.getChannelData(0)
  const rms = Math.sqrt(
    channelData.reduce((sum, sample) => sum + sample * sample, 0) / channelData.length
  )
  const normalizedRMS = Math.min(rms, 1)
  return normalizedRMS * 100
}

export function isAudioFile(file: File): boolean {
  const validTypes = [
    'audio/mp3',
    'audio/mpeg',
    'audio/wav',
    'audio/flac',
    'audio/aac',
    'audio/ogg',
    'audio/webm'
  ]

  return validTypes.includes(file.type) || file.type.startsWith('audio/')
}

export function generatePlaybackSpeedOptions() {
  return [
    { value: 0.5, label: '0.5x' },
    { value: 0.75, label: '0.75x' },
    { value: 1.0, label: '1.0x (Normal)' },
    { value: 1.25, label: '1.25x' },
    { value: 1.5, label: '1.5x' },
    { value: 2.0, label: '2.0x' }
  ]
}

export function getVoiceUseCaseColor(useCase: string): string {
  const colors: Record<string, string> = {
    professional: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    educational: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    entertainment: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    casual: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    multilingual: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    emotional: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
    nature: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
    storytelling: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    tech: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
    dramatic: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200',
    personal: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-900',
  }

  return colors[useCase.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
}