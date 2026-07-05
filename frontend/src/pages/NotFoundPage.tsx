import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <main className="page page-narrow">
      <section className="card">
        <div className="card-inner analysis-card">
          <span className="eyebrow">404</span>
          <h1 className="page-title">没有找到这个页面</h1>
          <p className="page-subtitle">当前路径不在监测平台的信息架构中。返回首页或进入实时监测中心继续查看系统。</p>
          <div className="button-row">
            <Link className="button" to="/">返回首页</Link>
            <Link className="button secondary" to="/monitor">进入监测</Link>
          </div>
        </div>
      </section>
    </main>
  )
}
