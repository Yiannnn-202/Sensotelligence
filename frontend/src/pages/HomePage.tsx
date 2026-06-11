/**
 * HomePage — 平台主页面
 *
 * 展示 Sensotelligence 多维生命体征检测平台的核心能力和技术亮点。
 * 暗色科技风，包含 Hero 区、功能卡片区和 CTA 入口。
 */
import { useNavigate } from 'react-router-dom'

interface FeatureCard {
  icon: string
  title: string
  desc: string
  color: string
}

const features: FeatureCard[] = [
  {
    icon: '❤️',
    title: '心率监测',
    desc: '通过毫米波雷达非接触式实时提取心率及心率变异性 (HRV)，精度达 ±2 BPM',
    color: '#ef5350',
  },
  {
    icon: '🫁',
    title: '呼吸监测',
    desc: '高精度呼吸波形还原，实时追踪呼吸率，支持异常呼吸模式检测',
    color: '#4fc3f7',
  },
  {
    icon: '📈',
    title: '实时波形',
    desc: 'I/Q 双通道原始波形可视化，支持时域/频域双维度信号分析',
    color: '#66bb6a',
  },
  {
    icon: '🛡️',
    title: '非接触式',
    desc: '基于 TI 毫米波雷达，无穿戴、无隐私风险，适用于医疗及居家场景',
    color: '#ffb74d',
  },
]

const techHighlights = [
  { label: '雷达技术', value: 'TI IWR 毫米波' },
  { label: '算法引擎', value: 'FFT + CFAR + 相位解调' },
  { label: '采样率', value: '20 fps (50ms/帧)' },
  { label: '部署模式', value: '一体机 / 分布式' },
]

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div style={containerStyle}>
      {/* ──────── 导航栏 ──────── */}
      <nav style={navStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>📡</span>
          <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: -0.5 }}>
            Sensotelligence
          </span>
        </div>
        <div style={{ display: 'flex', gap: 24, fontSize: 13, color: 'var(--text-secondary)' }}>
          <span style={{ cursor: 'default' }}>功能</span>
          <span style={{ cursor: 'default' }}>技术</span>
          <span style={{ cursor: 'default' }}>关于</span>
        </div>
      </nav>

      {/* ──────── Hero 区 ──────── */}
      <section style={heroStyle}>
        <div style={{
          width: 100,
          height: 100,
          borderRadius: 28,
          background: 'linear-gradient(135deg, #4fc3f7 0%, #1a6b8a 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 44,
          marginBottom: 32,
          boxShadow: '0 8px 40px rgba(79, 195, 247, 0.25)',
        }}>
          📡
        </div>

        <h1 style={{
          fontSize: 44,
          fontWeight: 800,
          letterSpacing: -1,
          lineHeight: 1.15,
          textAlign: 'center',
          marginBottom: 16,
        }}>
          非接触式<br />
          <span style={{
            background: 'linear-gradient(135deg, #4fc3f7 20%, #66bb6a 80%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            多维生命体征检测平台
          </span>
        </h1>

        <p style={{
          fontSize: 16,
          color: 'var(--text-secondary)',
          textAlign: 'center',
          maxWidth: 520,
          lineHeight: 1.7,
          marginBottom: 40,
        }}>
          基于 <strong style={{ color: 'var(--text-primary)' }}>TI 毫米波雷达</strong> 的非接触式生命体征监测方案。
          无需穿戴设备，实时提取心率、呼吸率、心率变异性等多维生理参数，
          为医疗健康和远程监护提供精准数据支撑。
        </p>

        <div style={{ display: 'flex', gap: 14 }}>
          <button
            onClick={() => navigate('/monitor')}
            style={ctaBtnStyle}
          >
            🚀 进入监测中心
          </button>
          <button
            onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
            style={{
              ...ctaBtnStyle,
              background: 'transparent',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
          >
            了解更多 ↓
          </button>
        </div>
      </section>

      {/* ──────── 功能卡片区 ──────── */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px 60px' }}>
        <h2 style={{
          textAlign: 'center',
          fontSize: 26,
          fontWeight: 700,
          marginBottom: 8,
        }}>
          核心能力
        </h2>
        <p style={{
          textAlign: 'center',
          color: 'var(--text-secondary)',
          fontSize: 14,
          marginBottom: 40,
        }}>
          多维度 · 非接触 · 高精度
        </p>

        <div style={cardGridStyle}>
          {features.map((f, i) => (
            <div key={i} style={{
              ...featureCardStyle,
              borderTop: `3px solid ${f.color}`,
            }}>
              <span style={{ fontSize: 36, marginBottom: 12, display: 'block' }}>
                {f.icon}
              </span>
              <h3 style={{
                fontSize: 15,
                fontWeight: 700,
                marginBottom: 8,
                color: 'var(--text-primary)',
              }}>
                {f.title}
              </h3>
              <p style={{
                fontSize: 13,
                color: 'var(--text-secondary)',
                lineHeight: 1.65,
              }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ──────── 技术参数区 ──────── */}
      <section style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: '0 20px 80px',
      }}>
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          padding: '40px 48px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 28,
        }}>
          {techHighlights.map((t, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: 11,
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: 1,
                marginBottom: 6,
              }}>
                {t.label}
              </div>
              <div style={{
                fontSize: 15,
                fontWeight: 600,
                color: 'var(--text-primary)',
              }}>
                {t.value}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ──────── Footer ──────── */}
      <footer style={{
        textAlign: 'center',
        padding: '24px 20px',
        borderTop: '1px solid var(--border)',
        fontSize: 12,
        color: '#555',
      }}>
        Sensotelligence v0.1.0 · Phase 0 — 架构骨架 · 基于 TI 毫米波雷达
      </footer>
    </div>
  )
}

// ────────────────────── 内联样式 ──────────────────────

const containerStyle: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
}

const navStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  maxWidth: 1100,
  margin: '0 auto',
  width: '100%',
  padding: '18px 20px',
}

const heroStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '56px 20px 80px',
  maxWidth: 1100,
  margin: '0 auto',
  width: '100%',
}

const cardGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: 20,
}

const featureCardStyle: React.CSSProperties = {
  background: 'var(--bg-card)',
  borderRadius: 'var(--radius)',
  padding: '28px 24px 24px',
  border: '1px solid var(--border)',
  boxShadow: 'var(--shadow)',
  transition: 'transform 0.2s, box-shadow 0.2s',
}

const ctaBtnStyle: React.CSSProperties = {
  padding: '14px 36px',
  fontSize: 15,
  fontWeight: 700,
  border: 'none',
  borderRadius: 10,
  cursor: 'pointer',
  background: 'linear-gradient(135deg, #4fc3f7, #1a6b8a)',
  color: '#fff',
  transition: 'transform 0.15s, box-shadow 0.15s',
  boxShadow: '0 4px 20px rgba(79, 195, 247, 0.3)',
}
