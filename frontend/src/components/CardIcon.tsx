type IconVariant = 'heart' | 'breath' | 'signal' | 'play' | 'report' | 'history' | 'database' | 'model' | 'shield'

interface Props {
  variant: IconVariant
  className?: string
}

const paths: Record<IconVariant, string[]> = {
  heart: ['M20.8 4.6c-1.9-1.8-4.9-1.7-6.8.2L12 6.8 10 4.8C8.1 2.9 5.1 2.8 3.2 4.6c-2 1.9-2.1 5.1-.2 7l9 8.6 9-8.6c1.9-1.9 1.8-5.1-.2-7Z'],
  breath: ['M4 13c2.2-3.2 5.4-3.2 7.5 0s5.3 3.2 8.5 0', 'M4 18c2.2-3.2 5.4-3.2 7.5 0s5.3 3.2 8.5 0', 'M4 8c2.2-3.2 5.4-3.2 7.5 0s5.3 3.2 8.5 0'],
  signal: ['M4 17h2', 'M9 17h2V9H9v8Z', 'M14 17h2V5h-2v12Z', 'M19 17h1'],
  play: ['M8 5v14l11-7L8 5Z'],
  report: ['M6 3h9l3 3v15H6V3Z', 'M14 3v4h4', 'M9 12h6', 'M9 16h6'],
  history: ['M3 12a9 9 0 1 0 3-6.7', 'M3 4v5h5', 'M12 7v5l3 2'],
  database: ['M5 6c0-1.7 3.1-3 7-3s7 1.3 7 3-3.1 3-7 3-7-1.3-7-3Z', 'M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6', 'M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6'],
  model: ['M12 3 4 7v10l8 4 8-4V7l-8-4Z', 'M4 7l8 4 8-4', 'M12 11v10'],
  shield: ['M12 3 20 6v6c0 5-3.4 8-8 9-4.6-1-8-4-8-9V6l8-3Z', 'M9 12l2 2 4-5'],
}

export default function CardIcon({ variant, className }: Props) {
  const fillOnly = variant === 'heart' || variant === 'play'

  return (
    <span className={`card-icon ${className ?? ''}`} aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        {paths[variant].map(path => (
          <path
            d={path}
            key={path}
            fill={fillOnly ? 'currentColor' : 'none'}
            stroke={fillOnly ? 'none' : 'currentColor'}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
        ))}
      </svg>
    </span>
  )
}
