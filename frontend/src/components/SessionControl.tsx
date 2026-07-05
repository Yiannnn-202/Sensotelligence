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
    <section className="card control-panel">
      <div className="card-inner control-panel">
        <div className="control-header">
          <div>
            <p className="control-title">采集控制</p>
            <p className="metric-detail">模拟雷达输入参数，后续可替换为 TI 开发套件配置。</p>
          </div>
          <span className={`status-pill ${connected ? 'online' : 'danger'}`}>
            {connected ? 'backend online' : 'backend offline'}
          </span>
        </div>

        {!streaming ? (
          <>
            <div className="field-stack">
              <label className="range-field">
                <span>心率</span>
                <input
                  type="range"
                  min={40}
                  max={180}
                  value={hr}
                  onChange={event => setHr(Number(event.target.value))}
                />
                <span className="range-value">{hr}</span>
              </label>

              <label className="range-field">
                <span>呼吸率</span>
                <input
                  type="range"
                  min={5}
                  max={40}
                  value={rr}
                  onChange={event => setRr(Number(event.target.value))}
                />
                <span className="range-value">{rr}</span>
              </label>

              <label className="range-field">
                <span>噪声</span>
                <input
                  type="range"
                  min={0}
                  max={50}
                  value={Math.round(noise * 100)}
                  onChange={event => setNoise(Number(event.target.value) / 100)}
                />
                <span className="range-value">{noise.toFixed(2)}</span>
              </label>
            </div>

            <button className="button" type="button" onClick={() => onStart(hr, rr, noise)} disabled={!connected}>
              开始采集
            </button>
          </>
        ) : (
          <>
            <div className="card soft">
              <div className="card-inner">
                <div className="metric-detail">
                  模拟输入 HR <span className="accent mono">{groundTruth?.hr_bpm ?? hr}</span> bpm，
                  RR <span className="accent mono">{groundTruth?.rr_bpm ?? rr}</span> bpm。当前链路正在输出实时雷达帧。
                </div>
              </div>
            </div>
            <button className="button danger" type="button" onClick={onStop}>
              停止采集
            </button>
          </>
        )}
      </div>
    </section>
  )
}
