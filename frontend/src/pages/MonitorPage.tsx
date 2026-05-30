/**
 * 主监测页面 — 组合波形图、体征卡片和控制面板
 */
import { useWebSocket } from '../hooks/useWebSocket'
import WaveformChart from '../components/WaveformChart'
import VitalCard from '../components/VitalCard'
import SessionControl from '../components/SessionControl'

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

  return (
    <div style={{
      maxWidth: 1200,
      margin: '0 auto',
      padding: '24px 20px',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      gap: 20,
    }}>
      {/* Header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5 }}>
            🫁 Sensotelligence
          </h1>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
            生命体征监测 · Phase 0 — 骨架验证
          </p>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          fontSize: 12,
          color: 'var(--text-secondary)',
        }}>
          <span>
            WebSocket: <span style={{ color: connected ? '#66bb6a' : '#ef5350' }}>
              {connected ? 'ONLINE' : 'OFFLINE'}
            </span>
          </span>
          <span>
            数据点: <span style={{ color: 'var(--text-primary)' }}>{signalHistory.length}</span>
          </span>
          <span>
            当前值: <span style={{ color: '#4fc3f7' }}>{signal.toFixed(4)}</span>
          </span>
        </div>
      </header>

      {/* Main Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 280px',
        gap: 20,
        flex: 1,
      }}>
        {/* 波形图 — 占左侧主区域 */}
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius)',
          border: `1px solid var(--border)`,
          boxShadow: 'var(--shadow)',
          height: 420,
          padding: '12px 8px 8px 8px',
        }}>
          <WaveformChart data={signalHistory} streaming={streaming} />
        </div>

        {/* 右侧面板 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <SessionControl
            connected={connected}
            streaming={streaming}
            onStart={startSession}
            onStop={stopSession}
            groundTruth={groundTruth}
          />

          <VitalCard
            label="心率"
            value={null}  // Phase 1 算法接入后替换为真实提取值
            unit="BPM"
            color="#ef5350"
            groundTruth={groundTruth?.hr_bpm}
          />

          <VitalCard
            label="呼吸率"
            value={null}  // Phase 1 算法接入后替换为真实提取值
            unit="BPM"
            color="#4fc3f7"
            groundTruth={groundTruth?.rr_bpm}
          />
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        fontSize: 11,
        color: '#444',
        padding: '8px 0',
        borderTop: '1px solid var(--border)',
        marginTop: 'auto',
      }}>
        Sensotelligence v0.1.0 · Phase 0 — 架构骨架 · 信号来源: Simulator
      </footer>
    </div>
  )
}
