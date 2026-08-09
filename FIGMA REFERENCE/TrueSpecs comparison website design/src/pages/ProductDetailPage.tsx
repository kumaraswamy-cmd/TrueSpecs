import { useState } from 'react'
import { getProductById } from '../data/products'
import SpecsScoreGauge from '../components/SpecsScoreGauge'
import { useApp } from '../context/AppContext'

const HeartIcon = ({ filled }: { filled: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
)
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)
const ChevronDown = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
)
const StarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
)

const subScoreLabels: Record<string, string> = {
  performance: '⚡ Performance',
  display: '🖥️ Display',
  battery: '🔋 Battery',
  value: '💰 Value',
  camera: '📷 Camera',
}

function scoreColor(s: number) {
  if (s >= 85) return '#16A34A'
  if (s >= 70) return '#0D9488'
  if (s >= 50) return '#D97706'
  return '#DC2626'
}

const phoneHighlightKeys: Record<string, { icon: string; label: string }> = {
  Display: { icon: '🖥️', label: 'Display' },
  Chipset: { icon: '⚡', label: 'Chipset' },
  Battery: { icon: '🔋', label: 'Battery' },
  'Main Camera': { icon: '📷', label: 'Camera' },
  RAM: { icon: '💾', label: 'RAM' },
  Storage: { icon: '💿', label: 'Storage' },
  Charging: { icon: '⚡', label: 'Charging' },
  Weight: { icon: '⚖️', label: 'Weight' },
}

const laptopHighlightKeys: Record<string, { icon: string; label: string }> = {
  Display: { icon: '🖥️', label: 'Display' },
  Processor: { icon: '⚡', label: 'Processor' },
  RAM: { icon: '💾', label: 'RAM' },
  Storage: { icon: '💿', label: 'Storage' },
  'Battery Life': { icon: '🔋', label: 'Battery Life' },
  Ports: { icon: '🔌', label: 'Ports' },
  Weight: { icon: '⚖️', label: 'Weight' },
  OS: { icon: '💻', label: 'OS' },
}

export default function ProductDetailPage() {
  const { pageParams, wishlist, toggleWishlist, toggleCompare, compareList, navigate } = useApp()
  const product = getProductById(pageParams.id || '')
  const [activeImg, setActiveImg] = useState(0)
  const [specsOpen, setSpecsOpen] = useState(false)

  if (!product) {
    return (
      <div className="max-w-screen-xl mx-auto px-6 py-24 text-center">
        <p className="text-5xl mb-4">🔍</p>
        <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--ts-fg)' }}>Product not found</h2>
        <button onClick={() => navigate('home')} className="mt-4 px-6 py-3 rounded-xl font-semibold text-sm"
          style={{ backgroundColor: 'var(--ts-primary)', color: 'white' }}>← Back to Home</button>
      </div>
    )
  }

  const inWishlist = wishlist.includes(product.id)
  const inCompare = compareList.includes(product.id)
  const highlightKeys = product.category === 'phone' ? phoneHighlightKeys : laptopHighlightKeys

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs mb-8" style={{ color: 'var(--ts-fg-muted)' }}>
        <button onClick={() => navigate('home')} className="hover:underline">Home</button>
        <span>/</span>
        <button onClick={() => navigate('listing', { category: product.category })} className="hover:underline capitalize">
          {product.category === 'phone' ? 'Phones' : 'Laptops'}
        </button>
        <span>/</span>
        <span style={{ color: 'var(--ts-fg)' }}>{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
        {/* Gallery */}
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl overflow-hidden aspect-square" style={{ backgroundColor: 'var(--ts-secondary)' }}>
            <img src={product.images[activeImg]} alt={product.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex gap-3">
            {product.images.map((img, i) => (
              <button key={i} onClick={() => setActiveImg(i)}
                className="rounded-xl overflow-hidden flex-1 aspect-square transition-all"
                style={{
                  border: i === activeImg ? '2px solid var(--ts-primary)' : '2px solid var(--ts-border)',
                  backgroundColor: 'var(--ts-secondary)',
                }}>
                <img src={img} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--ts-fg-subtle)', fontFamily: 'var(--font-mono)' }}>
                {product.brand}
              </span>
              {product.verified ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                  style={{ backgroundColor: 'var(--ts-success-bg)', color: 'var(--ts-success)', border: '1px solid var(--ts-success)' }}>
                  ✓ Verified Data
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                  style={{ backgroundColor: 'var(--ts-warning-bg)', color: 'var(--ts-warning)', border: '1px solid var(--ts-warning)' }}>
                  ⚠ Unverified
                </span>
              )}
            </div>
            <h1 className="text-3xl font-black leading-tight mb-3" style={{ fontFamily: 'var(--font-display)', color: 'var(--ts-fg)' }}>
              {product.name}
            </h1>
            <div className="flex items-center gap-2">
              <div className="flex" style={{ color: '#F59E0B' }}>
                {Array.from({ length: 5 }, (_, i) => (
                  <span key={i} style={{ opacity: i < Math.floor(product.rating) ? 1 : 0.3 }}><StarIcon /></span>
                ))}
              </div>
              <span className="text-sm tabnum" style={{ color: 'var(--ts-fg-muted)', fontFamily: 'var(--font-mono)' }}>
                {product.rating} · {product.reviewCount.toLocaleString()} reviews
              </span>
            </div>
          </div>

          {/* Score */}
          <div className="p-5 rounded-2xl" style={{ backgroundColor: 'var(--ts-secondary)', border: '1px solid var(--ts-border)' }}>
            <div className="flex items-center gap-6">
              <SpecsScoreGauge score={product.specsScore} size="lg" showLabel />
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--ts-fg-subtle)', fontFamily: 'var(--font-mono)' }}>
                  Sub-scores
                </p>
                <div className="flex flex-col gap-2">
                  {Object.entries(product.subScores).map(([k, v]) => (
                    <div key={k} className="flex items-center gap-2">
                      <span className="text-xs w-28 shrink-0" style={{ color: 'var(--ts-fg-muted)' }}>
                        {subScoreLabels[k] || k}
                      </span>
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--ts-ring-track)' }}>
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${v}%`, backgroundColor: scoreColor(v) }} />
                      </div>
                      <span className="text-xs tabnum w-7 text-right font-semibold" style={{ color: scoreColor(v), fontFamily: 'var(--font-mono)' }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Price & CTA */}
          <div>
            <p className="text-4xl font-black tabnum mb-4" style={{ fontFamily: 'var(--font-mono)', color: 'var(--ts-fg)' }}>
              ${product.price.toLocaleString()}
            </p>
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-2">
                <a href="#" className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: '#FF9900' }}>
                  🛒 Amazon
                </a>
                <a href="#" className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: '#047BD5' }}>
                  🛒 Flipkart
                </a>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => toggleWishlist(product.id)}
                  className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-sm transition-all"
                  style={{
                    backgroundColor: inWishlist ? 'var(--ts-wishlist-bg)' : 'var(--ts-secondary)',
                    color: inWishlist ? 'var(--ts-wishlist)' : 'var(--ts-fg-muted)',
                    border: inWishlist ? '1px solid var(--ts-wishlist)' : '1px solid transparent',
                  }}>
                  <HeartIcon filled={inWishlist} /> {inWishlist ? 'Saved' : 'Save'}
                </button>
                <button onClick={() => toggleCompare(product.id)}
                  className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-sm transition-all"
                  style={{
                    backgroundColor: inCompare ? 'color-mix(in srgb, var(--ts-primary) 12%, transparent)' : 'var(--ts-secondary)',
                    color: inCompare ? 'var(--ts-primary)' : 'var(--ts-fg-muted)',
                    border: inCompare ? '1px solid var(--ts-primary)' : '1px solid transparent',
                  }}>
                  <PlusIcon /> {inCompare ? 'In Compare' : 'Compare'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bento Grid of highlights */}
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-5" style={{ fontFamily: 'var(--font-display)', color: 'var(--ts-fg)' }}>
          Key Highlights
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(highlightKeys).map(([specKey, { icon, label }]) => {
            const val = product.specs[specKey]
            if (!val) return null
            return (
              <div key={specKey} className="p-4 rounded-2xl flex flex-col gap-2"
                style={{ backgroundColor: 'var(--ts-card)', border: '1px solid var(--ts-border)', boxShadow: 'var(--ts-shadow)' }}>
                <span className="text-2xl">{icon}</span>
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--ts-fg-subtle)', fontFamily: 'var(--font-mono)' }}>
                  {label}
                </p>
                <p className="text-sm font-semibold leading-snug" style={{ color: 'var(--ts-fg)', fontFamily: 'var(--font-body)' }}>
                  {val.split(',')[0]}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Pros / Cons */}
      <section className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 rounded-2xl" style={{ backgroundColor: 'var(--ts-success-bg)', border: '1px solid var(--ts-success)' }}>
          <h3 className="font-bold mb-4" style={{ color: 'var(--ts-success)', fontFamily: 'var(--font-display)' }}>
            ✓ Pros
          </h3>
          <ul className="flex flex-col gap-2">
            {product.pros.map((pro, i) => (
              <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--ts-fg)' }}>
                <span className="mt-0.5 shrink-0" style={{ color: 'var(--ts-success)' }}>●</span> {pro}
              </li>
            ))}
          </ul>
        </div>
        <div className="p-6 rounded-2xl" style={{ backgroundColor: 'var(--ts-danger-bg)', border: '1px solid var(--ts-danger)' }}>
          <h3 className="font-bold mb-4" style={{ color: 'var(--ts-danger)', fontFamily: 'var(--font-display)' }}>
            ✗ Cons
          </h3>
          <ul className="flex flex-col gap-2">
            {product.cons.map((con, i) => (
              <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--ts-fg)' }}>
                <span className="mt-0.5 shrink-0" style={{ color: 'var(--ts-danger)' }}>●</span> {con}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Full spec table */}
      <section className="mb-12">
        <button onClick={() => setSpecsOpen(o => !o)}
          className="w-full flex items-center justify-between p-5 rounded-2xl font-bold text-left transition-all"
          style={{ backgroundColor: 'var(--ts-card)', border: '1px solid var(--ts-border)', color: 'var(--ts-fg)', fontFamily: 'var(--font-display)' }}>
          <span>Full Specifications</span>
          <span style={{ transition: 'transform 0.25s', transform: specsOpen ? 'rotate(180deg)' : 'none' }}><ChevronDown /></span>
        </button>
        {specsOpen && (
          <div className="mt-2 rounded-2xl overflow-hidden" style={{ border: '1px solid var(--ts-border)' }}>
            <table className="w-full">
              <tbody>
                {Object.entries(product.specs).map(([key, val], i) => (
                  <tr key={key} style={{ backgroundColor: i % 2 === 0 ? 'var(--ts-card)' : 'var(--ts-secondary)' }}>
                    <td className="py-3 px-5 text-sm font-semibold w-1/3" style={{ color: 'var(--ts-fg-muted)', fontFamily: 'var(--font-body)' }}>{key}</td>
                    <td className="py-3 px-5 text-sm" style={{ color: 'var(--ts-fg)', fontFamily: 'var(--font-body)' }}>{val}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {product.tags.map(t => (
          <span key={t} className="px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{ backgroundColor: 'var(--ts-secondary)', color: 'var(--ts-fg-muted)', border: '1px solid var(--ts-border)' }}>
            #{t}
          </span>
        ))}
      </div>
    </div>
  )
}
