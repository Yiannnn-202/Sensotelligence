import { useRef, useState, useCallback, useEffect } from 'react'

export interface ServerFrame {
  type: 'frame'
  timestamp: number
  payload: {
    frame_id: number
    signal: number
    range_profile: number[]
    ground_truth: { hr_bpm: number; rr_bpm: number }
  }
}

export interface ServerStatus {
  type: 'status'
  timestamp: number
  payload: { msg: string; session_id?: string; frame_count?: number }
}

export interface ServerError {
  type: 'error'
  timestamp: number
  payload: { msg: string }
}

export type ServerMessage = ServerFrame | ServerStatus | ServerError

interface UseWebSocketReturn {
  /** 最近一帧的信号值 */
  signal: number
  /** 信号历史 (最近 N 个点) */
  signalHistory: number[]
  /** 最近一帧的完整数据 */
  latestFrame: ServerFrame | null
  /** WebSocket 连接状态 */
  connected: boolean
  /** 当前是否在采集 */
  streaming: boolean
  /** 当前后端会话 ID */
  sessionId: string | null
  /** 最近一条状态消息 */
  statusMessage: string | null
  /** 最近一条错误消息 */
  lastError: string | null
  /** 模拟器预设值 (ground truth) */
  groundTruth: { hr_bpm: number; rr_bpm: number } | null
  /** 启动采集 */
  startSession: (hr?: number, rr?: number, noise?: number) => void
  /** 停止采集 */
  stopSession: () => void
}

const MAX_HISTORY = 1000 // 保留最近 1000 个数据点 (~50s @ 20fps)

export function useWebSocket(url: string = 'ws://localhost:8000/ws'): UseWebSocketReturn {
  const wsRef = useRef<WebSocket | null>(null)
  const [connected, setConnected] = useState(false)
  const [streaming, setStreaming] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [lastError, setLastError] = useState<string | null>(null)
  const [signal, setSignal] = useState(0)
  const [signalHistory, setSignalHistory] = useState<number[]>([])
  const [latestFrame, setLatestFrame] = useState<ServerFrame | null>(null)
  const [groundTruth, setGroundTruth] = useState<{ hr_bpm: number; rr_bpm: number } | null>(null)
  const streamingRef = useRef(false)
  const shouldReconnectRef = useRef(true)

  const connect = useCallback(() => {
    if (
      wsRef.current?.readyState === WebSocket.OPEN ||
      wsRef.current?.readyState === WebSocket.CONNECTING
    ) return

    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => {
      setConnected(true)
      setLastError(null)
      console.log('[WS] connected')
    }

    ws.onmessage = (event) => {
      try {
        const msg: ServerMessage = JSON.parse(event.data)
        if (msg.type === 'frame') {
          const frame = msg as ServerFrame
          setSignal(frame.payload.signal)
          setLatestFrame(frame)
          setSignalHistory(prev => {
            const next = [...prev, frame.payload.signal]
            return next.length > MAX_HISTORY ? next.slice(-MAX_HISTORY) : next
          })
          if (frame.payload.ground_truth) {
            setGroundTruth(frame.payload.ground_truth)
          }
        } else if (msg.type === 'status') {
          const status = msg as ServerStatus
          setStatusMessage(status.payload.msg)
          if (status.payload.session_id) {
            setSessionId(status.payload.session_id)
          }
          console.log('[WS] status:', status.payload.msg)
          if (status.payload.msg === 'stopped' || status.payload.msg === 'stopped_ok') {
            setStreaming(false)
            streamingRef.current = false
          }
        } else if (msg.type === 'error') {
          const error = msg as ServerError
          setLastError(error.payload.msg)
          setStreaming(false)
          streamingRef.current = false
          console.error('[WS] error:', error.payload.msg)
        }
      } catch (e) {
        console.error('[WS] parse error:', e)
      }
    }

    ws.onclose = () => {
      if (wsRef.current === ws) {
        wsRef.current = null
      }
      setConnected(false)
      setStreaming(false)
      streamingRef.current = false
      setStatusMessage('disconnected')
      console.log('[WS] disconnected')
      if (shouldReconnectRef.current) {
        setTimeout(() => {
          if (shouldReconnectRef.current && wsRef.current?.readyState !== WebSocket.OPEN) {
            connect()
          }
        }, 2000)
      }
    }

    ws.onerror = (e) => {
      console.error('[WS] error:', e)
    }
  }, [url])

  // 初始化连接
  useEffect(() => {
    shouldReconnectRef.current = true
    connect()
    return () => {
      shouldReconnectRef.current = false
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [connect])

  const startSession = useCallback((hr = 72, rr = 16, noise = 0.05) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'start_session',
        hr_bpm: hr,
        rr_bpm: rr,
        noise_level: noise,
      }))
      setStreaming(true)
      streamingRef.current = true
      setLastError(null)
      setStatusMessage('starting')
      setSignalHistory([]) // 清空历史
    }
  }, [])

  const stopSession = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'stop_session' }))
    }
    setStreaming(false)
    streamingRef.current = false
  }, [])

  return {
    signal,
    signalHistory,
    latestFrame,
    connected,
    streaming,
    sessionId,
    statusMessage,
    lastError,
    groundTruth,
    startSession,
    stopSession,
  }
}
