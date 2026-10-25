import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { Voice } from '@/types/voice'

interface VoiceState {
  voices: Voice[]
  selectedVoice: Voice | null
  isLoading: boolean
  error: string | null
  filters: {
    category: string | null
    gender: string | null
    accent: string | null
    useCase: string | null
    isPremium: boolean | null
    isCloned: boolean | null
  }
  searchQuery: string
  sortBy: 'rating' | 'downloadCount' | 'processingTime' | 'name'
  sortOrder: 'asc' | 'desc'
  clonedVoices: Voice[]
}

interface VoiceActions {
  fetchVoices: () => Promise<void>
  setSelectedVoice: (voice: Voice | null) => void
  updateFilters: (filters: Partial<VoiceState['filters']>) => void
  setSearchQuery: (query: string) => void
  setSortBy: (sortBy: string) => void
  setSortOrder: (sortBy: 'asc' | 'desc') => void
  addClonedVoice: (voice: Voice) => void
  clearError: () => void
}

const initialFilters = {
  category: null,
  gender: null,
  accent: null,
  useCase: null,
  isPremium: null,
  isCloned: null,
}

const useVoiceStore = create<VoiceState & VoiceActions>()(
  devtools(
    (set, get) => ({
      voices: [],
      selectedVoice: null,
      isLoading: false,
      error: null,
      filters: initialFilters,
      searchQuery: '',
      sortBy: 'rating',
      sortOrder: 'desc',
      clonedVoices: [],

      fetchVoices: async () => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch('/api/voices')
          if (!response.ok) {
            throw new Error('Failed to fetch voices')
          }
          const data = await response.json()
          set({ voices: data.voices, isLoading: false })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Unknown error',
            isLoading: false
          })
        }
      },

      setSelectedVoice: (voice) => set({ selectedVoice: voice }),

      updateFilters: (newFilters) => set((state) => ({
        filters: { ...state.filters, ...newFilters }
      })),

      setSearchQuery: (query) => set({ searchQuery: query.toLowerCase() }),

      setSortBy: (sortBy) => set((state) => ({
        sortBy: sortBy as VoiceState['sortBy'],
        sortOrder: state.sortBy === sortBy && state.sortOrder === 'desc'
          ? 'asc'
          : 'desc'
      })),

      setSortOrder: (sortOrder) => set({ sortOrder }),

      addClonedVoice: (voice) => set((state) => ({
        clonedVoices: [...state.clonedVoices, voice],
        voices: [...state.voices, voice]
      })),

      clearError: () => set({ error: null }),
    }),
    { name: 'voice-store' }
  )
)

export { useVoiceStore }