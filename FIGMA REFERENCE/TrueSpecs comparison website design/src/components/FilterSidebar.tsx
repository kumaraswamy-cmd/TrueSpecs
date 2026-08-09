import { useState } from 'react'
import type { Category, Product } from '../types'

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }}>
    <polyline points="6 9 12 15 18 9"/>
  </svg>
)

interface Filters {
  priceMin: number
  priceMax: number
  brands: string[]
  minScore: number
  verified: boolean
}

interface Props {
  category: Category
  products: Product[]
  filters: Filters
  onFiltersChange: (f: Filters) => void
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true)
  return (
    <div style={{ borderBottom: '1px solid var(--ts-border)' }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-3 px-1 text-sm font-semibold"
        style={{ color: 'var(--ts-fg)', fontFamily: 'var(--font-body)' }}>
        {title}
        <span style={{ color: 'var(--ts-fg-muted)' }}><ChevronIcon open={open} /></span>
      </button>
      {open && <div className="pb-4 px-1">{children}</div>}
    </div>
  )
}

export default function FilterSidebar({ category, products, filters, onFiltersChange }: Props) {
  const allBrands = [...new Set(products.filter(p => p.category === category).map(p => p.brand))].sort()
  const brandCounts = Object.fromEntries(allBrands.map(b => [b, products.filter(p => p.brand === b && p.category === category).length]))

  const maxPrice = Math.max(...products.filter(p => p.category === category).map(p => p.price))
  const minPrice = Math.min(...products.filter(p => p.category === category).map(p => p.price))

  const set = (partial: Partial<Filters>) => onFiltersChange({ ...filters, ...partial })

  const toggleBrand = (b: string) =>
    set({ brands: filters.brands.includes(b) ? filters.brands.filter(x => x !== b) : [...filters.brands, b] })

  return (
    <aside className="shrink-0" style={{ width: 220 }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--ts-fg-subtle)', fontFamily: 'var(--font-mono)' }}>
          Filters
        </h2>
        <button onClick={() => onFiltersChange({ priceMin: minPrice, priceMax: maxPrice, brands: [], minScore: 0, verified: false })}
          className="text-xs font-medium" style={{ color: 'var(--ts-primary)' }}>
          Reset
        </button>
      </div>

      <Section title="Price Range">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label className="text-[10px] font-medium mb-1 block" style={{ color: 'var(--ts-fg-subtle)' }}>MIN</label>
              <input type="number" value={filters.priceMin} min={minPrice} max={filters.priceMax}
                onChange={e => set({ priceMin: Number(e.target.value) })}
                className="w-full px-2 py-1.5 rounded-md text-xs tabnum outline-none"
                style={{ backgroundColor: 'var(--ts-secondary)', color: 'var(--ts-fg)', border: '1px solid var(--ts-border)', fontFamily: 'var(--font-mono)' }} />
            </div>
            <div className="flex-1">
              <label className="text-[10px] font-medium mb-1 block" style={{ color: 'var(--ts-fg-subtle)' }}>MAX</label>
              <input type="number" value={filters.priceMax} min={filters.priceMin} max={maxPrice}
                onChange={e => set({ priceMax: Number(e.target.value) })}
                className="w-full px-2 py-1.5 rounded-md text-xs tabnum outline-none"
                style={{ backgroundColor: 'var(--ts-secondary)', color: 'var(--ts-fg)', border: '1px solid var(--ts-border)', fontFamily: 'var(--font-mono)' }} />
            </div>
          </div>
          <div className="flex justify-between text-[10px] tabnum" style={{ color: 'var(--ts-fg-subtle)', fontFamily: 'var(--font-mono)' }}>
            <span>${minPrice}</span><span>${maxPrice.toLocaleString()}</span>
          </div>
        </div>
      </Section>

      <Section title="Brand">
        <div className="flex flex-col gap-2">
          {allBrands.map(b => (
            <label key={b} className="flex items-center gap-2 cursor-pointer group">
              <div
                onClick={() => toggleBrand(b)}
                className="w-4 h-4 rounded flex items-center justify-center transition-all shrink-0 cursor-pointer"
                style={{
                  backgroundColor: filters.brands.includes(b) ? 'var(--ts-primary)' : 'transparent',
                  border: filters.brands.includes(b) ? '1.5px solid var(--ts-primary)' : '1.5px solid var(--ts-border-strong)',
                }}>
                {filters.brands.includes(b) && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </div>
              <span className="flex-1 text-sm" style={{ color: 'var(--ts-fg)' }} onClick={() => toggleBrand(b)}>{b}</span>
              <span className="text-xs tabnum" style={{ color: 'var(--ts-fg-subtle)', fontFamily: 'var(--font-mono)' }}>
                {brandCounts[b]}
              </span>
            </label>
          ))}
        </div>
      </Section>

      <Section title="Specs Score">
        <div className="flex flex-col gap-2">
          <input type="range" min={0} max={100} step={5} value={filters.minScore}
            onChange={e => set({ minScore: Number(e.target.value) })}
            className="w-full accent-ts-primary" />
          <div className="flex justify-between text-xs tabnum" style={{ color: 'var(--ts-fg-muted)', fontFamily: 'var(--font-mono)' }}>
            <span>Min: {filters.minScore}</span><span>100</span>
          </div>
        </div>
      </Section>

      <Section title="Data Quality">
        <label className="flex items-center gap-2 cursor-pointer">
          <div
            onClick={() => set({ verified: !filters.verified })}
            className="w-4 h-4 rounded flex items-center justify-center transition-all cursor-pointer shrink-0"
            style={{
              backgroundColor: filters.verified ? 'var(--ts-success)' : 'transparent',
              border: filters.verified ? '1.5px solid var(--ts-success)' : '1.5px solid var(--ts-border-strong)',
            }}>
            {filters.verified && (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            )}
          </div>
          <span className="text-sm" style={{ color: 'var(--ts-fg)' }} onClick={() => set({ verified: !filters.verified })}>
            Verified only
          </span>
        </label>
      </Section>
    </aside>
  )
}
