# EchoLab - AI Voice Cloning & Text-to-Speech Platform

## Overview
A fully functional, production-ready AI Voice Cloning and Text-to-Speech web platform inspired by ElevenLabs, featuring advanced voice synthesis, instant voice cloning, and real-time audio processing capabilities.

## Tech Stack
- **Frontend**: Next.js (App Router), React 19, TypeScript, Tailwind CSS, Shadcn UI / Radix UI
- **Audio Engine**: REA / SenseNova Voice Cloning API, WebSpeech API fallback, Web Audio API
- **State Management**: React Query, Zustand
- **Audio Visualization**: Wavesurfer.js, HTML5 Canvas
- **Build Tools**: Vite (via Next.js), Bun (optional)
- **Styling**: Tailwind CSS with dark mode support
- **Icons**: Lucide React

## Core Features

### 1. Voice Library & Famous Voice Explorer
- UI displaying voice cards (Famous Voices, Community Voices, Custom Clones)
- Filter controls (Gender, Accent, Use Case, Tone)
- Audio player controls to preview sample clips before selecting

### 2. Text-to-Speech (TTS) Studio Workspace
- Multi-line text input studio with character counter
- Dynamic controls panel:
  - Voice selector dropdown with instant search
  - Stability, Clarity, and Exaggeration sliders
  - Model selection (Multilingual, Expressive, Low-Latency)
- Real-time "Generate Audio" action
- Interactive Waveform Visualizer with playback controls

### 3. Instant Voice Cloning Lab
- Upload interface accepting clean audio files (.mp3, .wav) with drag-and-drop
- Metadata fields: Voice Name, Description, Tags
- Client-side validation: sample duration, background noise check
- Submission pipeline to `/api/clone-voice`

### 4. History & Projects Dashboard
- Log of all generated audio clips
- Capabilities to re-listen, download MP3s, view metadata, or delete entries

## Project Structure
```
EchoLab/
├── app/                    # Next.js App Router
│   ├── api/              # API route handlers
│   │   ├── tts.ts        # TTS endpoint
│   │   ├── voices.ts     # Voice management
│   │   └── clone.ts      # Voice cloning
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page
│   └── ...               # Other pages
├── components/            # UI components
│   ├── sidebar.tsx       # Navigation sidebar
│   ├── voice-card.tsx     # Voice display card
│   ├── audio-waveform.tsx # Audio player with waveform
│   ├── slider-control.tsx # Reusable slider component
│   └── studio-header.tsx  # Studio header component
├── hooks/                 # Custom hooks
│   ├── use-tts.ts         # TTS hook
│   ├── use-voice-clone.ts # Voice cloning hook
│   └── use-audio-player.ts # Audio player hook
├── lib/                   # Utility functions
│   ├── api.ts             # API client
│   ├── audio.ts           # Audio utilities
│   └── utils.ts           # General utilities
├── stores/                # Zustand stores
│   ├── voice-store.ts     # Voice state management
│   └── audio-store.ts     # Audio state management
├── types/                 # TypeScript types
│   ├── api.ts             # API types
│   ├── voice.ts           # Voice types
│   └── audio.ts           # Audio types
├── styles/                # Global styles
│   └── globals.css        # Tailwind CSS imports
├── package.json           # Project metadata
├── next.config.js          # Next.js configuration
└── .env.local.example      # Environment variables template
```

## Setup & Installation

### Prerequisites
- Node.js 18+
- npm or pnpm

### Installation Steps
1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `.env.local` file from `.env.local.example`
4. Start the development server:
   ```bash
   npm run dev
   ```

## Running Locally
1. Ensure all dependencies are installed
2. Configure API keys in `.env.local`:
   - `SENSENOVA_API_KEY`: Your SenseNova API key
   - `SENSENOVA_VOICE_ENDPOINT`: API endpoint URL
   - `NEXT_PUBLIC_APP_URL`: Your application URL
3. Run `npm run dev` to start the development server
4. Access the application at `http://localhost:3000`

## Development
- Use `npm run dev` for development mode
- Use `npm run build` for production builds
- Use `npm run start` to start the production server
- Use `npm run lint` for linting
- Use `npm run test` for running tests

## Environment Variables
```env
SENSENOVA_API_KEY=your_sensenova_api_key_here
SENSENOVA_VOICE_ENDPOINT=https://api.sensenova.cn/voice
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## API Routes
- `GET /api/voices`: Returns built-in, famous, and user-cloned voices
- `POST /api/tts`: Generate speech from text
- `POST /api/clone`: Upload audio for voice cloning

## Notes
- This is an ongoing project and will be updated with additional features
- The platform supports both API-driven and fallback browser-based audio generation
- Real-time audio processing capabilities are being developed
- Progress tracking is maintained in this README file

## License
This project is part of the EchoLab initiative for advancing voice AI capabilities.