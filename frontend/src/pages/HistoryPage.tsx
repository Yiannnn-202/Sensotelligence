const trendItems = [
  ['静息心率', '72.8 bpm', '近 7 天波动 -2.4%'],
  ['收缩压均值', '119 mmHg', '午后时段略高'],
  ['舒张压均值', '74 mmHg', '稳定区间'],
  ['PPG 稳定性', '91%', '夜间质量更高'],
]

const sessions = [
  ['今天 20:42', '模拟雷达会话', '06:18', '信号质量 92%'],
  ['昨天 21:10', '静息监测', '08:04', '生成健康摘要'],
  ['周三 19:32', '模型联调', '05:41', 'PPG 波形完整'],
]

export default function HistoryPage() {
  return (
    <main className="page">
      <header className="dashboard-header">
        <div>
          <span className="eyebrow">long-term care management</span>
          <h1 className="page-title">长期健康管理</h1>
          <p className="page-subtitle">
            用历史体征、监测会话和异常记录支撑长期管理场景。当前为展示数据，后续接入数据库和真实报告。
          </p>
        </div>
      </header>

      <section className="grid cols-4">
        {trendItems.map(([label, value, detail]) => (
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
            <span className="eyebrow">session records</span>
            <h2 className="analysis-title">监测会话</h2>
            <div className="timeline">
              {sessions.map(([time, name, duration, status]) => (
                <div className="timeline-item" key={`${time}-${name}`}>
                  <span className="mono muted">{time}</span>
                  <div>
                    <strong>{name}</strong>
                    <p className="metric-detail">{duration} · {status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className="card">
          <div className="card-inner">
            <span className="eyebrow">care insights</span>
            <h2 className="analysis-title">趋势摘要</h2>
            <ul className="list">
              <li>心率趋势整体平稳，静息时段可作为个人基线。</li>
              <li>血压估计值需要结合连续会话和模型置信度共同判断。</li>
              <li>PPG 波形稳定性可作为体动干扰和模型可信度的重要参考。</li>
            </ul>
          </div>
        </article>
      </section>
    </main>
  )
}
