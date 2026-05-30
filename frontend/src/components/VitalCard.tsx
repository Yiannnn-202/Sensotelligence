/**
 * 体征数值卡片 — 显示心率和呼吸率
 */

interface Props {
  label: string
  value: number | null
  unit: string
  color: string
  groundTruth?: number | null
}

export default function VitalCard({ label, value, unit, color, groundTruth }: Props) {
  const displayValue = value != null ? value.toFixed(1) : '--'

  return (
    <div style={{
      background: 'var(--bg-card)',
      borderRadius: 'var(--radius)',
      padding: '20px 24px',
      border: `1px solid var(--border)`,
      boxShadow: 'var(--shadow)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 8,
      minWidth: 160,
    }}>
      <span style={{
        fontSize: 13,
        color: 'var(--text-secondary)',
        fontWeight: 500,
        textTransform: 'uppercase',
        letterSpacing: 1,
      }}>
        {label}
      </span>
      <span style={{
        fontSize: 48,
        fontWeight: 700,
        color: color,
        fontVariantNumeric: 'tabular-nums',
        lineHeight: 1.1,
      }}>
        {displayValue}
      </span>
      <span style={{
        fontSize: 13,
        color: 'var(--text-secondary)',
      }}>
        {unit}
      </span>
      {groundTruth != null && (
        <span style={{
          fontSize: 11,
          color: '#666',
          marginTop: -4,
        }}>
          Ground Truth: {groundTruth.toFixed(1)} {unit}
        </span>
      )}
    </div>
  )
}
