'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { VoiceLibrary, Mic, History, Settings, Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useVoiceStore } from '@/stores/voice-store'
import { useEffect, useState } from 'react'

const sidebarItems = [
  {
    id: 'library',
    label: 'Voice Library',
    icon: VoiceLibrary,
    description: 'Browse built-in, famous, and custom voices',
  },
  {
    id: 'studio',
    label: 'TTS Studio',
    icon: Mic,
    description: 'Generate speech from text with voice controls',
  },
  {
    id: 'clone',
    label: 'Voice Cloning',
    icon: Settings,
    description: 'Clone voices from audio samples',
  },
  {
    id: 'history',
    label: 'History',
    icon: History,
    description: 'View your generated audio and cloned voices',
  },
]

interface SidebarProps {
  activeView: string
  onViewChange: (view: string) => void
}

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { voices, fetchVoices } = useVoiceStore()

  useEffect(() => {
    fetchVoices()
  }, [fetchVoices])

  return (
    <>
      {/* Mobile Toggle */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-72 transform bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800',
          'transition-transform duration-300 ease-in-out',
          'md:translate-x-0 md:static md:inset-auto',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Mic className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">EchoLab</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">AI Voice Platform</p>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 p-4 space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon
              const isActive = activeView === item.id

              return (
                <motion.button
                  key={item.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    onViewChange(item.id)
                    setIsOpen(false)
                  }}
                  className={cn(
                    'w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200',
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{item.label}</div>
                    <div className="text-xs truncate mt-0.5">{item.description}</div>
                  </div>
                  {isActive && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  )}
                </motion.button>
              )
            })}
          </nav>

          {/* Voice Count */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Voices</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {voices.length}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Built-in: 5 | Famous: 4 | Community: 2
              </div>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Overlay for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}