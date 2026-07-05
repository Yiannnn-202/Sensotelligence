const deviceMetrics = [
  ['设备源', 'Simulator', '后续切换为 TI mmWave 开发套件'],
  ['目标帧率', '20 fps', '雷达帧进入实时事件总线'],
  ['推理运行时', 'ONNX / PyTorch', 'VitalInferenceService 预留'],
  ['目标延迟', '41 ms', '展示模型推理实时性'],
]

export default function DevicePage() {
  return (
    <main className="page">
      <header className="dashboard-header">
        <div>
          <span className="eyebrow">device and model operations</span>
          <h1 className="page-title">设备与模型状态</h1>
          <p className="page-subtitle">
            该页面用于展示硬件接入、雷达帧解析、模型版本、推理延迟和运行状态，强调项目的工程完整性。
          </p>
        </div>
      </header>

      <section className="grid cols-4">
        {deviceMetrics.map(([label, value, detail]) => (
          <article className="card metric-card" key={label}>
            <div className="card-inner metric-card">
              <span className="metric-label">{label}</span>
              <span className="metric-value">{value}</span>
              <span className="metric-detail">{detail}</span>
            </div>
          </article>
        ))}
      </section>

      <section className="section grid cols-2">
        <article className="card">
          <div className="card-inner">
            <span className="eyebrow">hardware adapter</span>
            <h2 className="analysis-title">TI 雷达接入规划</h2>
            <ul className="list">
              <li>HardwareAdapter 负责串口或 USB 连接、配置写入和数据读取。</li>
              <li>RadarFrameParser 将硬件数据包解析为统一 RadarFrame。</li>
              <li>DeviceStatusService 统计在线状态、丢帧、延迟和信号质量。</li>
            </ul>
          </div>
        </article>

        <article className="card">
          <div className="card-inner">
            <span className="eyebrow">model runtime</span>
            <h2 className="analysis-title">深度学习推理层</h2>
            <ul className="list">
              <li>SignalPreprocessor 将雷达窗口转换为模型输入张量。</li>
              <li>VitalInferenceService 输出心率、血压、PPG 和置信度。</li>
              <li>模型接入后前端协议保持不变，只替换后端推理来源。</li>
            </ul>
          </div>
        </article>
      </section>
    </main>
  )
}
