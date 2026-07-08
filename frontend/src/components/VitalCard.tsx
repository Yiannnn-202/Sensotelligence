import CardIcon from './CardIcon'

interface Props {
  label: string
  value: number | null
  unit?: string
  displayValue?: string
  detail?: string
  status?: 'ok' | 'warn' | 'danger'
  badge?: string
}

export default function VitalCard({
  label,
  value,
  unit,
  displayValue,
  detail,
  status = 'ok',
  badge = 'Live',
}: Props) {
  const shownValue = displayValue ?? (value != null ? value.toFixed(unit === '%' ? 0 : 1) : '--')
  const icon = label.includes('心') ? 'heart' : label.includes('呼') ? 'breath' : 'signal'

  return (
    <article className={`vital-card ${status}`}>
      <CardIcon variant={icon} />
      <div className="metric-topline">
        <span>{label}</span>
        <em>{badge}</em>
      </div>
      <div className="metric-value">
        {shownValue}
        {unit && <small>{unit}</small>}
      </div>
      {detail && <p>{detail}</p>}
    </article>
  )
}
