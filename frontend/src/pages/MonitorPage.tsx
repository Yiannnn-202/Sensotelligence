import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import CinematicBackdrop from '../components/CinematicBackdrop'
import { GlassPanel, InfoRow, MetricTile, ModeTabs, SectionHeader, SourceBadge } from '../components/FunctionalUI'
import PageBottomActions from '../components/PageBottomActions'
import WaveformChart from '../components/WaveformChart'
import { getBackendStatus, getSessionDetail, type BackendStatus, type SessionDetail } from '../api/backend'
import { useWebSocket } from '../hooks/useWebSocket'

type Role = 'user' | 'researcher'

interface Profile {
  gender: string
  age: string
  height: string
  weight: string
  restingHr: string
  conditions: string[]
  state: string
  note: string
}

type PipelineTone = 'live' | 'mock' | 'planned'

const defaultProfile: Profile = {
  gender: '未选择',
  age: '',
  height: '',
  weight: '',
  restingHr: '',
  conditions: ['无'],
  state: '静息',
  note: '',
}

const conditionOptions = ['高血压', '心律异常', '呼吸系统疾病', '无', '其他']
const profileStorageKey = 'sensotelligence_profile'

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function loadProfile(): Profile {
  try {
    const raw = localStorage.getItem(profileStorageKey)
    return raw ? { ...defaultProfile, ...JSON.parse(raw) } : defaultProfile
  } catch {
    return defaultProfile
  }
}

function getRoleFromParams(searchParams: URLSearchParams): Role {
  const roleParam = searchParams.get('role') ?? searchParams.get('mode')
  return roleParam === 'researcher' ? 'researcher' : 'user'
}

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0')
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0')
  return `${mins}:${secs}`
}

export default function MonitorPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const role = getRoleFromParams(searchParams)

  const [profile, setProfile] = useState<Profile>(() => loadProfile())
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [now, setNow] = useState(Date.now())
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [backendStatus, setBackendStatus] = useState<BackendStatus | null>(null)
  const [sessionDetail, setSessionDetail] = useState<SessionDetail | null>(null)

  const [demoHr, setDemoHr] = useState(72)
  const [demoRr, setDemoRr] = useState(16)
  const [demoNoise, setDemoNoise] = useState(5)

  const {
    signal,
    signalHistory,
    latestFrame,
    connected,
    streaming,
    sessionId,
    statusMessage,
    lastError,
    groundTruth,
    startSession,
    stopSession,
  } = useWebSocket()

  useEffect(() => {
    localStorage.setItem(profileStorageKey, JSON.stringify(profile))
  }, [profile])

  useEffect(() => {
    if (streaming && startedAt == null) setStartedAt(Date.now())
    if (!streaming) setStartedAt(null)
  }, [startedAt, streaming])

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    let cancelled = false

    const loadStatus = () => {
      getBackendStatus()
        .then(status => {
          if (!cancelled) setBackendStatus(status)
        })
        .catch(() => {
          if (!cancelled) setBackendStatus(null)
        })
    }

    loadStatus()
    const id = window.setInterval(loadStatus, 5000)
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [streaming])

  useEffect(() => {
    if (!sessionId) {
      setSessionDetail(null)
      return
    }

    let cancelled = false
    getSessionDetail(sessionId)
      .then(detail => {
        if (!cancelled) setSessionDetail(detail)
      })
      .catch(() => {
        if (!cancelled) setSessionDetail(null)
      })

    return () => {
      cancelled = true
    }
  }, [sessionId, statusMessage])

  const setMode = (next: Role) => {
    setSearchParams(next === 'researcher' ? { role: 'researcher' } : { role: 'user' })
    setShowAdvanced(false)
  }

  const handleUserSessionToggle = () => {
    if (streaming) {
      stopSession()
    } else {
      startSession()
    }
  }

  const handleResearchSessionToggle = () => {
    if (streaming) {
      stopSession()
    } else {
      startSession(demoHr, demoRr, demoNoise)
    }
  }

  const heartRate = streaming && groundTruth ? groundTruth.hr_bpm + signal * 1.4 : null
  const breathRate = streaming && groundTruth ? groundTruth.rr_bpm : null
  const stability = connected ? (streaming ? clamp(92 - Math.abs(signal) * 16, 62, 97) : 76) : 0
  const confidence = streaming ? clamp(91 - Math.abs(signal) * 12, 70, 96) : 0
  const frameCount = latestFrame?.payload.frame_id ?? signalHistory.length
  const elapsed = startedAt ? Math.max(0, Math.floor((now - startedAt) / 1000)) : 0
  const hasSessionData = signalHistory.length > 0
  const backendReachable = backendStatus?.backend === 'running'

  const ppgWaveform = signalHistory.slice(-360).map((value, index) => {
    return value * 0.28 + Math.sin(index / 8) * 0.12 + Math.sin(index / 25) * 0.04
  })

  const bmi = useMemo(() => {
    const h = Number(profile.height) / 100
    const w = Number(profile.weight)
    return h > 0 && w > 0 ? (w / (h * h)).toFixed(1) : '未填写'
  }, [profile.height, profile.weight])

  const toggleCondition = (condition: string) => {
    setProfile(current => {
      if (condition === '无') {
        return { ...current, conditions: ['无'] }
      }

      const withoutNone = current.conditions.filter(item => item !== '无')
      const next = withoutNone.includes(condition)
        ? withoutNone.filter(item => item !== condition)
        : [...withoutNone, condition]

      return { ...current, conditions: next.length ? next : ['无'] }
    })
  }

  const headerCopy =
    role === 'researcher'
      ? {
          label: '科研模式',
          title: '科研模式：链路监测',
          description:
            '面向研究人员展示实时通信、数据帧、模拟输入、波形预览与模型状态，用于系统联调、科研验证和答辩说明。',
        }
      : {
          label: '个人模式',
          title: '个人模式：健康检测',
          description:
            '请先确认个人基础信息，再保持自然坐姿和静息状态开始检测。页面默认展示可理解的体征状态，专业波形与数据来源可在高级信息中展开查看。',
        }

  const bottomAction =
    role === 'researcher'
      ? {
          title: '查看技术链路',
          description: '完成链路调试后，可以查看系统接入状态、数据来源和后续模型落地计划。',
          actions: [{ label: '查看技术链路', to: '/professional', variant: 'primary' as const }],
        }
      : {
          title: '查看本次健康报告',
          description: '检测完成后，可以查看本次状态总结和健康建议。',
          actions: [{ label: '查看健康报告', to: '/results', variant: 'primary' as const }],
        }

  return (
    <main className="page detect-page cinematic-subpage functional-page">
      <CinematicBackdrop />

      <SectionHeader
        label={headerCopy.label}
        title={headerCopy.title}
        description={headerCopy.description}
      />

      <ModeTabs value={role} onChange={setMode} />

      {role === 'user' ? (
        <>
          <section className="personal-detect-layout">
            <GlassPanel className="profile-panel user-profile-panel" icon="report" badge="Local" badgeTone="mock">
              <div className="panel-intro">
                <div>
                  <h2>检测前信息</h2>
                  <p>这些信息用于后续报告解释上下文，仅保存在浏览器本地，不作为诊断依据。</p>
                </div>
              </div>

              <div className="profile-grid refined-profile-grid">
                <label>
                  <span>性别</span>
                  <select value={profile.gender} onChange={event => setProfile({ ...profile, gender: event.target.value })}>
                    {['未选择', '男', '女', '其他'].map(item => <option key={item}>{item}</option>)}
                  </select>
                </label>

                <label>
                  <span>年龄</span>
                  <input value={profile.age} onChange={event => setProfile({ ...profile, age: event.target.value })} placeholder="例如 24" />
                </label>

                <label>
                  <span>身高 cm</span>
                  <input value={profile.height} onChange={event => setProfile({ ...profile, height: event.target.value })} placeholder="例如 170" />
                </label>

                <label>
                  <span>体重 kg</span>
                  <input value={profile.weight} onChange={event => setProfile({ ...profile, weight: event.target.value })} placeholder="例如 60" />
                </label>

                <label>
                  <span>静息心率范围</span>
                  <input value={profile.restingHr} onChange={event => setProfile({ ...profile, restingHr: event.target.value })} placeholder="例如 60-80" />
                </label>

                <label>
                  <span>当前状态</span>
                  <select value={profile.state} onChange={event => setProfile({ ...profile, state: event.target.value })}>
                    {['静息', '运动后', '紧张', '饭后', '睡前'].map(item => <option key={item}>{item}</option>)}
                  </select>
                </label>
              </div>

              <div className="chip-field refined-chip-field">
                <span>基础疾病</span>
                <div>
                  {conditionOptions.map(item => (
                    <button
                      className={profile.conditions.includes(item) ? 'selected' : ''}
                      type="button"
                      key={item}
                      onClick={() => toggleCondition(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <label className="profile-note refined-profile-note">
                <span>备注</span>
                <textarea
                  value={profile.note}
                  onChange={event => setProfile({ ...profile, note: event.target.value })}
                  placeholder="可填写近期睡眠、咖啡因摄入或不适感"
                />
              </label>

              <div className="profile-summary refined-profile-summary">
                <InfoRow label="BMI" value={bmi} />
                <InfoRow label="状态" value={profile.state} />
                <InfoRow label="基础疾病" value={profile.conditions.join(' / ')} />
              </div>
            </GlassPanel>

            <GlassPanel className="user-session-panel" icon="play" badge={connected ? '已连接' : '未连接'} badgeTone={connected ? 'live' : 'mock'}>
              <div className="panel-intro">
                <div>
                  <h2>准备开始检测</h2>
                  <p>请保持安静坐姿，胸腹部自然呼吸。建议连续记录 60 秒，以获得更稳定的状态判断。</p>
                </div>
              </div>

              <div className="user-session-status">
                <InfoRow label="服务状态" value={connected ? '已连接' : '未连接'} />
                <InfoRow label="API状态" value={backendReachable ? `运行中 · v${backendStatus?.version}` : '未连接'} />
                <InfoRow label="检测状态" value={streaming ? '检测中' : '待开始'} />
                <InfoRow label="会话编号" value={sessionId ?? '--'} />
                <InfoRow label="建议" value="保持静息 / 自然呼吸 / 减少移动" />
              </div>

              <div className="user-session-actions">
                <button
                  className={`button ${streaming ? 'secondary' : 'primary'}`}
                  type="button"
                  onClick={handleUserSessionToggle}
                  disabled={!connected}
                >
                  {streaming ? '停止检测' : '开始检测'}
                </button>

                {hasSessionData && !streaming ? (
                  <Link className="button secondary user-session-report-link" to="/results">
                    查看健康报告
                  </Link>
                ) : null}
              </div>

              <p className="user-session-note">
                {lastError ? `后端提示：${lastError}` : '当前页面仅用于健康状态观察和系统演示，不作为医疗诊断或治疗依据。'}
              </p>
            </GlassPanel>
          </section>

          <section className="metric-grid four user-vitals-grid">
            <MetricTile
              icon="heart"
              label="当前心率"
              value={heartRate != null ? heartRate.toFixed(1) : '--'}
              unit="bpm"
              note="检测开始后显示实时估计值。"
              source="实时"
              tone="live"
            />

            <MetricTile
              icon="breath"
              label="当前呼吸"
              value={breathRate ?? '--'}
              unit="次/分"
              note="检测开始后显示呼吸节律估计。"
              source="实时"
              tone="live"
            />

            <MetricTile
              icon="signal"
              label="检测稳定性"
              value={stability.toFixed(0)}
              unit="%"
              note="用于判断当前检测过程是否平稳。"
              source="估算"
              tone="derived"
            />

            <MetricTile
              icon="history"
              label="检测时长"
              value={formatDuration(elapsed)}
              note="建议连续记录 60 秒。"
              source="计时"
              tone="derived"
            />
          </section>

          <section className={`advanced-signal-section ${showAdvanced ? 'open' : ''}`}>
            <GlassPanel className="advanced-signal-toggle" icon="signal"  badgeTone="mock">
              <div className="advanced-toggle-copy">
                <h2>高级信息</h2>
                <p>这里展示波形预览和数据来源说明，普通用户无需理解全部细节。</p>
              </div>

              <button className="button secondary advanced-toggle-button" type="button" onClick={() => setShowAdvanced(value => !value)}>
                {showAdvanced ? '收起高级信息' : '展开高级信息'}
              </button>
            </GlassPanel>

            {showAdvanced ? (
              <>
                <section className="advanced-waveform-grid">
                  <GlassPanel className="chart-card functional-chart" icon="signal" badge="演示" badgeTone="mock">
                    <h2>检测过程波形</h2>
                    <p>查看当前采集过程中的信号变化预览，用于理解检测稳定性。</p>
                    <WaveformChart data={signalHistory} streaming={streaming} title="信号变化预览" />
                  </GlassPanel>

                  <GlassPanel className="chart-card functional-chart" icon="heart" badge="估算" badgeTone="derived">
                    <h2>体征波形预览</h2>
                    <p>当前为演示信号生成的体征波形预览，后续真实模型接入后可替换为正式输出。</p>
                    <WaveformChart
                      data={ppgWaveform}
                      streaming={streaming}
                      title="体征波形预览"
                      color="#6f9dff"
                      min={-0.6}
                      max={0.6}
                    />
                  </GlassPanel>
                </section>

                <GlassPanel className="advanced-source-note" icon="database" badge="数据说明" badgeTone="mock">
                  <h2>数据来源说明</h2>
                  <div className="source-explain-grid">
                    <InfoRow label="实时" value="来自当前检测会话" />
                    <InfoRow label="估算" value="由前端根据信号变化计算" />
                    <InfoRow label="演示" value="当前阶段部分数据用于页面验证" />
                  </div>
                </GlassPanel>
              </>
            ) : null}
          </section>
        </>
      ) : (
        <>
          <section className="research-status-strip">
            <MetricTile
              icon="signal"
              label="实时通信"
              value={connected && backendReachable ? 'WS/API 已连接' : connected ? 'WS 已连接' : '未连接'}
              note="通过 WebSocket /ws 接收检测事件，并通过 REST API 查询后端状态。"
              source="实时"
              tone="live"
            />

            <MetricTile
              icon="database"
              label="数据模拟器"
              value="运行中"
              note="当前数据来自后端模拟器，用于验证页面链路。"
              source="实时"
              tone="live"
            />

            <MetricTile
              icon="history"
              label="数据帧率"
              value={streaming ? '20' : '0'}
              unit="FPS"
              note="当前为演示链路估算值。"
              source="模拟"
              tone="mock"
            />

            <MetricTile
              icon="model"
              label="模型推理"
              value={streaming ? '运行中' : '待接入'}
              note="真实体征反演模型尚未接入。"
              source="计划"
              tone="planned"
            />
          </section>

          <section className="research-layout">
            <GlassPanel className="research-stream" icon="signal" badge="实时" badgeTone="live">
              <h2>实时数据流</h2>
              <p>展示当前检测会话中的数据帧、通信延迟、信号质量和模型置信度，便于判断链路是否稳定。</p>

              <div className="info-grid">
                <InfoRow label="当前帧编号" value={frameCount} />
                <InfoRow label="会话编号" value={sessionId ?? '--'} />
                <InfoRow label="时间戳" value={latestFrame?.timestamp ? new Date(latestFrame.timestamp * 1000).toLocaleTimeString() : '--'} />
                <InfoRow label="帧延迟" value={streaming ? '48 ms' : '待机'} />
                <InfoRow label="丢帧数" value="0" />
                <InfoRow label="信号质量" value={`${stability.toFixed(0)}%`} />
                <InfoRow label="模型置信度" value={streaming ? `${confidence.toFixed(0)}%` : '待机'} />
              </div>

              <WaveformChart data={signalHistory} streaming={streaming} title="距离 / 相位信号流" />
            </GlassPanel>

            <GlassPanel className="research-control research-control-clean" icon="play" badge={streaming ? '采集中' : '待机'} badgeTone={streaming ? 'live' : 'mock'}>
              <div className="research-control-copy">
                <h2>准备开始采集</h2>
                <p>配置演示输入后开始采集，用于验证页面、实时链路和波形显示。</p>
              </div>

              <div className="research-slider-stack">
                <label>
                  <span>演示心率</span>
                  <input
                    type="range"
                    min="45"
                    max="120"
                    value={demoHr}
                    onChange={event => setDemoHr(Number(event.target.value))}
                    disabled={streaming}
                  />
                  <em>{demoHr} bpm</em>
                </label>

                <label>
                  <span>演示呼吸</span>
                  <input
                    type="range"
                    min="8"
                    max="28"
                    value={demoRr}
                    onChange={event => setDemoRr(Number(event.target.value))}
                    disabled={streaming}
                  />
                  <em>{demoRr} 次/分</em>
                </label>

                <label>
                  <span>环境干扰</span>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    value={demoNoise}
                    onChange={event => setDemoNoise(Number(event.target.value))}
                    disabled={streaming}
                  />
                  <em>{demoNoise}%</em>
                </label>
              </div>

              <div className="research-control-actions">
                <button
                  className={`button ${streaming ? 'secondary' : 'primary'}`}
                  type="button"
                  onClick={handleResearchSessionToggle}
                  disabled={!connected}
                >
                  {streaming ? '停止采集' : '开始采集'}
                </button>

                <Link className="button secondary" to="/results">
                  查看检测结果
                </Link>
              </div>

              <div className="raw-event">
                <h3>原始事件预览</h3>
                <code>
                  {JSON.stringify(
                    {
                      数据源: 'Simulator',
                      会话编号: sessionId ?? '--',
                      帧编号: frameCount,
                      信号值: Number(signal.toFixed(4)),
                      API状态: backendStatus?.backend ?? 'unreachable',
                      后端帧数: sessionDetail?.frame_count ?? 0,
                      采集中: streaming,
                    },
                    null,
                    2,
                  )}
                </code>
              </div>
            </GlassPanel>
          </section>

          <GlassPanel className="pipeline-panel" icon="model" badge="混合来源" badgeTone="planned">
            <h2>模型链路</h2>

            <div className="pipeline-flow">
              {[
                ['雷达帧解析', '计划', 'planned'],
                ['信号预处理', '模拟', 'mock'],
                ['体征推理模型', '计划', 'planned'],
                ['实时事件推送', '实时', 'live'],
                ['前端监测看板', '实时', 'live'],
              ].map(([label, source, tone]) => (
                <div className="pipeline-step" key={label}>
                  <strong>{label}</strong>
                  <SourceBadge tone={tone as PipelineTone}>{source}</SourceBadge>
                </div>
              ))}
            </div>
          </GlassPanel>
        </>
      )}

      <PageBottomActions
        title={bottomAction.title}
        description={bottomAction.description}
        actions={bottomAction.actions}
      />
    </main>
  )
}
