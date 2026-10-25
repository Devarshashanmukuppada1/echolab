"use client"

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/sidebar'
import { VoiceLibrary } from '@/components/voice-library'
import { TTSStudio } from '@/components/tts-studio'
import { VoiceCloningLab } from '@/components/voice-cloning-lab'
import { HistoryDashboard } from '@/components/history-dashboard'
import { useVoiceStore } from '@/stores/voice-store'
import { useTTS } from '@/hooks/use-tts'
import { useVoiceClone } from '@/hooks/use-voice-clone'
import { useAudioPlayer } from '@/hooks/use-audio-player'

export default function Page() {
  const [activeView, setActiveView] = useState('library')
  const [ttsText, setTtsText] = useState('')
  const { voices, fetchVoices } = useVoiceStore()
  const tts = useTTS()
  const clone = useVoiceClone()
  const player = useAudioPlayer()

  useEffect(() => {
    fetchVoices()
  }, [fetchVoices])

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      <main className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          {activeView === 'library' && (
            <VoiceLibrary
              voices={voices}
              onSelectVoice={(name) => tts.generate(name)}
              playAudio={player.playFromUrl}
              setCurrentTime={player.setCurrentTime}
              volume={player.volume}
              setVolume={player.setVolume}
            />
          )}
          {activeView === 'studio' && (
            <TTSStudio
              text={ttsText}
              setTtsText={setTtsText}
              ttsGenerate={tts.generate}
              isGenerating={tts.isGenerating}
              ttsResult={tts.lastResult}
              ttsError={tts.error}
              audioUrl={tts.lastResult?.audioUrl ?? null}
              playAudio={player.playFromUrl}
              setCurrentTime={player.setCurrentTime}
              volume={player.volume}
              setVolume={player.setVolume}
            />
          )}
          {activeView === 'clone' && (
            <VoiceCloningLab onSubmit={clone.cloneVoice} cloning={clone.cloning} error={clone.error} result={clone.lastResult} />
          )}
          {activeView === 'history' && <HistoryDashboard />}
        </div>
      </main>
    </div>
  )
}

let textToRefill = ''
export const __refill = () => (textToRefill = '')

