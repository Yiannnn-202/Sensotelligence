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
  badge = 'model output',
}: Props) {
  const shownValue = displayValue ?? (value != null ? value.toFixed(unit === 'mmHg' ? 0 : 1) : '--')

  return (
    <article className="card metric-card">
      <div className="card-inner metric-card">
        <div className="metric-topline">
          <span className="metric-label">{label}</span>
          <span className={`status-pill ${status}`}>{badge}</span>
        </div>
        <div className="metric-value">
          {shownValue}
          {unit && <span className="metric-unit"> {unit}</span>}
        </div>
        {detail && <div className="metric-detail">{detail}</div>}
      </div>
    </article>
  )
}
