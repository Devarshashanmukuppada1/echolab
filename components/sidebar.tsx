'use client'

import { useState } from 'react'
import { Grid, FileText, Mic, History, Settings, Volume2, Play, Pause, Music, Crown, Users, Clock, BarChart3, Download, Trash2, Filter, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  activeView: string
  onViewChange: (view: string) => void
}

const navItems = [
  {
    id: 'library',
    label: 'Voice Library',
    icon: Grid,
    description: 'Browse and search voices'
  },
  {
    id: 'studio',
    label: 'TTS Studio',
    icon: FileText,
    description: 'Generate speech from text'
  },
  {
    id: 'clone',
    label: 'Voice Cloning Lab',
    icon: Mic,
    description: 'Upload and process audio'
  },
  {
    id: 'history',
    label: 'History & Projects',
    icon: History,
    description: 'View audio history and stats'
  }
]

const quickStats = [
  { icon: Music, label: 'Active Voices', value: 24, color: 'text-blue-600' },
  { icon: Crown, label: 'Premium', value: 8, color: 'text-yellow-600' },
  { icon: Users, label: 'Custom', value: 12, color: 'text-green-600' },
  { icon: Clock, label: 'Today', value: 156, color: 'text-purple-600' }
]

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <aside className={cn(
      'h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800',
      'transition-all duration-300 ease-in-out',
      isCollapsed ? 'w-20' : 'w-72'
    )}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            {!isCollapsed && (
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  EchoLab
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Voice AI Platform
                </p>
              </div>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {isCollapsed ? '→' : '←'}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6">
          {!isCollapsed && (
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                Navigation
              </h3>
              <div className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = activeView === item.id
                  return (
                    <button
                      key={item.id}
                      onClick={() => onViewChange(item.id)}
                      className={cn(
                        'w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200',
                        'hover:bg-gray-100 dark:hover:bg-gray-800',
                        isActive
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                          : 'text-gray-700 dark:text-gray-300'
                      )}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      {!isCollapsed && (
                        <div className="text-left">
                          <div className="font-medium">{item.label}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {item.description}
                          </div>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Quick Stats - Collapsed Version */}
          {isCollapsed && (
            <div className="space-y-3 mb-6">
              {quickStats.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <div
                    key={index}
                    className="flex flex-col items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
                  >
                    <Icon className={cn('h-5 w-5 mb-1', stat.color)} />
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {stat.label}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </nav>

        {/* Quick Actions */}
        {!isCollapsed && (
          <div className="px-4 py-6 border-t border-gray-200 dark:border-gray-800">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button className="flex items-center px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                <Volume2 className="h-4 w-4 mr-2" />
                <span className="text-sm">Voice Settings</span>
              </button>
              <button className="flex items-center px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                <BarChart3 className="h-4 w-4 mr-2" />
                <span className="text-sm">Analytics</span>
              </button>
              <button className="flex items-center px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                <Download className="h-4 w-4 mr-2" />
                <span className="text-sm">Export</span>
              </button>
              <button className="flex items-center px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                <Trash2 className="h-4 w-4 mr-2" />
                <span className="text-sm">Clear Cache</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-800">
          {!isCollapsed && (
            <div className="text-center">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                EchoLab v1.0.0
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500">
                © 2024 Voice AI Technologies
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}