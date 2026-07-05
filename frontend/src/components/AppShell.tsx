import { NavLink, Outlet } from 'react-router-dom'

const links = [
  { to: '/', label: '平台首页' },
  { to: '/monitor', label: '实时监测' },
  { to: '/history', label: '长期管理' },
  { to: '/reports', label: '健康报告' },
  { to: '/device', label: '设备模型' },
]

export default function AppShell() {
  return (
    <div className="app-shell">
      <div className="topbar-wrap">
        <header className="topbar">
          <NavLink className="brand" to="/" aria-label="Sensotelligence home">
            <span className="brand-mark" aria-hidden="true" />
            <span>Sensotelligence</span>
          </NavLink>
          <nav className="nav" aria-label="主导航">
            {links.map(link => (
              <NavLink key={link.to} className="nav-link" to={link.to} end={link.to === '/'}>
                {link.label}
              </NavLink>
            ))}
          </nav>
        </header>
      </div>
      <Outlet />
      <footer className="footer">
        Sensotelligence v0.1.0 · TI mmWave sensing · Deep learning vital inference · LLM health analysis
      </footer>
    </div>
  )
}
