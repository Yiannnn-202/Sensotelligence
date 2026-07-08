import { Link } from 'react-router-dom'
import CinematicBackdrop from '../components/CinematicBackdrop'
import { GlassPanel, InfoRow, MetricTile, SectionHeader, SourceBadge } from '../components/FunctionalUI'
import PageBottomActions from '../components/PageBottomActions'

interface Profile {
  gender?: string
  age?: string
  height?: string
  weight?: string
  state?: string
  conditions?: string[]
}

function loadProfile(): Profile | null {
  try {
    const raw = localStorage.getItem('sensotelligence_profile')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function calcBmi(profile: Profile | null) {
  const h = Number(profile?.height) / 100
  const w = Number(profile?.weight)
  return h > 0 && w > 0 ? (w / (h * h)).toFixed(1) : '未填写'
}

export default function ReportsPage() {
  const profile = loadProfile()
  const hasProfile = Boolean(profile?.age || profile?.height || profile?.weight || profile?.gender)

  const avgHeartRate = 72
  const avgBreathRate = 16
  const stability = 91
  const signalQuality = '良好'

  return (
    <main className="page results-page cinematic-subpage functional-page">
      <CinematicBackdrop />

      <SectionHeader
        label="检测结果"
        title="本次检测整体平稳"
        description={`本次记录中，平均心率约 ${avgHeartRate} bpm，平均呼吸约 ${avgBreathRate} 次/分，记录稳定性 ${stability}%。整体节律较稳定，适合继续观察后续变化。`}
      />

      <section className="report-overview">
        <GlassPanel className="report-summary-card report-summary-full">
          <div className="card-heading-row">
            <h2>健康建议</h2>
            <SourceBadge tone="derived">本次记录</SourceBadge>
          </div>

          <p className="report-summary-lead">
            本次检测显示，
            <span className="report-key">心率与呼吸节律整体平稳</span>
            ，记录过程中信号稳定性较好。建议继续在
            <span className="report-key">安静、放松、低干扰</span>
            的状态下进行短时记录，以便后续观察体征变化趋势。
          </p>

          <div className="report-tip-grid">
            <article>
              <strong>当前状态</strong>
              <p>
                平均心率约
                <span className="report-key report-key-number"> {avgHeartRate} bpm </span>
                ，平均呼吸约
                <span className="report-key report-key-number"> {avgBreathRate} 次/分 </span>
                ，处于较平稳的观察状态。
              </p>
            </article>

            <article>
              <strong>观察建议</strong>
              <p>
                建议保持自然坐姿或静卧，连续记录
                <span className="report-key"> 30–60 秒 </span>
                ，避免说话、转身和大幅动作。
              </p>
            </article>

            <article>
              <strong>需要关注</strong>
              <p>
                若出现
                <span className="report-key-warning">胸闷、心悸、气促</span>
                或数值持续异常，应使用专业设备复测并咨询医生。
              </p>
            </article>
          </div>

          <div className="source-note-inline">
            <SourceBadge tone="mock">健康参考</SourceBadge>
            <span>本页结果用于日常健康状态观察，不作为医疗诊断或治疗依据。</span>
          </div>

          <div className="button-row report-summary-actions">
            <Link className="button primary" to="/detect?role=user">
              重新检测
            </Link>

            <Link className="button secondary" to="/history">
              查看历史记录
            </Link>

            <button className="button ghost" type="button" disabled>
              导出报告 · 即将支持
            </button>
          </div>
        </GlassPanel>

        <div className="report-metrics report-metrics-row">
          <MetricTile
            icon="heart"
            label="平均心率"
            value={avgHeartRate}
            unit="bpm"
            note="本次记录中整体心率较平稳。"
            source="本次"
            tone="live"
          />

          <MetricTile
            icon="breath"
            label="平均呼吸"
            value={avgBreathRate}
            unit="次/分"
            note="呼吸节律较稳定，适合继续观察。"
            source="本次"
            tone="live"
          />

          <MetricTile
            icon="signal"
            label="记录稳定性"
            value={stability}
            unit="%"
            note="检测过程整体较平稳。"
            source="评估"
            tone="derived"
          />

          <MetricTile
            icon="model"
            label="信号质量"
            value={signalQuality}
            note="信号状态较清晰，适合生成观察结果。"
            source="评估"
            tone="mock"
          />
        </div>
      </section>

      <section className="report-detail-grid">
        <GlassPanel
          className="context-card"
          icon="report"
          badge={hasProfile ? '已填写' : '待补充'}
          badgeTone={hasProfile ? 'derived' : 'warn'}
        >
          <h2>个人信息参考</h2>

          {hasProfile ? (
            <div className="info-grid">
              <InfoRow label="性别" value={profile?.gender || '未填写'} />
              <InfoRow label="年龄" value={profile?.age || '未填写'} />
              <InfoRow label="BMI" value={calcBmi(profile)} />
              <InfoRow label="当前状态" value={profile?.state || '未填写'} />
              <InfoRow label="基础情况" value={profile?.conditions?.join(' / ') || '未填写'} />
            </div>
          ) : (
            <p>
              本次检测前未填写完整个人信息。补充年龄、身高、体重和当前状态后，报告可以更好地解释体征变化。
            </p>
          )}

          <small>
            个人信息仅用于辅助理解本次记录，不用于医疗诊断。
          </small>
        </GlassPanel>

        <GlassPanel className="advice-card" icon="shield" badge="健康建议" badgeTone="mock">
          <h2>后续观察建议</h2>

          <div className="advice-columns">
            <div>
              <h3>保持同一检测条件</h3>
              <p>
                建议在相似时间、相似姿态和安静环境下记录，减少环境变化对结果的影响。
              </p>
            </div>

            <div>
              <h3>关注趋势而非单次数值</h3>
              <p>
                偶尔一次波动不一定代表异常，更建议观察
                <span className="report-key">连续多次记录</span>
                中的变化方向。
              </p>
            </div>

            <div>
              <h3>不适时及时复测</h3>
              <p>
                若伴随明显不适，或心率、呼吸持续偏离平时状态，应使用专业设备复测并咨询医生。
              </p>
            </div>
          </div>
        </GlassPanel>
      </section>

      <PageBottomActions
        title="继续观察变化"
        description="建议在相似环境中定期记录，比较心率、呼吸和稳定性的变化。"
        actions={[
          { label: '查看历史趋势', to: '/history', variant: 'primary' },
        ]}
      />
    </main>
  )
}
