import { useState } from 'react'
import { products, getProductById } from '../data/products'
import SpecsScoreGauge from '../components/SpecsScoreGauge'
import { useApp } from '../context/AppContext'

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)

const NUMERIC_SPECS: Record<string, { higher?: boolean }> = {
  Battery: { higher: true },
  'Battery Life': { higher: true },
  RAM: { higher: true },
  Storage: { higher: true },
}

function extractNumber(val: string): number | null {
  const m = val.match(/[\d,]+\.?\d*/)
  if (!m) return null
  return parseFloat(m[0].replace(',', ''))
}

function bestIndex(vals: string[], specKey: string): number | null {
  const nums = vals.map(extractNumber)
  if (nums.some(n => n === null)) return null
  const isHigher = NUMERIC_SPECS[specKey]?.higher !== false
  let best = nums[0]!
  let idx = 0
  nums.forEach((n, i) => {
    if (n === null) return
    if (isHigher ? n > best : n < best) { best = n; idx = i }
  })
  return idx
}

function isDifferent(vals: string[]): boolean {
  return new Set(vals.map(v => v.toLowerCase().trim())).size > 1
}

export default function ComparePage() {
  const { compareList, toggleCompare, navigate } = useApp()
  const [localList, setLocalList] = useState<string[]>(compareList)
  const [addSearch, setAddSearch] = useState('')
  const [addOpen, setAddOpen] = useState(false)

  const compareProducts = localList.map(id => getProductById(id)).filter(Boolean) as NonNullable<ReturnType<typeof getProductById>>[]

  const removeProduct = (id: string) => {
    setLocalList(l => l.filter(x => x !== id))
    toggleCompare(id)
  }

  const addProduct = (id: string) => {
    if (localList.includes(id) || localList.length >= 4) return
    setLocalList(l => [...l, id])
    toggleCompare(id)
    setAddOpen(false)
    setAddSearch('')
  }

  const allSpecKeys = compareProducts.length > 0
    ? [...new Set(compareProducts.flatMap(p => Object.keys(p.specs)))]
    : []

  const searchResults = products.filter(p =>
    !localList.includes(p.id) &&
    (p.name.toLowerCase().includes(addSearch.toLowerCase()) || p.brand.toLowerCase().includes(addSearch.toLowerCase()))
  ).slice(0, 6)

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--ts-fg)' }}>
          Compare Specs
        </h1>
        <p className="text-sm" style={{ color: 'var(--ts-fg-muted)' }}>
          Select up to 4 products to compare side-by-side. Winners are highlighted in green.
        </p>
      </div>

      {compareProducts.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-6xl mb-4">⚖️</p>
          <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--ts-fg)' }}>
            No products to compare
          </h3>
          <p className="text-sm mb-6" style={{ color: 'var(--ts-fg-muted)' }}>
            Add products from the listing page to start comparing
          </p>
          <button onClick={() => navigate('listing', { category: 'phone' })}
            className="px-6 py-3 rounded-xl font-semibold text-sm text-white"
            style={{ backgroundColor: 'var(--ts-primary)' }}>
            Browse Phones
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full" style={{ minWidth: 600 }}>
            {/* Sticky header */}
            <thead>
              <tr className="sticky top-16 z-20" style={{ backgroundColor: 'var(--ts-bg)' }}>
                <th className="text-left py-4 pr-4 w-40 font-semibold text-sm" style={{ color: 'var(--ts-fg-muted)' }}>
                  Spec
                </th>
                {compareProducts.map(p => (
                  <th key={p.id} className="py-4 px-3 text-center" style={{ minWidth: 180 }}>
                    <div className="flex flex-col items-center gap-2">
                      <div className="relative">
                        <img src={p.image} alt={p.name} className="w-16 h-16 rounded-xl object-cover"
                          style={{ backgroundColor: 'var(--ts-secondary)' }} />
                        <button onClick={() => removeProduct(p.id)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-white"
                          style={{ backgroundColor: 'var(--ts-danger)' }}>
                          <XIcon />
                        </button>
                      </div>
                      <div>
                        <p className="text-[10px] font-medium" style={{ color: 'var(--ts-fg-subtle)', fontFamily: 'var(--font-mono)' }}>{p.brand}</p>
                        <p className="text-sm font-semibold leading-tight" style={{ color: 'var(--ts-fg)', fontFamily: 'var(--font-display)' }}>
                          {p.name}
                        </p>
                        <p className="text-base font-bold tabnum mt-1" style={{ color: 'var(--ts-fg)', fontFamily: 'var(--font-mono)' }}>
                          ${p.price.toLocaleString()}
                        </p>
                      </div>
                      <SpecsScoreGauge score={p.specsScore} size="sm" showLabel />
                    </div>
                  </th>
                ))}
                {/* Add product column */}
                {localList.length < 4 && (
                  <th className="py-4 px-3 text-center" style={{ minWidth: 160 }}>
                    <div className="flex flex-col items-center gap-2">
                      <div className="relative">
                        <button onClick={() => setAddOpen(o => !o)}
                          className="w-16 h-16 rounded-xl flex items-center justify-center border-2 border-dashed transition-all"
                          style={{ borderColor: 'var(--ts-border-strong)', color: 'var(--ts-fg-subtle)', backgroundColor: 'var(--ts-secondary)' }}>
                          <PlusIcon />
                        </button>
                        {addOpen && (
                          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 rounded-xl overflow-hidden z-50"
                            style={{ backgroundColor: 'var(--ts-card)', border: '1px solid var(--ts-border)', boxShadow: 'var(--ts-shadow-lg)' }}>
                            <div className="p-3" style={{ borderBottom: '1px solid var(--ts-border)' }}>
                              <input autoFocus value={addSearch} onChange={e => setAddSearch(e.target.value)}
                                placeholder="Search products…"
                                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                                style={{ backgroundColor: 'var(--ts-secondary)', color: 'var(--ts-fg)', border: '1px solid var(--ts-border)' }} />
                            </div>
                            {searchResults.length > 0 ? (
                              <div className="max-h-48 overflow-y-auto">
                                {searchResults.map(p => (
                                  <button key={p.id} onClick={() => addProduct(p.id)}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-ts-secondary transition-colors">
                                    <img src={p.image} alt={p.name} className="w-9 h-9 rounded-lg object-cover shrink-0" style={{ backgroundColor: 'var(--ts-secondary)' }} />
                                    <div>
                                      <p className="text-xs font-medium" style={{ color: 'var(--ts-fg-subtle)' }}>{p.brand}</p>
                                      <p className="text-sm font-semibold" style={{ color: 'var(--ts-fg)' }}>{p.name}</p>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <p className="px-4 py-3 text-sm" style={{ color: 'var(--ts-fg-muted)' }}>No results</p>
                            )}
                          </div>
                        )}
                      </div>
                      <p className="text-xs font-medium" style={{ color: 'var(--ts-fg-subtle)' }}>Add product</p>
                    </div>
                  </th>
                )}
              </tr>
            </thead>

            <tbody>
              {/* Specs score row */}
              <tr style={{ borderTop: '2px solid var(--ts-border)' }}>
                <td className="py-3 pr-4 text-sm font-bold" style={{ color: 'var(--ts-fg-muted)', fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  SPECS SCORE
                </td>
                {compareProducts.map((p, i) => {
                  const scores = compareProducts.map(x => x.specsScore)
                  const isBest = p.specsScore === Math.max(...scores) && scores.filter(s => s === Math.max(...scores)).length === 1
                  return (
                    <td key={p.id} className="py-3 px-3 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <span className="text-lg font-black tabnum" style={{ color: isBest ? 'var(--ts-success)' : 'var(--ts-fg)', fontFamily: 'var(--font-mono)' }}>
                          {p.specsScore}
                        </span>
                        {isBest && (
                          <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold"
                            style={{ backgroundColor: 'var(--ts-success-bg)', color: 'var(--ts-success)', border: '1px solid var(--ts-success)' }}>
                            BEST
                          </span>
                        )}
                      </div>
                    </td>
                  )
                })}
                {localList.length < 4 && <td />}
              </tr>

              {/* Dynamic spec rows */}
              {allSpecKeys.map((specKey, rowIdx) => {
                const vals = compareProducts.map(p => p.specs[specKey] || '—')
                const differs = isDifferent(vals.filter(v => v !== '—'))
                const bestIdx = NUMERIC_SPECS[specKey] !== undefined ? bestIndex(vals, specKey) : null

                return (
                  <tr key={specKey}
                    style={{ backgroundColor: rowIdx % 2 === 0 ? 'var(--ts-secondary)' : 'transparent' }}>
                    <td className="py-3 pr-4 text-xs font-semibold" style={{ color: 'var(--ts-fg-muted)' }}>
                      <div className="flex items-center gap-1">
                        {specKey}
                        {differs && (
                          <span className="px-1 py-0.5 rounded text-[8px] font-bold"
                            style={{ backgroundColor: 'var(--ts-warning-bg)', color: 'var(--ts-warning)' }}>
                            DIFFERS
                          </span>
                        )}
                      </div>
                    </td>
                    {compareProducts.map((p, i) => {
                      const val = p.specs[specKey] || '—'
                      const isBest = bestIdx === i && val !== '—'
                      const isMissing = val === '—'
                      return (
                        <td key={p.id} className="py-3 px-3 text-xs text-center"
                          style={{
                            color: isBest ? 'var(--ts-success)' : isMissing ? 'var(--ts-fg-subtle)' : 'var(--ts-fg)',
                            fontFamily: 'var(--font-body)',
                            backgroundColor: isBest ? 'var(--ts-success-bg)' : undefined,
                          }}>
                          <div className="flex items-center justify-center gap-1">
                            {isBest && <span style={{ color: 'var(--ts-success)' }}>★</span>}
                            <span className="leading-snug">{val.split(',')[0]}</span>
                          </div>
                        </td>
                      )
                    })}
                    {localList.length < 4 && <td />}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
