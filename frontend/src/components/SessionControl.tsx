import { useState } from 'react'
import { Link } from 'react-router-dom'
import CardIcon from './CardIcon'

interface Props {
  connected: boolean
  streaming: boolean
  onStart: (hr: number, rr: number, noise: number) => void
  onStop: () => void
  groundTruth?: { hr_bpm: number; rr_bpm: number } | null
  showResultLink?: boolean
}

export default function SessionControl({ connected, streaming, onStart, onStop, groundTruth, showResultLink = false }: Props) {
  const [hr, setHr] = useState(72)
  const [rr, setRr] = useState(16)
  const [noise, setNoise] = useState(0.05)

  return (
    <section className="control-surface">
      <div className="control-copy">
        <CardIcon variant={streaming ? 'signal' : 'play'} />
        <span className={`data-badge ${connected ? 'live' : 'warn'}`}>
          {connected ? '服务已连接' : '等待后端服务'}
        </span>
        <h2>{streaming ? '检测正在进行' : '准备开始检测'}</h2>
        <p>
          请保持安静坐姿，胸腹部自然呼吸。当前版本使用模拟检测流，用来验证页面和实时链路。
        </p>
      </div>

      {!streaming ? (
        <>
          <div className="slider-grid" aria-label="演示参数">
            <label>
              <span>演示心率</span>
              <input
                type="range"
                min={40}
                max={180}
                value={hr}
                onChange={event => setHr(Number(event.target.value))}
              />
              <strong>{hr} bpm</strong>
            </label>
            <label>
              <span>演示呼吸</span>
              <input
                type="range"
                min={5}
                max={40}
                value={rr}
                onChange={event => setRr(Number(event.target.value))}
              />
              <strong>{rr} 次/分</strong>
            </label>
            <label>
              <span>环境干扰</span>
              <input
                type="range"
                min={0}
                max={50}
                value={Math.round(noise * 100)}
                onChange={event => setNoise(Number(event.target.value) / 100)}
              />
              <strong>{Math.round(noise * 100)}%</strong>
            </label>
          </div>
          <div className="control-actions">
            <button className="button primary" type="button" onClick={() => onStart(hr, rr, noise)} disabled={!connected}>
              开始检测
            </button>
            {showResultLink && <Link className="button secondary" to="/results">查看检测结果</Link>}
          </div>
        </>
      ) : (
        <>
          <div className="session-note">
            <span>当前输入</span>
            <strong>{groundTruth?.hr_bpm ?? hr} bpm</strong>
            <strong>{groundTruth?.rr_bpm ?? rr} 次/分</strong>
          </div>
          <div className="control-actions">
            <button className="button danger" type="button" onClick={onStop}>
              停止检测
            </button>
            {showResultLink && <Link className="button secondary" to="/results">查看检测结果</Link>}
          </div>
        </>
      )}
    </section>
  )
}
