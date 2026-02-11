/**
 * Centralized HTTP client for Making Magic API
 * Auth, errors, retries, upload progress
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? ''
const API_KEY = process.env.NEXT_PUBLIC_API_KEY ?? ''

const MAX_RETRIES = 3
const RETRY_DELAY_MS = 1000

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public body?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

function getHeaders(init?: HeadersInit): Headers {
  const headers = new Headers(init)
  headers.set('Content-Type', 'application/json')
  if (API_KEY) {
    headers.set('x-api-key', API_KEY)
  }
  return headers
}

async function parseError(res: Response): Promise<{ message: string; code?: string; body?: unknown }> {
  try {
    const text = await res.text()
    if (text) {
      try {
        const b = JSON.parse(text)
        const msg = (b as { message?: string; error?: string })?.message ?? (b as { error?: string })?.error ?? res.statusText
        const code = (b as { code?: string })?.code
        return { message: String(msg), code, body: b }
      } catch {
        return { message: text.slice(0, 200) || res.statusText }
      }
    }
  } catch {
    // ignore
  }
  return { message: res.statusText }
}

async function doFetch<T>(
  url: string,
  options: RequestInit & { retries?: number } = {}
): Promise<T> {
  const { retries = MAX_RETRIES, ...init } = options
  const fullUrl = url.startsWith('http') ? url : `${API_URL}${url}`

  if (!API_URL && !url.startsWith('http')) {
    throw new ApiError('NEXT_PUBLIC_API_URL is not configured', 0)
  }

  const controller = new AbortController()
  const res = await fetch(fullUrl, {
    ...init,
    headers: init.headers instanceof Headers ? init.headers : getHeaders(init.headers),
    signal: controller.signal,
  } as RequestInit)

  if (!res.ok) {
    const { message, code, body } = await parseError(res)
    const err = new ApiError(message, res.status, code, body)
    if (retries > 0 && res.status >= 500 && res.status < 600) {
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS))
      return doFetch<T>(url, { ...options, retries: retries - 1 })
    }
    throw err
  }

  const ct = res.headers.get('content-type')
  if (ct?.includes('application/json')) {
    return res.json() as Promise<T>
  }
  return res.text() as unknown as T
}

export interface FetchOptions extends Omit<RequestInit, 'body'> {
  retries?: number
}

export async function apiGet<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { retries, ...init } = options
  return doFetch<T>(path, { ...init, method: 'GET', retries })
}

export async function apiPost<T>(path: string, body?: unknown, options: FetchOptions = {}): Promise<T> {
  const { retries, ...init } = options
  return doFetch<T>(path, {
    ...init,
    method: 'POST',
    body: body !== undefined ? JSON.stringify(body) : undefined,
    retries,
  })
}

export async function apiPut<T>(path: string, body?: unknown, options: FetchOptions = {}): Promise<T> {
  const { retries, ...init } = options
  return doFetch<T>(path, {
    ...init,
    method: 'PUT',
    body: body !== undefined ? JSON.stringify(body) : undefined,
    retries,
  })
}

export async function apiDelete<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { retries, ...init } = options
  return doFetch<T>(path, { ...init, method: 'DELETE', retries })
}

export interface UploadProgressOptions {
  onProgress?: (loaded: number, total: number) => void
}

export async function apiUpload<T>(
  path: string,
  file: File | Blob,
  fieldName = 'file',
  options: UploadProgressOptions = {}
): Promise<T> {
  const fullUrl = path.startsWith('http') ? path : `${API_URL}${path}`
  const formData = new FormData()
  formData.append(fieldName, file)

  const headers = new Headers()
  if (API_KEY) headers.set('x-api-key', API_KEY)

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && options.onProgress) {
        options.onProgress(e.loaded, e.total)
      }
    })

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const ct = xhr.getResponseHeader('content-type')
          const text = xhr.responseText
          resolve((ct?.includes('application/json') ? JSON.parse(text || '{}') : text) as T)
        } catch {
          resolve(xhr.responseText as unknown as T)
        }
      } else {
        let message = xhr.statusText
        try {
          const b = JSON.parse(xhr.responseText || '{}')
          message = (b as { message?: string })?.message ?? (b as { error?: string })?.error ?? message
        } catch {
          // ignore
        }
        reject(new ApiError(message, xhr.status))
      }
    })

    xhr.addEventListener('error', () => reject(new ApiError('Network error', 0)))
    xhr.addEventListener('abort', () => reject(new ApiError('Request aborted', 0)))

    xhr.open('POST', fullUrl)
    headers.forEach((v, k) => xhr.setRequestHeader(k, v))
    xhr.send(formData)
  })
}

export function getApiBaseUrl(): string {
  return API_URL
}

export function getAudioUrl(filePath: string): string {
  const base = API_URL.replace(/\/$/, '')
  const path = filePath.startsWith('/') ? filePath.replace(/^\//, '') : filePath
  return `${base}/audio/${path}`
}
