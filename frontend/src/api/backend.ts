export interface BackendStatus {
  backend: string
  version: string
  radar_connected: boolean
  session_active: boolean
  current_session_id?: string | null
}

export interface SessionDetail {
  session_id: string
  adapter: string
  source: string
  active: boolean
  started_at: number | null
  stopped_at: number | null
  duration_s: number
  frame_count: number
  config: {
    hr_bpm?: number
    rr_bpm?: number
    noise_level?: number
  }
}

async function requestJson<T>(path: string): Promise<T> {
  const response = await fetch(path)
  if (!response.ok) {
    throw new Error(`Backend request failed: ${response.status}`)
  }
  return response.json() as Promise<T>
}

export function getBackendStatus() {
  return requestJson<BackendStatus>('/api/status')
}

export function getSessionDetail(sessionId: string) {
  return requestJson<SessionDetail>(`/api/session/${sessionId}`)
}
