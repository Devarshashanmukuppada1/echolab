"use server"

import { NextRequest, NextResponse } from 'next/server'
import { createReadStream } from 'fs'
import { join } from 'path'
import { spawn } from 'child_process'
import wav from 'wav'
import { createWriteStream, readFileSync } from 'fs'
import { join as pathJoin } from 'path'
import { v4 as uuidv4 } from 'uuid'

interface TTSRequest {
  text: string
  voice: string
  model: string
  stability?: number
  clarity?: number
  exaggeration?: number
  speed?: number
  format?: 'mp3' | 'wav' | 'pcm'
  sampleRate?: number
}

interface SenseNovaTTSResponse {
  audio: Buffer
  format: string
  sampleRate: number
  duration: number
}

const SENSE_NOVA_API_KEY = process.env.SENSENOVA_API_KEY
const SENSE_NOVA_TTS_ENDPOINT = process.env.SENSENOVA_TTS_ENDPOINT || 'https://api.sensenova.cn/tts'
const NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// Helper function to validate audio buffer and convert to WAV if needed
async function validateAndProcessAudio(audioBuffer: Buffer, format: string, sampleRate: number): Promise<Buffer> {
  if (format === 'wav') {
    return audioBuffer
  }

  try {
    // Convert to WAV if not already
    const tempPath = pathJoin(process.cwd(), 'temp', `${uuidv4()}.wav`)
    const tempDir = pathJoin(process.cwd(), 'temp')

    if (!wav.WritableStream) {
      const fs = await import('fs')
      const wavModule = await import('wav')
      global.wave = wavModule
    }

    const writer = wav.WritableStream ? new wav.WritableStream() : null

    if (!writer) {
      throw new Error('WAV writer not available')
    }

    const tempFile = pathJoin(tempDir, `${uuidv4()}.wav`)

    return new Promise((resolve, reject) => {
      const writerInstance = new wav.FileWriter(tempFile, {
        sampleRate,
        channels: 1,
        bitDepth: 16,
      })

      writerInstance.on('finish', () => {
        const wavBuffer = readFileSync(tempFile)
        resolve(wavBuffer)
      })

      writerInstance.on('error', (err) => {
        reject(err)
      })

      writerInstance.write(audioBuffer)
      writerInstance.end()
    })
  } catch (error) {
    console.error('Audio processing error:', error)
    return audioBuffer
  }
}

// Fallback to browser-compatible TTS generation
async function generateFallbackTTS(request: TTSRequest): Promise<SenseNovaTTSResponse> {
  try {
    // Use OpenAI TTS API as fallback if available
    const OpenAI = require('openai')
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const response = await openai.audio.speech.create({
      model: 'tts-1',
      voice: request.voice === 'alloy' ? 'nova' : request.voice,
      input: request.text,
      speed: request.speed || 1.0,
      response_format: request.format || 'mp3',
    })

    const audioBuffer = Buffer.from(await response.arrayBuffer())

    return {
      audio: audioBuffer,
      format: request.format || 'mp3',
      sampleRate: request.sampleRate || 24000,
      duration: Math.ceil(request.text.length / 10), // rough estimation
    }
  } catch (error) {
    console.error('Fallback TTS error:', error)
    throw new Error('All TTS generation methods failed')
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const ttsRequest: TTSRequest = body

    // Validate request
    if (!ttsRequest.text || !ttsRequest.voice) {
      return NextResponse.json(
        { error: 'Missing required fields: text, voice' },
        { status: 400 }
      )
    }

    // Check if SenseNova API key is available
    if (!SENSE_NOVA_API_KEY) {
      console.log('SenseNova API key not found, using fallback TTS')
      const fallbackResponse = await generateFallbackTTS(ttsRequest)

      return new NextResponse(fallbackResponse.audio, {
        headers: {
          'Content-Type': fallbackResponse.format === 'wav' ? 'audio/wav' : 'audio/mpeg',
          'Content-Length': fallbackResponse.audio.length.toString(),
          'Cache-Control': 'public, max-age=31536000',
          'X-Audio-Duration': fallbackResponse.duration.toString(),
        },
      })
    }

    // Call SenseNova API
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

    try {
      const response = await fetch(SENSE_NOVA_TTS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SENSE_NOVA_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: ttsRequest.text,
          voice: ttsRequest.voice,
          model: ttsRequest.model || 'sense-s1',
          speed: ttsRequest.speed || 1.0,
          voice_settings: {
            stability: ttsRequest.stability || 0.5,
            clarity: ttsRequest.clarity || 0.8,
            exaggeration: ttsRequest.exaggeration || 0.3,
          },
          audio_settings: {
            format: ttsRequest.format || 'mp3',
            sample_rate: ttsRequest.sampleRate || 24000,
            bitrate: 128000,
          },
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('SenseNova API error:', errorText)
        throw new Error(`SenseNova API error: ${response.status} - ${errorText}`)
      }

      const audioBuffer = Buffer.from(await response.arrayBuffer())

      if (!audioBuffer || audioBuffer.length === 0) {
        throw new Error('Empty audio response from SenseNova API')
      }

      // Process and validate audio
      const processedAudio = await validateAndProcessAudio(
        audioBuffer,
        ttsRequest.format || 'mp3',
        ttsRequest.sampleRate || 24000
      )

      // Return streaming response
      return new NextResponse(processedAudio, {
        headers: {
          'Content-Type': ttsRequest.format === 'wav' ? 'audio/wav' : 'audio/mpeg',
          'Content-Length': processedAudio.length.toString(),
          'Cache-Control': 'public, max-age=31536000, immutable',
          'X-Audio-Source': 'sensenova',
          'X-Processing-Time': Date.now().toString(),
        },
      })

    } catch (fetchError) {
      clearTimeout(timeoutId)
      console.error('Fetch error:', fetchError)

      // Fallback to browser-compatible generation
      const fallbackResponse = await generateFallbackTTS(ttsRequest)

      return new NextResponse(fallbackResponse.audio, {
        headers: {
          'Content-Type': fallbackResponse.format === 'wav' ? 'audio/wav' : 'audio/mpeg',
          'Content-Length': fallbackResponse.audio.length.toString(),
          'Cache-Control': 'public, max-age=31536000',
          'X-Audio-Source': 'fallback',
          'X-Fallback-Reason': fetchError instanceof Error ? fetchError.message : 'Unknown error',
        },
      })
    }

  } catch (error) {
    console.error('TTS generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate speech', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  // Health check endpoint
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    endpoints: {
      tts: 'POST /api/tts',
      voices: 'GET /api/voices',
    },
  })
}