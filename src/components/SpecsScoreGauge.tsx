interface Props {
  score: number
  size?: 'sm' | 'lg'
  showLabel?: boolean
}

function scoreColor(score: number) {
  if (score >= 85) return '#16A34A'
  if (score >= 70) return '#0D9488'
  if (score >= 50) return '#D97706'
  return '#DC2626'
}

function scoreLabel(score: number) {
  if (score >= 85) return 'Excellent'
  if (score >= 70) return 'Great'
  if (score >= 50) return 'Good'
  return 'Fair'
}

export default function SpecsScoreGauge({ score, size = 'sm', showLabel = false }: Props) {
  const isLg = size === 'lg'
  const r = isLg ? 52 : 26
  const stroke = isLg ? 7 : 4
  const dim = (r + stroke) * 2 + 2
  const cx = dim / 2
  const cy = dim / 2
  const circumference = 2 * Math.PI * r
  const arcFraction = 0.75
  const trackLen = arcFraction * circumference
  const fillLen = (score / 100) * trackLen
  const color = scoreColor(score)

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: dim, height: dim }}>
        <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`} style={{ transform: 'rotate(135deg)', transformOrigin: 'center' }}>
          {/* Track */}
          <circle
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke="var(--ts-ring-track)"
            strokeWidth={stroke}
            strokeDasharray={`${trackLen} ${circumference}`}
            strokeLinecap="round"
          />
          {/* Fill */}
          <circle
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={`${fillLen} ${circumference}`}
            strokeLinecap="round"
            className="gauge-fill"
          />
        </svg>
        {/* Score text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-bold tabnum leading-none"
            style={{ fontSize: isLg ? 28 : 13, color, fontFamily: 'var(--font-mono)' }}>
            {score}
          </span>
          {isLg && (
            <span className="text-xs font-medium mt-0.5" style={{ color: 'var(--ts-fg-muted)', fontFamily: 'var(--font-body)' }}>
              / 100
            </span>
          )}
        </div>
      </div>
      {showLabel && (
        <span className="text-xs font-semibold" style={{ color }}>
          {scoreLabel(score)}
        </span>
      )}
    </div>
  )
}
