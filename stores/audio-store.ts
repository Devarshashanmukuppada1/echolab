import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { AudioFile } from '@/types/audio'

interface AudioState {
  currentAudio: AudioFile | null
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  playbackSpeed: number
  audioHistory: AudioFile[]
  isLoading: boolean
  error: string | null
}

interface AudioActions {
  setCurrentAudio: (audio: AudioFile | null) => void
  setIsPlaying: (isPlaying: boolean) => void
  setCurrentTime: (time: number) => void
  setDuration: (duration: number) => void
  setVolume: (volume: number) => void
  setPlaybackSpeed: (speed: number) => void
  addToHistory: (audio: AudioFile) => void
  removeFromHistory: (id: string) => void
  clearHistory: () => void
  clearError: () => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

const initialState: AudioState = {
  currentAudio: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  playbackSpeed: 1,
  audioHistory: [],
  isLoading: false,
  error: null,
}

const useAudioStore = create<AudioState & AudioActions>()(
  devtools(
    (set) => ({
      ...initialState,

      setCurrentAudio: (audio) => set({ currentAudio: audio }),
      setIsPlaying: (isPlaying) => set({ isPlaying }),
      setCurrentTime: (currentTime) => set({ currentTime }),
      setDuration: (duration) => set({ duration }),
      setVolume: (volume) => set({ volume }),
      setPlaybackSpeed: (playbackSpeed) => set({ playbackSpeed }),
      addToHistory: (audio) => set((state) => ({
        audioHistory: [audio, ...state.audioHistory].slice(0, 100) // Keep last 100 entries
      })),
      removeFromHistory: (id) => set((state) => ({
        audioHistory: state.audioHistory.filter(audio => audio.id !== id)
      })),
      clearHistory: () => set({ audioHistory: [] }),
      clearError: () => set({ error: null }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error, isLoading: false }),
      reset: () => set(initialState),
    }),
    { name: 'audio-store' }
  )
)

export { useAudioStore }