import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <main className="page">
      <section className="empty-state">
        <span className="soft-label">404</span>
        <h1>没有找到这个页面</h1>
        <p>返回首页或直接开始一次健康检测。</p>
        <div className="button-row">
          <Link className="button secondary" to="/">返回首页</Link>
          <Link className="button primary" to="/detect">开始检测</Link>
        </div>
      </section>
    </main>
  )
}
