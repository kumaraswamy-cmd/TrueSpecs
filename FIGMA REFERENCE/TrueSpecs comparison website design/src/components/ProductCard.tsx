import type { Product } from '../types'
import SpecsScoreGauge from './SpecsScoreGauge'
import { useApp } from '../context/AppContext'

const HeartIcon = ({ filled }: { filled: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
)
const StarIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
)
const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const ChevronRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
)

function keySpecs(p: Product): string[] {
  if (p.category === 'phone') {
    return [
      p.specs['Display']?.split(',')[0],
      p.specs['Chipset'],
      `${p.specs['RAM']} RAM · ${p.specs['Storage']?.split(' / ')[0]} Storage`,
      p.specs['Battery'],
    ].filter(Boolean) as string[]
  }
  return [
    p.specs['Display']?.split(',')[0],
    p.specs['Processor'],
    `${p.specs['RAM']} · ${p.specs['Storage']}`,
    p.specs['Battery Life'] || p.specs['Battery'],
  ].filter(Boolean) as string[]
}

interface Props {
  product: Product
  compact?: boolean
}

export default function ProductCard({ product: p, compact = false }: Props) {
  const { wishlist, toggleWishlist, compareList, toggleCompare, navigate } = useApp()
  const inWishlist = wishlist.includes(p.id)
  const inCompare = compareList.includes(p.id)
  const specs = keySpecs(p)

  return (
    <div
      className="rounded-2xl flex flex-col overflow-hidden transition-all duration-200 cursor-pointer group"
      style={{
        backgroundColor: 'var(--ts-card)',
        border: '1px solid var(--ts-border)',
        boxShadow: 'var(--ts-shadow)',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--ts-shadow-md)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--ts-border-strong)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--ts-shadow)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--ts-border)' }}
      onClick={() => navigate('detail', { id: p.id })}
    >
      {/* Image */}
      <div className="relative overflow-hidden" style={{ backgroundColor: 'var(--ts-secondary)', aspectRatio: compact ? '4/3' : '1/1' }}>
        <img src={p.image} alt={p.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          style={{ backgroundColor: 'var(--ts-secondary)' }} />
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {p.verified ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1"
              style={{ backgroundColor: 'var(--ts-success-bg)', color: 'var(--ts-success)', border: '1px solid var(--ts-success)' }}>
              <CheckIcon /> Verified
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
              style={{ backgroundColor: 'var(--ts-warning-bg)', color: 'var(--ts-warning)', border: '1px solid var(--ts-warning)' }}>
              Unverified
            </span>
          )}
          {!p.inStock && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
              style={{ backgroundColor: 'var(--ts-danger-bg)', color: 'var(--ts-danger)' }}>
              Out of Stock
            </span>
          )}
        </div>
        {/* Wishlist */}
        <button
          onClick={e => { e.stopPropagation(); toggleWishlist(p.id) }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all"
          style={{
            backgroundColor: inWishlist ? 'var(--ts-wishlist)' : 'var(--ts-bg-elevated)',
            color: inWishlist ? '#fff' : 'var(--ts-fg-muted)',
            boxShadow: 'var(--ts-shadow-md)',
          }}>
          <HeartIcon filled={inWishlist} />
        </button>
        {/* Score badge */}
        <div className="absolute bottom-3 right-3">
          <SpecsScoreGauge score={p.specsScore} size="sm" />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-3 p-4 flex-1">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider mb-0.5" style={{ color: 'var(--ts-fg-subtle)', fontFamily: 'var(--font-mono)' }}>
            {p.brand}
          </p>
          <h3 className="font-semibold text-sm leading-tight" style={{ color: 'var(--ts-fg)', fontFamily: 'var(--font-display)' }}>
            {p.name}
          </h3>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1.5">
          <div className="flex" style={{ color: '#F59E0B' }}>
            {Array.from({ length: 5 }, (_, i) => (
              <span key={i} style={{ opacity: i < Math.floor(p.rating) ? 1 : 0.3 }}><StarIcon /></span>
            ))}
          </div>
          <span className="text-xs tabnum" style={{ color: 'var(--ts-fg-muted)' }}>{p.rating} ({p.reviewCount.toLocaleString()})</span>
        </div>

        {/* Key specs */}
        {!compact && (
          <ul className="flex flex-col gap-1">
            {specs.map((s, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs leading-snug"
                style={{ color: 'var(--ts-fg-muted)', fontFamily: 'var(--font-body)' }}>
                <span className="mt-px shrink-0" style={{ color: 'var(--ts-primary)' }}><CheckIcon /></span>
                {s}
              </li>
            ))}
          </ul>
        )}

        {/* Price + actions */}
        <div className="mt-auto pt-2" style={{ borderTop: '1px solid var(--ts-border)' }}>
          <p className="text-lg font-bold tabnum mb-2" style={{ color: 'var(--ts-fg)', fontFamily: 'var(--font-mono)' }}>
            ${p.price.toLocaleString()}
          </p>
          <div className="flex gap-2">
            <button
              onClick={e => { e.stopPropagation(); toggleCompare(p.id) }}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                backgroundColor: inCompare ? 'color-mix(in srgb, var(--ts-primary) 15%, transparent)' : 'var(--ts-secondary)',
                color: inCompare ? 'var(--ts-primary)' : 'var(--ts-fg-muted)',
                border: inCompare ? '1px solid var(--ts-primary)' : '1px solid transparent',
              }}>
              {inCompare ? <CheckIcon /> : <PlusIcon />} Compare
            </button>
            <button
              onClick={e => { e.stopPropagation(); navigate('detail', { id: p.id }) }}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{ backgroundColor: 'var(--ts-primary)', color: '#fff' }}>
              Details <ChevronRightIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
