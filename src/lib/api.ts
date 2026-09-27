const API_URL = import.meta.env.VITE_API_URL ?? '/api'

export class ApiError extends Error {
  status: number
  details: unknown

  constructor(message: string, status: number, details?: unknown) {
    super(message)
    this.status = status
    this.details = details
  }
}

function messageFromBody(body: unknown, fallback: string) {
  if (body && typeof body === 'object' && 'message' in body) {
    const message = (body as { message: string | string[] }).message
    if (Array.isArray(message)) {
      return message.join('. ')
    }
    if (typeof message === 'string') {
      return message
    }
  }
  return fallback
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token')
  const headers = new Headers(options.headers)
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_URL}${path}`, { ...options, headers })
  if (response.status === 401 && !path.startsWith('/auth/login')) {
    localStorage.removeItem('token')
    if (!window.location.pathname.startsWith('/login')) {
      window.location.assign('/login')
    }
  }

  if (response.status === 204) {
    return undefined as T
  }

  const body = await response.json().catch(() => null)
  if (!response.ok) {
    throw new ApiError(messageFromBody(body, 'Error de servidor'), response.status, body)
  }
  return body as T
}
