import { Link } from 'react-router-dom'
import CinematicBackdrop from '../components/CinematicBackdrop'
import { GlassPanel, MetricTile, SectionHeader } from '../components/FunctionalUI'

const records = [
  ['今天 20:42', '静息检测', '整体平稳', '建议继续观察'],
  ['昨天 21:10', '睡前记录', '节律较稳定', '建议保持同一检测条件'],
  ['周三 19:32', '日常检测', '信号良好', '可作为趋势参考'],
]

const trendBars = [62, 70, 68, 76, 72, 81, 78]

export default function HistoryPage() {
  return (
    <main className="page history-page cinematic-subpage functional-page">
      <CinematicBackdrop />

      <SectionHeader
        label="历史记录"
        title="回看你的体征变化"
        description="这里汇总近期检测中的心率、呼吸、记录次数和稳定性变化，帮助你了解自己的日常状态是否保持平稳。"
      />

      <section className="metric-grid four history-metric-row">
        <MetricTile
          icon="heart"
          label="平均心率"
          value="72.8"
          unit="bpm"
          note="近期记录中，心率整体处于平稳观察范围。"
          source="近期"
          tone="live"
        />

        <MetricTile
          icon="breath"
          label="平均呼吸"
          value="16.2"
          unit="次/分"
          note="呼吸节律整体较稳定，适合继续观察。"
          source="近期"
          tone="live"
        />

        <MetricTile
          icon="history"
          label="检测次数"
          value="3"
          note="近期已保存的检测记录数量。"
          source="记录"
          tone="derived"
        />

        <MetricTile
          icon="signal"
          label="平均稳定性"
          value="91"
          unit="%"
          note="检测过程整体较平稳，数据可读性较好。"
          source="评估"
          tone="derived"
        />
      </section>

      <section className="history-dashboard">
        <GlassPanel className="trend-chart-card" icon="signal">
          <div className="history-card-heading">
            <h2>心率 / 呼吸趋势</h2>
            <span>近 7 次记录</span>
          </div>

          <p>
            下方展示近期记录的稳定变化。建议尽量在相似时间、相似姿态和安静环境中检测，
            这样更容易观察真实的体征趋势。
          </p>

          <div className="trend-placeholder" aria-label="近 7 次检测趋势">
            {trendBars.map((height, index) => (
              <span style={{ height: `${height}%` }} key={index}>
                <em>{index + 1}</em>
              </span>
            ))}
          </div>
        </GlassPanel>

        <GlassPanel className="trend-explain-card" icon="shield">
          <div className="history-card-heading">
            <h2>趋势解读</h2>
            <span>健康参考</span>
          </div>

          <p>
            近期记录显示，静息状态下心率和呼吸整体较稳定，暂未看到持续升高或持续降低的明显趋势。
          </p>

          <div className="advice-row">
            <span>保持规律检测</span>
            <span>不适时及时复测</span>
            <span>关注连续变化</span>
          </div>
        </GlassPanel>
      </section>

      <GlassPanel className="record-list polished-record-list" icon="report">
        <div className="history-card-heading">
          <h2>检测记录</h2>
          <span>近期记录</span>
        </div>

        {records.map(([time, mode, status, advice]) => (
          <div className="record-item polished-record-item" key={`${time}-${mode}`}>
            <span>{time}</span>
            <strong>{mode}</strong>
            <p>{status}</p>
            <small>{advice}</small>
            <Link className="button ghost" to="/results">
              查看详情
            </Link>
          </div>
        ))}
      </GlassPanel>

      <section className="history-next-card">
        <div>
          <small>下一步</small>
          <h2>开始新的检测</h2>
          <p>持续记录可以帮助你更清楚地观察心率、呼吸和稳定性的变化。</p>
        </div>

        <div className="history-next-actions">
          <Link className="button primary" to="/detect?role=user">
            开始新的检测
          </Link>
          <Link className="button secondary" to="/">
            返回主页
          </Link>
        </div>
      </section>
    </main>
  )
}
