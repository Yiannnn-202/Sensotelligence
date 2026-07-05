import SessionControl from '../components/SessionControl'
import VitalCard from '../components/VitalCard'
import WaveformChart from '../components/WaveformChart'
import { useWebSocket } from '../hooks/useWebSocket'

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export default function MonitorPage() {
  const {
    signal,
    signalHistory,
    connected,
    streaming,
    groundTruth,
    startSession,
    stopSession,
  } = useWebSocket()

  const heartRate = streaming && groundTruth ? groundTruth.hr_bpm + signal * 1.8 : null
  const systolic = streaming ? Math.round(118 + signal * 5) : null
  const diastolic = streaming ? Math.round(74 + signal * 3) : null
  const confidence = streaming ? clamp(93 - Math.abs(signal) * 10, 78, 97) : 0
  const signalQuality = connected ? (streaming ? clamp(91 - Math.abs(signal) * 15, 64, 96) : 74) : 0
  const ppgWaveform = signalHistory.slice(-360).map((value, index) => {
    return value * 0.35 + Math.sin(index / 7) * 0.16 + Math.sin(index / 21) * 0.05
  })

  return (
    <main className="page">
      <header className="dashboard-header">
        <div>
          <span className="eyebrow">real-time monitoring center</span>
          <h1 className="page-title">雷达生命体征监测舱</h1>
          <p className="page-subtitle">
            当前接入模拟雷达流。界面已按目标系统展示设备状态、模型推理、血压、心率、PPG 和健康分析区域。
          </p>
        </div>
        <div className="status-line">
          <span className={`status-pill ${connected ? 'online' : 'danger'}`}>WebSocket {connected ? 'online' : 'offline'}</span>
          <span className={`status-pill ${streaming ? 'ok' : 'warn'}`}>{streaming ? 'streaming' : 'standby'}</span>
        </div>
      </header>

      <section className="grid cols-4">
        <VitalCard
          label="心率"
          value={heartRate}
          unit="bpm"
          detail="深度学习模型目标输出；当前由模拟雷达 ground truth 驱动。"
          badge={streaming ? 'live' : 'mock'}
        />
        <VitalCard
          label="血压"
          value={null}
          displayValue={systolic && diastolic ? `${systolic}/${diastolic}` : '--'}
          unit="mmHg"
          detail="收缩压 / 舒张压，目标由雷达到 PPG/血压模型反演。"
          badge={streaming ? 'estimated' : 'mock'}
        />
        <VitalCard
          label="信号质量"
          value={signalQuality}
          unit="%"
          detail={`${signalHistory.length} 个雷达帧进入前端缓存。`}
          status={signalQuality > 80 ? 'ok' : signalQuality > 50 ? 'warn' : 'danger'}
          badge="quality"
        />
        <VitalCard
          label="模型置信度"
          value={streaming ? confidence : null}
          unit="%"
          detail="推理服务接入后显示真实置信度和延迟。"
          status={confidence > 85 ? 'ok' : 'warn'}
          badge="confidence"
        />
      </section>

      <section className="dashboard-grid section">
        <div className="monitor-main">
          <article className="card chart-card">
            <WaveformChart
              data={signalHistory}
              streaming={streaming}
              title="radar phase stream"
              emptyText="启动采集后，毫米波雷达相位信号会在这里实时滚动。"
            />
          </article>

          <article className="card chart-card small">
            <WaveformChart
              data={ppgWaveform}
              streaming={streaming}
              title="reconstructed ppg waveform"
              color="#7aa7ff"
              min={-0.6}
              max={0.6}
              emptyText="PPG 波形区域已预留，真实模型接入后展示反演波形。"
            />
          </article>

          <div className="grid cols-2">
            <article className="card analysis-card">
              <div className="card-inner analysis-card">
                <span className="eyebrow">LLM health analysis</span>
                <h2 className="analysis-title">短期健康解释</h2>
                <p className="analysis-copy">
                  {streaming
                    ? '过去窗口内体征整体平稳，信号质量满足分析条件。建议继续静息采集以获得更稳定的血压和 PPG 趋势。'
                    : '启动监测后，大模型会基于心率、血压、PPG 稳定性和信号质量生成短期健康摘要。'}
                </p>
              </div>
            </article>
            <article className="card analysis-card">
              <div className="card-inner analysis-card">
                <span className="eyebrow">alert engine</span>
                <h2 className="analysis-title">异常监测</h2>
                <ul className="list">
                  <li>血压阈值与短时波动检测</li>
                  <li>心率异常和运动伪影提示</li>
                  <li>模型置信度过低时暂停健康建议</li>
                </ul>
              </div>
            </article>
          </div>
        </div>

        <aside className="side-stack">
          <SessionControl
            connected={connected}
            streaming={streaming}
            onStart={startSession}
            onStop={stopSession}
            groundTruth={groundTruth}
          />

          <article className="card">
            <div className="card-inner pipeline">
              <div className="control-header">
                <div>
                  <p className="control-title">实时链路</p>
                  <p className="metric-detail">从硬件到智能分析的流式系统状态。</p>
                </div>
              </div>
              {[
                ['01', '雷达输入', connected ? 'WebSocket connected' : 'Waiting for backend'],
                ['02', '帧解析', `${signalHistory.length} frames cached`],
                ['03', '模型推理', streaming ? 'mock inference running' : 'standby'],
                ['04', '健康分析', streaming ? 'summary available' : 'waiting vitals'],
              ].map(([index, name, desc]) => (
                <div className="pipeline-step" key={index}>
                  <span className="step-index">{index}</span>
                  <span>
                    <span className="step-name">{name}</span>
                    <span className="step-desc">{desc}</span>
                  </span>
                  <span className={`status-pill ${streaming || index === '01' ? 'ok' : 'warn'}`}>
                    {streaming || index === '01' ? 'active' : 'idle'}
                  </span>
                </div>
              ))}
            </div>
          </article>
        </aside>
      </section>
    </main>
  )
}
