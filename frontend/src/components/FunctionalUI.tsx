import { Children, cloneElement, isValidElement } from 'react'
import type { ReactElement, ReactNode } from 'react'
import CardIcon from './CardIcon'

type BadgeTone = 'live' | 'derived' | 'mock' | 'planned' | 'warn'
type IconVariant = Parameters<typeof CardIcon>[0]['variant']

export function SourceBadge({ children, tone = 'mock' }: { children: ReactNode; tone?: BadgeTone }) {
  return <span className={`source-badge ${tone}`}>{children}</span>
}

export function GlassPanel({
  children,
  className = '',
  icon,
  badge,
  badgeTone,
}: {
  children: ReactNode
  className?: string
  icon?: IconVariant
  badge?: ReactNode
  badgeTone?: BadgeTone
}) {
  const childArray = Children.toArray(children)
  const firstChild = childArray[0]
  const hasHeading =
    isValidElement(firstChild) &&
    typeof firstChild.type === 'string' &&
    (firstChild.type === 'h2' || firstChild.type === 'h3')
  const heading = hasHeading ? firstChild as ReactElement<{ className?: string }> : null
  const body = hasHeading ? childArray.slice(1) : childArray

  return (
    <article className={`glass-panel ${className}`}>
      {(icon || badge || heading) && (
        <div className="card-heading-row panel-topline">
          {icon ? <CardIcon variant={icon} /> : null}
          {heading ? (
            <div className="card-heading-copy">
              {cloneElement(heading, {
                className: ['card-title', heading.props.className].filter(Boolean).join(' '),
              })}
            </div>
          ) : null}
          {badge ? <SourceBadge tone={badgeTone}>{badge}</SourceBadge> : null}
        </div>
      )}
      {body}
    </article>
  )
}

export function SectionHeader({ label, title, description }: { label: string; title: string; description: string }) {
  return (
    <section className="functional-hero">
      <span className="soft-label">{label}</span>
      <h1>{title}</h1>
      <p>{description}</p>
    </section>
  )
}

export function MetricTile({
  icon,
  label,
  value,
  unit,
  note,
  source = 'Live',
  tone = 'live',
}: {
  icon: IconVariant
  label: string
  value: ReactNode
  unit?: string
  note: string
  source?: ReactNode
  tone?: BadgeTone
}) {
  return (
    <GlassPanel className="metric-tile" icon={icon} badge={source} badgeTone={tone}>
      <h3>{label}</h3>
      <strong>
        {value}
        {unit && <small>{unit}</small>}
      </strong>
      <p>{note}</p>
    </GlassPanel>
  )
}

export function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="info-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

export function ModeTabs({
  value,
  onChange,
}: {
  value: 'user' | 'researcher'
  onChange: (value: 'user' | 'researcher') => void
}) {
  return (
    <div className="mode-tabs" role="tablist" aria-label="检测模式">
      <button className={value === 'user' ? 'active' : ''} type="button" onClick={() => onChange('user')}>
        普通用户
      </button>
      <button className={value === 'researcher' ? 'active' : ''} type="button" onClick={() => onChange('researcher')}>
        科研模式
      </button>
    </div>
  )
}

export function ActionButton({
  children,
  variant = 'secondary',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' }) {
  return (
    <button className={`action-button ${variant}`} type="button" {...props}>
      {children}
    </button>
  )
}
