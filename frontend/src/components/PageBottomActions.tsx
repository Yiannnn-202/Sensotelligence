import { Link } from 'react-router-dom'

interface Action {
  label: string
  to: string
  variant: 'primary' | 'secondary' | 'ghost'
}

interface Props {
  title: string
  description: string
  actions: Action[]
}

export default function PageBottomActions({ title, description, actions }: Props) {
  const mainAction = actions[0]

  return (
    <section className="page-bottom-actions">
      <div className="page-bottom-copy">
        <span className="page-bottom-eyebrow">下一步</span>
        <h2 className="page-bottom-title">{title}</h2>
        <p className="page-bottom-description">{description}</p>
      </div>
      {mainAction ? (
        <div className="page-bottom-buttons">
          <Link className="page-bottom-main-button" to={mainAction.to}>
            {mainAction.label}
          </Link>
          {mainAction.to !== '/' ? (
            <Link className="page-bottom-home-button" to="/">
              返回主页
            </Link>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
