import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import FadingVideo from '../components/FadingVideo'

type Role = 'user' | 'researcher'
type IconProps = {
  className?: string
}

function PersonalModeIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 12.2a4.1 4.1 0 1 0 0-8.2 4.1 4.1 0 0 0 0 8.2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M4.8 20.2c.9-3.2 3.4-5.2 7.2-5.2s6.3 2 7.2 5.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M9.1 12.8c.8 1.2 1.8 1.8 2.9 1.8s2.1-.6 2.9-1.8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.75"
      />
    </svg>
  )
}

function ResearchModeIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9.5 3.8h5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M10.5 3.8v5.1l-4.8 8.3A2 2 0 0 0 7.4 20h9.2a2 2 0 0 0 1.7-2.8l-4.8-8.3V3.8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M8.4 15.8h7.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M10.2 18h3.6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.75"
      />
    </svg>
  )
}

function ArrowDownIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5v13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="m6.8 12.8 5.2 5.2 5.2-5.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PrecheckIcon({ type, className }: IconProps & { type: string }) {
  const paths: Record<string, string[]> = {
    device: ['M6 8h12v8H6z', 'M9 19h6', 'M12 16v3', 'M8 11h8'],
    posture: ['M12 5a2.5 2.5 0 1 0 0 .1', 'M8.5 21v-6.5L6 12', 'M15.5 21v-6.5L18 12', 'M8 9h8'],
    single: ['M12 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z', 'M5.5 20c.8-4.2 3-6.2 6.5-6.2s5.7 2 6.5 6.2'],
    time: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z', 'M12 7v5l3 2'],
    avoid: ['M5 5l14 14', 'M8 8a7 7 0 0 1 9.9 9.9'],
    note: ['M6 4h12v16H6z', 'M9 9h6', 'M9 13h6', 'M9 17h3'],
  }

  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {(paths[type] ?? paths.note).map(path => (
        <path key={path} d={path} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </svg>
  )
}
const heroVideo =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_080021_d598092b-c4c2-4e53-8e46-94cf9064cd50.mp4'

const capabilitiesVideo =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_094631_d30ab262-45ee-4b7d-99f3-5d5848c8ef13.mp4'

const roleCopy: Record<
  Role,
  {
    label: string
    primary: string
    secondary: string
    primaryTo: string
    secondaryTo: string
  }
> = {
  user: {
    label: '个人模式',
    primary: '开始健康检测',
    secondary: '查看健康报告',
    primaryTo: '/detect?role=user',
    secondaryTo: '/results'
  },
  researcher: {
    label: '科研模式',
    primary: '进入科研监测',
    secondary: '查看技术链路',
    primaryTo: '/detect?role=researcher',
    secondaryTo: '/professional'
  }
}

type PrecheckCard = {
  icon: 'device' | 'posture' | 'single' | 'time'
  title: string
  desc: ReactNode
  tags: string[]
}

const precheckCards: PrecheckCard[] = [
  {
    icon: 'device',
    title: '雷达固定',
    desc: (
      <>
        将雷达稳定放置在
        <span className="text-key-card">胸腹部正前方</span>
        ，检测过程中避免
        <span className="text-key-card">设备晃动</span>
        或
        <span className="text-key-card">角度变化</span>
        。
      </>
    ),
    tags: ['正对胸腹', '前方无遮挡', '设备不晃动']
  },
  {
    icon: 'posture',
    title: '保持静息',
    desc: (
      <>
        检测时保持
        <span className="text-key-card">放松端坐或静卧</span>
        ，胸腹部自然起伏，
        <span className="text-key-card">不需要刻意控制呼吸</span>
        。
      </>
    ),
    tags: ['保持静止', '自然呼吸', '不刻意屏息']
  },
  {
    icon: 'single',
    title: '单人环境',
    desc: (
      <>
        检测区域尽量只保留
        <span className="text-key-card">被测者</span>
        ，减少
        <span className="text-key-card">他人走动</span>
        、
        <span className="text-key-card">宠物靠近</span>
        或背景变化。
      </>
    ),
    tags: ['单人区域', '减少走动', '背景稳定']
  },
  {
    icon: 'time',
    title: '建议时长',
    desc: (
      <>
        建议连续记录
        <span className="text-key-card">30–60 秒</span>
        ，让系统获得更稳定的
        <span className="text-key-card">体征趋势</span>
        。
      </>
    ),
    tags: ['30–60 秒', '静息状态', '连续记录']
  }
]

const avoidItems = ['说话', '大幅动作', '宠物靠近', '风扇直吹', '多人经过', '设备晃动', '胸腹遮挡', '强反射杂物']
const flowSteps = ['选择模式', '填写信息', '放置雷达', '保持静息', '开始检测', '查看报告']

export default function HomePage() {
  const [role, setRole] = useState<Role>('user')
  const [homeView, setHomeView] = useState<'hero' | 'precheck'>('hero')
  const currentRole = roleCopy[role]

  return (
    <main className={`aetheris-home home-view-${homeView}`}>
      {homeView === 'hero' && (
      <section className="aetheris-section aetheris-hero">
        <FadingVideo
          src={heroVideo}
          className="aetheris-video aetheris-video-hero"
          style={{ width: '120%', height: '120%' }}
        />

        <div className="aetheris-content">
          <div className="aetheris-badge liquid-glass">
            <span>Live</span>
            <em>毫米波雷达 · 非接触生命体征感知平台</em>
          </div>

          <h1 className="aetheris-title">Sensotelligence</h1>

          <p className="aetheris-description warm-description">
  <span className="desc-line">
    基于
    <span className="desc-key">毫米波雷达</span>
    感知与
    <span className="desc-key">智能体征分析</span>
    ，实时呈现
    <span className="desc-key">心率、呼吸与信号质量</span>
    。
  </span>

  <span className="desc-line">
    面向个人健康管理与科研验证，提供
    <span className="desc-key">实时监测</span>
    、
    <span className="desc-key">趋势追踪</span>
    和
    <span className="desc-key">健康报告</span>
    入口。
  </span>
</p>

          <div className="aetheris-control liquid-glass">
            <div className="aetheris-role-row">
  <button
    className={role === 'user' ? 'active' : ''}
    type="button"
    onClick={() => setRole('user')}
    aria-pressed={role === 'user'}
  >
    <span className="role-option-icon">
      <PersonalModeIcon className="role-option-svg" />
    </span>

    <span className="role-option-copy">
      <strong>个人模式</strong>
      <small>日常监测与健康管理</small>
    </span>
  </button>

  <button
    className={role === 'researcher' ? 'active' : ''}
    type="button"
    onClick={() => setRole('researcher')}
    aria-pressed={role === 'researcher'}
  >
    <span className="role-option-icon">
      <ResearchModeIcon className="role-option-svg" />
    </span>

    <span className="role-option-copy">
      <strong>科研模式</strong>
      <small>设备链路与算法验证</small>
    </span>
  </button>
</div>

            <div className="aetheris-actions">
              <Link
                className="liquid-glass-strong aetheris-primary"
                to={currentRole.primaryTo}
              >
                {currentRole.primary}
              </Link>

              <Link className="liquid-glass-strong aetheris-primary" to={currentRole.secondaryTo}>
                {currentRole.secondary}
              </Link>
            </div>
          </div>
        </div>

        <button
          className="hero-guide-card liquid-glass"
          type="button"
          onClick={() => setHomeView('precheck')}
          aria-label="查看检测前须知"
        >
          <span className="hero-guide-copy">
            <strong>检测前须知</strong>
            <small>了解设备摆放、坐姿要求与干扰避免</small>
          </span>
          <span className="hero-guide-arrow">
            <ArrowDownIcon />
          </span>
        </button>
      </section>
      )}

      {homeView === 'precheck' && (
      <section className="aetheris-section aetheris-capabilities precheck-guide" id="precheck-guide">
        <FadingVideo
          src={capabilitiesVideo}
          className="aetheris-video aetheris-video-full"
        />

        <div className="precheck-content">
          <button className="precheck-back-button liquid-glass" type="button" onClick={() => setHomeView('hero')}>
            <span className="precheck-back-icon">
              <ArrowDownIcon />
            </span>
            返回主页
          </button>

          <header className="precheck-header">
            <h2>检测前须知</h2>
            <p>稳定的非接触体征检测无需复杂操作，关键在于设备固定、身体静止、自然呼吸和环境低干扰。</p>
          </header>

          <div className="precheck-layout">
            <div className="precheck-confirm-grid">
              {precheckCards.map(card => (
                <article className="precheck-check-card liquid-glass" key={card.title}>
                  <div className="precheck-check-head">
                    <PrecheckIcon type={card.icon} className="precheck-icon" />
                    <h3>{card.title}</h3>
                  </div>
                  <p>{card.desc}</p>
                  <div className="precheck-tags">
                    {card.tags.map(tag => <span key={tag}>{tag}</span>)}
                  </div>
                </article>
              ))}
            </div>

            <article className="precheck-main-panel liquid-glass">
              <div className="precheck-main-copy">
                <div className="card-heading-row precheck-main-heading">
                  <PrecheckIcon type="posture" className="precheck-icon card-icon" />
                  <div className="card-heading-copy">
                    <h3 className="card-title">推荐检测场景</h3>
                  </div>
                </div>
                <p>
  将雷达设备固定在
  <span className="text-key-card">胸腹部正前方</span>
  ，人与设备之间保持
  <span className="text-key-card">稳定距离</span>
  。检测时保持
  <span className="text-key-card">自然坐姿或静卧状态</span>
  ，减少
  <span className="text-key-card">说话、转身、抬手和大幅身体移动</span>
  。
</p>
              </div>
              <figure className="precheck-main-image">
                <img src="/assets/precheck/precheck-overview.jpg" alt="居家环境中的非接触式体征检测姿态示意" />
              </figure>
            </article>

            <section className="precheck-avoid">
              <h3>检测时尽量避免</h3>
              <div className="precheck-avoid-grid">
                {avoidItems.map(item => (
                  <span className="precheck-avoid-chip" key={item}>
                    <PrecheckIcon type="avoid" />
                    {item}
                  </span>
                ))}
              </div>
            </section>

            <ol className="precheck-flow">
              {flowSteps.map(step => <li key={step}>{step}</li>)}
            </ol>

            <article className="precheck-note liquid-glass">
              <PrecheckIcon type="note" className="precheck-icon" />
              <div>
                <h3>结果说明</h3>
<p>
  当前结果用于
  <span className="text-key-card">健康状态观察</span>
  和
  <span className="text-key-card">系统演示</span>
  ，
  <span className="text-key-warning">不作为医疗诊断或治疗依据</span>
  。若出现
  <span className="text-key-warning">明显不适或持续异常</span>
  ，应及时咨询专业医生。
</p>
              </div>
            </article>
          </div>
        </div>
      </section>
      )}
    </main>
  )
}
