import CinematicBackdrop from '../components/CinematicBackdrop'
import { GlassPanel, SectionHeader, SourceBadge } from '../components/FunctionalUI'
import PageBottomActions from '../components/PageBottomActions'

const statusCards = [
  ['signal', 'WebSocket /ws', 'Live', '实时事件通道', '检测页已经通过该通道接收模拟雷达帧、signal 和 ground truth。'],
  ['database', 'Simulator', 'Live', '后端模拟器', '当前没有真实 TI 硬件接入，使用模拟器验证前后端链路和实时交互。'],
  ['model', '前端演示估算', 'Derived', '体征展示层', '稳定性、信号质量等展示值由前端基于实时信号波动计算。'],
  ['shield', '报告分析服务', 'Planned', '后续服务', '大模型健康分析、正式报告生成和历史存储尚未接入生产链路。'],
] as const

const pipeline = [
  ['TI mmWave Radar', 'Planned'],
  ['Hardware Adapter', 'Planned'],
  ['Simulator Adapter', 'Live'],
  ['WebSocket Stream', 'Live'],
  ['Frontend Vital Dashboard', 'Live'],
  ['ML Vital Inference', 'Planned'],
  ['LLM Health Report', 'Planned'],
] as const

const nextSteps = [
  '后端新增 device_status 事件，推送帧率、延迟、丢帧和连接状态。',
  '统一 vital_signs 事件，返回心率、呼吸、PPG、置信度和信号质量。',
  '接入 TI 雷达帧解析与硬件适配器。',
  '部署 PyTorch / ONNX 生命体征反演模型。',
  '实现报告服务、历史存储和可导出的检测报告。',
]

function tone(source: string) {
  return source.toLowerCase() as 'live' | 'derived' | 'mock' | 'planned'
}

export default function DevicePage() {
  return (
    <main className="page professional-page cinematic-subpage functional-page">
      <CinematicBackdrop />
      <SectionHeader
        label="专业信息"
        title="技术细节"
        description="雷达帧和模型链路说明。这里集中说明当前系统真实接入了什么，哪些是前端演示，哪些是后续硬件和模型落地工作。"
      />

      <section className="professional-status-grid">
        {statusCards.map(([icon, title, source, subtitle, text]) => (
          <GlassPanel className="professional-card rich" icon={icon} badge={source} badgeTone={tone(source)} key={title}>
            <h2>{title}</h2>
            <strong>{subtitle}</strong>
            <p>{text}</p>
            <small>当前状态：{source === 'Live' ? '已在演示链路中使用' : source === 'Derived' ? '前端推导展示' : '后续真实落地'}</small>
          </GlassPanel>
        ))}
      </section>

      <GlassPanel className="system-flow-card" icon="model" badge="System Flow" badgeTone="planned">
        <h2>系统链路</h2>
        <p>下面区分了当前已有链路和后续计划链路，避免把演示数据误认为真实医疗模型输出。</p>
        <div className="pipeline-flow wide">
          {pipeline.map(([label, source]) => (
            <div className="pipeline-step" key={label}>
              <strong>{label}</strong>
              <SourceBadge tone={tone(source)}>{source}</SourceBadge>
            </div>
          ))}
        </div>
      </GlassPanel>

      <section className="professional-detail-grid">
        <GlassPanel className="source-legend-card" icon="database" badge="Data Labels" badgeTone="mock">
          <h2>数据来源说明</h2>
          <div className="source-grid">
            <p><strong>Live</strong> 当前前后端链路真实传输的数据或状态。</p>
            <p><strong>Derived</strong> 前端基于实时信号推导的展示值。</p>
            <p><strong>Mock</strong> 尚未接入服务前的演示内容。</p>
            <p><strong>Planned</strong> 后续真实硬件、模型或服务工作。</p>
          </div>
        </GlassPanel>

        <GlassPanel className="implementation-note" icon="shield" badge="Roadmap" badgeTone="planned">
          <h2>下一阶段真实落地需要补齐</h2>
          <div className="roadmap-list">
            {nextSteps.map((item, index) => (
              <p key={item}><span>{index + 1}</span>{item}</p>
            ))}
          </div>
        </GlassPanel>
      </section>

      <PageBottomActions
        title="返回主页"
        description="了解系统链路后，可以返回主页重新选择使用模式。"
        actions={[
          { label: '返回主页', to: '/', variant: 'primary' },
        ]}
      />
    </main>
  )
}
