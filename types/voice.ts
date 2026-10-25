export interface Voice {
  id: string
  name: string
  description: string
  gender: 'male' | 'female' | 'neutral'
  accent: string
  category: 'built-in' | 'famous' | 'community' | 'custom'
  sampleUrl: string
  language: string
  useCase: string
  tags: string[]
  isCloned: boolean
  isPremium: boolean
  downloadCount: number
  rating: number
  processingTime: number
  model: string
  voiceSettings?: {
    stability?: number
    clarity?: number
    exaggeration?: number
  }
}

export type VoiceCategory = Voice['category']
export type VoiceGender = Voice['gender']
export type VoiceModel = Voice['model']

export const VOICE_CATEGORIES: VoiceCategory[] = ['built-in', 'famous', 'community', 'custom']
export const VOICE_GENDERS: VoiceGender[] = ['male', 'female', 'neutral']

export const VOICE_MODELS = {
  'multilingual': {
    name: 'Multilingual',
    description: 'Supports multiple languages with high accuracy',
    idealFor: ['international content', 'global applications', 'multilingual projects']
  },
  'expressive': {
    name: 'Expressive',
    description: 'High emotional expressiveness and natural prosody',
    idealFor: ['storytelling', 'dramatic content', 'entertainment']
  },
  'low-latency': {
    name: 'Low Latency',
    description: 'Fast response times for real-time applications',
    idealFor: ['chat applications', 'voice assistants', 'interactive content']
  }
} as const

export const VOICE_USE_CASES = {
  professional: {
    description: 'Business presentations, professional content',
    idealVoiceTypes: ['stable', 'clear', 'authoritative']
  },
  educational: {
    description: 'Teaching materials, instructional content',
    idealVoiceTypes: ['slow', 'clear', 'instructive']
  },
  entertainment: {
    description: 'Stories, podcasts, entertainment content',
    idealVoiceTypes: ['expressive', 'engaging', 'dynamic']
  },
  casual: {
    description: 'Everyday conversation, informal content',
    idealVoiceTypes: ['natural', 'conversational', 'relaxed']
  },
  multilingual: {
    description: 'Content for multiple languages and regions',
    idealVoiceTypes: ['versatile', 'adaptable', 'flexible']
  },
  emotional: {
    description: 'Emotional storytelling, dramatic content',
    idealVoiceTypes: ['expressive', 'passionate', 'dramatic']
  },
  nature: {
    description: 'Nature documentaries, ambient content',
    idealVoiceTypes: ['calm', 'soothing', 'narrative']
  },
  tech: {
    description: 'Technical documentation, instructional videos',
    idealVoiceTypes: ['clear', 'precise', 'authoritative']
  },
  storytelling: {
    description: 'Narrative stories, audiobooks',
    idealVoiceTypes: ['engaging', 'dramatic', 'character-driven']
  },
  dramatic: {
    description: 'Dramatic readings, theatrical content',
    idealVoiceTypes: ['expressive', 'dynamic', 'character-driven']
  },
  personal: {
    description: 'Personal projects, voice memos',
    idealVoiceTypes: ['natural', 'personal', 'authentic']
  },
} as const

export const ACCENTS = {
  american: {
    name: 'American English',
    description: 'Standard American English pronunciation',
    idealFor: ['business', 'tech', 'education', 'general content']
  },
  british: {
    name: 'British English',
    description: 'British English pronunciation and accent',
    idealFor: ['formal content', 'education', 'documentaries']
  },
  australian: {
    name: 'Australian English',
    description: 'Australian English pronunciation and accent',
    idealFor: ['casual content', 'youth content', 'educational']
  },
  spanish: {
    name: 'Spanish',
    description: 'Spanish language with Latin American accent',
    idealFor: ['hispanic markets', 'multilingual content']
  },
  latin-american: {
    name: 'Latin American Spanish',
    description: 'Spanish with various Latin American regional accents',
    idealFor: ['latam markets', 'regional content', 'multilingual projects']
  },
  indian: {
    name: 'Indian English',
    description: 'Indian English pronunciation and rhythm',
    idealFor: ['indian markets', 'educational content', 'tech content']
  },
  multicultural: {
    name: 'Multicultural',
    description: 'Blend of various English accents',
    idealFor: ['global content', 'diverse audiences']
  },
  french: {
    name: 'French',
    description: 'French language and pronunciation',
    idealFor: ['french markets', 'international content']
  },
  german: {
    name: 'German',
    description: 'German language and pronunciation',
    idealFor: ['german markets', 'technical content']
  },
  japanese: {
    name: 'Japanese',
    description: 'Japanese language and pronunciation',
    idealFor: ['japanese markets', 'anime content']
  },
  chinese: {
    name: 'Chinese',
    description: 'Mandarin Chinese pronunciation',
    idealFor: ['chinese markets', 'multilingual content']
  },
} as const