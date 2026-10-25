'use client'

import { useState, useEffect, useMemo } from 'react'
import { VoiceCard } from '@/components/voice-card'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider as SliderControl } from '@/components/ui/slider'
import { Filter, X, Search, Grid, List, Sliders, Volume2, Users, Star, Clock, Globe, Mic, Heart } from 'lucide-react'
import { useVoiceStore } from '@/stores/voice-store'
import { Voice } from '@/types/voice'
import { cn } from '@/lib/utils'

const categories = [
  { value: 'all', label: 'All Voices', count: 21 },
  { value: 'built-in', label: 'Built-in', count: 5 },
  { value: 'famous', label: 'Famous', count: 4 },
  { value: 'community', label: 'Community', count: 2 },
  { value: 'custom', label: 'Custom', count: 2 },
]

const genders = [
  { value: 'all', label: 'All Genders' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'neutral', label: 'Neutral' },
]

const accents = [
  { value: 'all', label: 'All Accents' },
  { value: 'american', label: 'American' },
  { value: 'british', label: 'British' },
  { value: 'spanish', label: 'Spanish' },
  { value: 'multilingual', label: 'Multilingual' },
]

const useCases = [
  { value: 'all', label: 'All Use Cases' },
  { value: 'professional', label: 'Professional' },
  { value: 'educational', label: 'Educational' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'casual', label: 'Casual' },
  { value: 'multilingual', label: 'Multilingual' },
  { value: 'emotional', label: 'Emotional' },
]

export function VoiceLibrary() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'premium'>('all')
  const [qualityFilter, setQualityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all')

  const {
    voices,
    filters,
    searchQuery,
    sortBy,
    sortOrder,
    updateFilters,
    setSearchQuery,
    setSortBy,
    setSortOrder,
    fetchVoices,
    isLoading,
    error,
  } = useVoiceStore()

  useEffect(() => {
    fetchVoices()
  }, [fetchVoices])

  const filteredVoices = useMemo(() => {
    let filtered = voices.filter((voice) => {
      // Search filter
      if (searchQuery && !voice.name.toLowerCase().includes(searchQuery) &&
          !voice.description.toLowerCase().includes(searchQuery)) {
        return false
      }

      // Category filter
      if (filters.category && filters.category !== 'all' && voice.category !== filters.category) {
        return false
      }

      // Gender filter
      if (filters.gender && filters.gender !== 'all' && voice.gender !== filters.gender) {
        return false
      }

      // Accent filter
      if (filters.accent && filters.accent !== 'all' && voice.accent !== filters.accent) {
        return false
      }

      // Use case filter
      if (filters.useCase && filters.useCase !== 'all' && voice.useCase !== filters.useCase) {
        return false
      }

      // Premium filter
      if (filters.isPremium !== null) {
        if (filters.isPremium && !voice.isPremium) return false
        if (!filters.isPremium && voice.isPremium) return false
      }

      // Cloned filter
      if (filters.isCloned !== null) {
        if (filters.isCloned && !voice.isCloned) return false
        if (!filters.isCloned && voice.isCloned) return false
      }

      // Price filter
      if (priceFilter === 'free' && voice.isPremium) return false
      if (priceFilter === 'premium' && !voice.isPremium) return false

      // Quality filter
      if (qualityFilter === 'high' && voice.rating < 4.5) return false
      if (qualityFilter === 'medium' && (voice.rating < 3.5 || voice.rating >= 4.5)) return false
      if (qualityFilter === 'low' && voice.rating >= 3.5) return false

      return true
    })

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue

      switch (sortBy) {
        case 'rating':
          aValue = a.rating
          bValue = b.rating
          break
        case 'downloadCount':
          aValue = a.downloadCount
          bValue = b.downloadCount
          break
        case 'processingTime':
          aValue = a.processingTime
          bValue = b.processingTime
          break
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        default:
          aValue = a.rating
          bValue = b.rating
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    return filtered
  }, [voices, searchQuery, filters, priceFilter, qualityFilter, sortBy, sortOrder])

  const clearFilters = () => {
    updateFilters({
      category: null,
      gender: null,
      accent: null,
      useCase: null,
      isPremium: null,
      isCloned: null,
    })
    setSearchQuery('')
    setPriceFilter('all')
    setQualityFilter('all')
  }

  const hasActiveFilters =
    searchQuery ||
    filters.category ||
    filters.gender ||
    filters.accent ||
    filters.useCase ||
    filters.isPremium !== null ||
    filters.isCloned !== null ||
    priceFilter !== 'all' ||
    qualityFilter !== 'all'

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Voice Library</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {filteredVoices.length} voices found
                {filteredVoices.length !== voices.length && ` (out of ${voices.length} total)`}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search voices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex border rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            {/* Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(hasActiveFilters && 'bg-blue-50 dark:bg-blue-900/20')}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2">
                  {[
                    filters.category, filters.gender, filters.accent, filters.useCase,
                    filters.isPremium, filters.isCloned, priceFilter, qualityFilter
                  ].filter(Boolean).length}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateFilters({ category: 'built-in' })}
          >
            Built-in
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateFilters({ isPremium: true })}
          >
            Premium
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateFilters({ isCloned: true })}
          >
            Custom Voices
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Filters Panel */}
        {showFilters && (
          <div className="w-80 border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Filters</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  disabled={!hasActiveFilters}
                >
                  Clear All
                </Button>
              </div>

              {/* Category Filter */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Select
                    value={filters.category || 'all'}
                    onValueChange={(value) => updateFilters({ category: value === 'all' ? null : value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label} ({category.count})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Gender Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Gender</label>
                  <Select
                    value={filters.gender || 'all'}
                    onValueChange={(value) => updateFilters({ gender: value === 'all' ? null : value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      {genders.map((gender) => (
                        <SelectItem key={gender.value} value={gender.value}>
                          {gender.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Accent Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Accent</label>
                  <Select
                    value={filters.accent || 'all'}
                    onValueChange={(value) => updateFilters({ accent: value === 'all' ? null : value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select accent" />
                    </SelectTrigger>
                    <SelectContent>
                      {accents.map((accent) => (
                        <SelectItem key={accent.value} value={accent.value}>
                          {accent.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Use Case Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Use Case</label>
                  <Select
                    value={filters.useCase || 'all'}
                    onValueChange={(value) => updateFilters({ useCase: value === 'all' ? null : value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select use case" />
                    </SelectTrigger>
                    <SelectContent>
                      {useCases.map((useCase) => (
                        <SelectItem key={useCase.value} value={useCase.value}>
                          {useCase.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Price</label>
                  <Select
                    value={priceFilter}
                    onValueChange={(value: 'all' | 'free' | 'premium') => setPriceFilter(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select price" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Quality Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Quality</label>
                  <Select
                    value={qualityFilter}
                    onValueChange={(value: 'all' | 'high' | 'medium' | 'low') => setQualityFilter(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select quality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="high">High (4.5+)</SelectItem>
                      <SelectItem value="medium">Medium (3.5-4.5)</SelectItem>
                      <SelectItem value="low">Low (Below 3.5)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Premium/Cloned Checkboxes */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="premium-filter"
                      checked={filters.isPremium === true}
                      onChange={(e) => updateFilters({ isPremium: e.target.checked ? true : null })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="premium-filter" className="text-sm font-medium">
                      Premium Voices
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="cloned-filter"
                      checked={filters.isCloned === true}
                      onChange={(e) => updateFilters({ isCloned: e.target.checked ? true : null })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="cloned-filter" className="text-sm font-medium">
                      Custom Cloned Voices
                    </label>
                  </div>
                </div>

                {/* Sort Options */}
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Sort By</label>
                    <Select
                      value={sortBy}
                      onValueChange={(value) => setSortBy(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rating">Rating</SelectItem>
                        <SelectItem value="downloadCount">Popularity</SelectItem>
                        <SelectItem value="processingTime">Processing Time</SelectItem>
                        <SelectItem value="name">Name</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Sort Order</span>
                    <div className="flex border rounded">
                      <Button
                        variant={sortOrder === 'asc' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setSortOrder('asc')}
                        className="rounded-r-none"
                      >
                        Ascending
                      </Button>
                      <Button
                        variant={sortOrder === 'desc' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setSortOrder('desc')}
                        className="rounded-l-none"
                      >
                        Descending
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Voice List/Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
              <span className="ml-3 text-gray-600 dark:text-gray-400">Loading voices...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="text-red-600 dark:text-red-400 mb-2">Error loading voices</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{error}</p>
                <Button onClick={fetchVoices} className="mt-4">
                  Retry
                </Button>
              </div>
            </div>
          ) : filteredVoices.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400 mb-2">No voices found</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">Try adjusting your filters</p>
                <Button onClick={clearFilters} className="mt-4">
                  Clear All Filters
                </Button>
              </div>
            </div>
          ) : (
            <div className={cn(
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
            )}>
              {filteredVoices.map((voice) => (
                <VoiceCard
                  key={voice.id}
                  voice={voice}
                  onSelect={() => {}}
                  showActions={true}
                  variant={viewMode === 'list' ? 'compact' : 'default'}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}