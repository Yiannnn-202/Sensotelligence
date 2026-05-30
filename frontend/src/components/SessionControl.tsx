/**
 * 采集控制面板 — 启动/停止监测，调整模拟参数
 */
import { useState } from 'react'

interface Props {
  connected: boolean
  streaming: boolean
  onStart: (hr: number, rr: number, noise: number) => void
  onStop: () => void
  groundTruth?: { hr_bpm: number; rr_bpm: number } | null
}

export default function SessionControl({ connected, streaming, onStart, onStop, groundTruth }: Props) {
  const [hr, setHr] = useState(72)
  const [rr, setRr] = useState(16)
  const [noise, setNoise] = useState(0.05)

  return (
    <div style={{
      background: 'var(--bg-card)',
      borderRadius: 'var(--radius)',
      padding: '20px 24px',
      border: `1px solid var(--border)`,
      boxShadow: 'var(--shadow)',
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontSize: 13,
        color: connected ? '#66bb6a' : 'var(--accent-danger)',
      }}>
        <span style={{
          width: 8, height: 8,
          borderRadius: '50%',
          background: connected ? '#66bb6a' : 'var(--accent-danger)',
          display: 'inline-block',
        }} />
        {connected ? '后端已连接' : '后端未连接'}
      </div>

      {!streaming ? (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={labelStyle}>
              心率 (BPM)
              <input
                type="range"
                min={40} max={180} value={hr}
                onChange={e => setHr(Number(e.target.value))}
                style={sliderStyle}
              />
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{hr}</span>
            </label>

            <label style={labelStyle}>
              呼吸率 (BPM)
              <input
                type="range"
                min={5} max={40} value={rr}
                onChange={e => setRr(Number(e.target.value))}
                style={sliderStyle}
              />
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{rr}</span>
            </label>

            <label style={labelStyle}>
              噪声水平
              <input
                type="range"
                min={0} max={50} value={Math.round(noise * 100)}
                onChange={e => setNoise(Number(e.target.value) / 100)}
                style={sliderStyle}
              />
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{noise.toFixed(2)}</span>
            </label>
          </div>

          <button
            onClick={() => onStart(hr, rr, noise)}
            disabled={!connected}
            style={{
              ...btnStyle,
              background: connected ? '#4fc3f7' : '#444',
              color: connected ? '#000' : '#888',
              cursor: connected ? 'pointer' : 'not-allowed',
            }}
          >
            ▶ 开始采集
          </button>
        </>
      ) : (
        <>
          {groundTruth && (
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', textAlign: 'center' }}>
              Ground Truth → HR: <span style={{ color: '#4fc3f7' }}>{groundTruth.hr_bpm}</span> bpm
              {' | '}
              RR: <span style={{ color: '#4fc3f7' }}>{groundTruth.rr_bpm}</span> bpm
            </div>
          )}
          <button
            onClick={onStop}
            style={{ ...btnStyle, background: 'var(--accent-danger)', color: '#fff' }}
          >
            ■ 停止采集
          </button>
        </>
      )}
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 10,
  fontSize: 13, color: 'var(--text-secondary)',
}

const sliderStyle: React.CSSProperties = {
  flex: 1, accentColor: '#4fc3f7',
}

const btnStyle: React.CSSProperties = {
  border: 'none',
  borderRadius: 6,
  padding: '10px 20px',
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'background 0.2s',
}
