export default function ReportsPage() {
  return (
    <main className="page page-narrow">
      <header className="dashboard-header">
        <div>
          <span className="eyebrow">AI health reports</span>
          <h1 className="page-title">智能健康报告</h1>
          <p className="page-subtitle">
            报告页用于展示大模型基于结构化体征摘要生成的短期解释、长期建议和风险追踪。
          </p>
        </div>
      </header>

      <section className="grid cols-2">
        <article className="card">
          <div className="card-inner analysis-card">
            <span className="status-pill ok">low risk</span>
            <h2 className="analysis-title">最近一次会话摘要</h2>
            <p className="analysis-copy">
              监测窗口内心率、血压估计值和 PPG 稳定性处于可接受范围。信号质量满足基础分析条件，
              暂未发现持续性异常趋势。
            </p>
          </div>
        </article>

        <article className="card">
          <div className="card-inner analysis-card">
            <span className="status-pill warn">needs baseline</span>
            <h2 className="analysis-title">模型建议</h2>
            <ul className="list">
              <li>建立个人静息心率与血压基线，避免用单次测量做长期判断。</li>
              <li>连续记录同一时间段数据，提升长期趋势分析可信度。</li>
              <li>当信号质量低于阈值时，报告应标记为参考而非结论。</li>
            </ul>
          </div>
        </article>
      </section>

      <section className="section card">
        <div className="card-inner">
          <span className="eyebrow">report structure</span>
          <h2 className="analysis-title">报告生成链路</h2>
          <div className="pipeline">
            {[
              ['01', '体征摘要', '平均心率、血压区间、PPG 稳定性、异常次数'],
              ['02', '风险判断', '阈值、短时波动、长期偏移、置信度过滤'],
              ['03', '大模型解释', '面向用户的健康摘要和建议'],
              ['04', '报告归档', '写入历史记录，支持长期趋势追踪'],
            ].map(([index, name, desc]) => (
              <div className="pipeline-step" key={index}>
                <span className="step-index">{index}</span>
                <span>
                  <span className="step-name">{name}</span>
                  <span className="step-desc">{desc}</span>
                </span>
                <span className="status-pill ok">planned</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
