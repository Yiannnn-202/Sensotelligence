import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'

type IconProps = {
  className?: string
}

function HomeIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3.5 11.2 12 4l8.5 7.2"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.8 10.4V20h4.4v-5.6h3.6V20h4.4v-9.6"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function WaveIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 12h3l2-5 4 10 3-7 2 2h4"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ReportIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M7 3.8h7.2L18 7.6V20a1.2 1.2 0 0 1-1.2 1.2H7A1.2 1.2 0 0 1 5.8 20V5A1.2 1.2 0 0 1 7 3.8Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M14 4v4h4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 12h6M9 15.5h6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function TrendIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 18.5h16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M6 16l4.2-4.2 3.2 3.2L18.5 8"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.5 8h3v3"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function TechIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="7"
        y="7"
        width="10"
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M10 3v3M14 3v3M10 18v3M14 18v3M3 10h3M3 14h3M18 10h3M18 14h3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M10.2 12h3.6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

const links = [
  { to: '/detect', label: '实时监测', Icon: WaveIcon },
  { to: '/results', label: '健康报告', Icon: ReportIcon },
  { to: '/history', label: '历史趋势', Icon: TrendIcon },
  { to: '/professional', label: '技术链路', Icon: TechIcon }
]

export default function AppShell() {
  const location = useLocation()
  const lastScrollY = useRef(0)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY
      const scrollingDown = current > lastScrollY.current

      setHidden(scrollingDown && current > 96)
      lastScrollY.current = current
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    lastScrollY.current = 0
    setHidden(false)
  }, [location.pathname])

  const isHome = location.pathname === '/'

  return (
    <div className={`app-shell app-shell-cinematic ${isHome ? 'app-shell-home' : ''}`}>
      <header className={`topbar ${hidden ? 'topbar-hidden' : ''}`}>
        <NavLink
          className={({ isActive }) =>
            `brand ${isActive ? 'active' : ''}`
          }
          to="/"
          end
          aria-label="返回主页"
        >
          <span className="brand-icon">
            <HomeIcon className="nav-svg" />
          </span>
          <span className="brand-text">主页</span>
        </NavLink>

        <nav className="nav" aria-label="主要导航">
          {links.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''}`
              }
              to={to}
            >
              <span className="nav-icon">
                <Icon className="nav-svg" />
              </span>
              <span className="nav-label">{label}</span>
            </NavLink>
          ))}
        </nav>
      </header>

      <div className="route-stage" key={location.pathname}>
        <Outlet />
      </div>
    </div>
  )
}
