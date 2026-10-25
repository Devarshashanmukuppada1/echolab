export class ApiClient {
  private baseURL: string
  private defaultHeaders: HeadersInit

  constructor(baseURL: string = '/api') {
    this.baseURL = baseURL
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const config: RequestInit = {
      headers: this.defaultHeaders,
      ...options,
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      if (response.headers.get('content-type')?.includes('audio/')) {
        const arrayBuffer = await response.arrayBuffer()
        return arrayBuffer as unknown as T
      }

      return response.json() as T
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Network request failed')
    }
  }

  async get<T>(endpoint: string, options?: RequestInit) {
    return this.request<T>(endpoint, { method: 'GET', ...options })
  }

  async post<T>(endpoint: string, data?: unknown, options?: RequestInit) {
    const body = data ? JSON.stringify(data) : undefined
    return this.request<T>(endpoint, {
      method: 'POST',
      body,
      ...options,
    })
  }

  async upload<T>(endpoint: string, file: File, additionalData?: Record<string, string>) {
    const formData = new FormData()
    formData.append('audioFile', file)

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value)
      })
    }

    const url = `${this.baseURL}${endpoint}`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...this.defaultHeaders,
        // Don't set Content-Type for FormData
      },
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Upload failed' }))
      throw new Error(errorData.error || `HTTP ${response.status}`)
    }

    return response.json() as T
  }
}

export const apiClient = new ApiClient()