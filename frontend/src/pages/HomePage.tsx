import { Link } from 'react-router-dom'

const capabilities = [
  {
    title: '毫米波雷达非接触采集',
    desc: '接入 TI 开发套件，采集人体微动雷达信号，为无穿戴生命体征监测提供硬件入口。',
    meta: 'Sensing layer',
  },
  {
    title: '深度学习体征反演',
    desc: '预留 VitalInferenceService，将雷达时间窗映射为心率、血压、PPG 波形与置信度。',
    meta: 'Model layer',
  },
  {
    title: '大模型健康分析',
    desc: '基于结构化体征摘要输出短期风险解释、健康建议和会话报告，而不阻塞实时链路。',
    meta: 'AI analysis',
  },
  {
    title: '长期健康管理',
    desc: '沉淀用户档案、历史趋势、异常记录和报告系统，展示完整 IoT 健康闭环。',
    meta: 'Care loop',
  },
]

const pipeline = [
  ['01', 'TI mmWave Radar', '硬件感知人体微动信号'],
  ['02', 'Frame parser', '解析串口/USB 数据帧'],
  ['03', 'DL inference', '输出 HR / BP / PPG'],
  ['04', 'LLM analysis', '生成健康解释与建议'],
  ['05', 'Care management', '报告、告警、长期趋势'],
]

export default function HomePage() {
  return (
    <main className="page">
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">IoT health intelligence platform</span>
          <h1 className="hero-title">
            非接触式 <span>多维生命体征</span> 智能监测平台
          </h1>
          <p className="hero-lede">
            Sensotelligence 打通 TI 毫米波雷达、深度学习体征反演和大模型健康分析，
            将硬件数据流转换为心率、血压、PPG 波形、风险解释与长期健康管理能力。
          </p>
          <div className="hero-actions">
            <Link className="button" to="/monitor">进入实时监测</Link>
            <Link className="button secondary" to="/device">查看设备链路</Link>
          </div>
        </div>

        <div className="hero-visual" aria-label="系统雷达感知示意">
          <div className="radar-orb" />
          <article className="floating-card one">
            <div className="floating-kicker">model output</div>
            <div className="floating-value">118/74</div>
            <div className="floating-meta">血压估计 · 置信度 93% · 信号质量稳定</div>
          </article>
          <article className="floating-card two">
            <div className="floating-kicker">stream status</div>
            <div className="floating-value">20 fps</div>
            <div className="floating-meta">雷达帧率 · WebSocket 实时事件流 · 推理延迟 41ms</div>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">competition narrative</span>
            <h2>让评委看到完整的端到端系统</h2>
          </div>
          <p>
            重构后的前端不只是波形 demo，而是用清晰的产品信息架构表达硬件、模型、分析和健康管理闭环。
          </p>
        </div>

        <div className="bento">
          {capabilities.map((item, index) => (
            <article key={item.title} className={`card ${index === 1 ? 'span-2' : ''}`}>
              <div className="card-inner">
                <span className="status-pill ok">{item.meta}</span>
                <h3>{item.title}</h3>
                <p className="metric-detail">{item.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section grid cols-2">
        <article className="card">
          <div className="card-inner">
            <span className="eyebrow">system flow</span>
            <h2 className="page-title">从雷达信号到健康建议</h2>
            <p className="page-subtitle">
              平台架构按照感知层、边缘接入层、智能推理层、健康智能层和应用展示层组织，便于后续接入真实模型与硬件。
            </p>
          </div>
        </article>

        <article className="card">
          <div className="card-inner pipeline">
            {pipeline.map(([index, name, desc]) => (
              <div className="pipeline-step" key={index}>
                <span className="step-index">{index}</span>
                <span>
                  <span className="step-name">{name}</span>
                  <span className="step-desc">{desc}</span>
                </span>
                <span className="status-pill ok">ready</span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  )
}
