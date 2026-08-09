import { useState, useMemo } from 'react'
import { products } from '../data/products'
import type { Category } from '../types'
import ProductCard from '../components/ProductCard'
import FilterSidebar from '../components/FilterSidebar'
import { useApp } from '../context/AppContext'

type SortKey = 'score' | 'price-asc' | 'price-desc' | 'rating'

const sortLabels: Record<SortKey, string> = {
  score: 'Specs Score',
  'price-asc': 'Price: Low → High',
  'price-desc': 'Price: High → Low',
  rating: 'User Rating',
}

export default function ListingPage() {
  const { pageParams } = useApp()
  const category = (pageParams.category as Category) || 'phone'
  const initBrand = pageParams.brand ? [pageParams.brand] : []

  const catProducts = products.filter(p => p.category === category)
  const maxP = Math.max(...catProducts.map(p => p.price))
  const minP = Math.min(...catProducts.map(p => p.price))

  const [sort, setSort] = useState<SortKey>('score')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [filters, setFilters] = useState({ priceMin: minP, priceMax: maxP, brands: initBrand, minScore: 0, verified: false })

  const filtered = useMemo(() => {
    return catProducts
      .filter(p => p.price >= filters.priceMin && p.price <= filters.priceMax)
      .filter(p => filters.brands.length === 0 || filters.brands.includes(p.brand))
      .filter(p => p.specsScore >= filters.minScore)
      .filter(p => !filters.verified || p.verified)
      .sort((a, b) => {
        if (sort === 'score') return b.specsScore - a.specsScore
        if (sort === 'price-asc') return a.price - b.price
        if (sort === 'price-desc') return b.price - a.price
        return b.rating - a.rating
      })
  }, [catProducts, filters, sort])

  const title = category === 'phone' ? 'Smartphones' : 'Laptops'

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs mb-6" style={{ color: 'var(--ts-fg-muted)' }}>
        <span>Home</span>
        <span>/</span>
        <span style={{ color: 'var(--ts-fg)' }}>{title}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="lg:block hidden">
          <FilterSidebar
            category={category}
            products={products}
            filters={filters}
            onFiltersChange={setFilters}
          />
        </div>

        {/* Main */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div>
              <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--ts-fg)' }}>
                {title}
              </h1>
              <p className="text-sm mt-0.5" style={{ color: 'var(--ts-fg-muted)' }}>
                Showing <span className="font-semibold tabnum" style={{ fontFamily: 'var(--font-mono)', color: 'var(--ts-primary)' }}>{filtered.length}</span> results
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Sort */}
              <select value={sort} onChange={e => setSort(e.target.value as SortKey)}
                className="text-sm px-3 py-2 rounded-lg outline-none cursor-pointer"
                style={{
                  backgroundColor: 'var(--ts-secondary)',
                  color: 'var(--ts-fg)',
                  border: '1px solid var(--ts-border)',
                  fontFamily: 'var(--font-body)',
                }}>
                {Object.entries(sortLabels).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
              {/* View toggle */}
              <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--ts-border)' }}>
                {(['grid', 'list'] as const).map(v => (
                  <button key={v} onClick={() => setView(v)}
                    className="px-3 py-2 transition-colors"
                    style={{ backgroundColor: view === v ? 'var(--ts-primary)' : 'var(--ts-secondary)', color: view === v ? 'white' : 'var(--ts-fg-muted)' }}>
                    {v === 'grid' ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Active filters */}
          {(filters.brands.length > 0 || filters.minScore > 0 || filters.verified) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {filters.brands.map(b => (
                <span key={b} className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
                  style={{ backgroundColor: 'color-mix(in srgb, var(--ts-primary) 12%, transparent)', color: 'var(--ts-primary)', border: '1px solid var(--ts-primary)' }}>
                  {b}
                  <button onClick={() => setFilters(f => ({ ...f, brands: f.brands.filter(x => x !== b) }))} className="ml-1 leading-none">×</button>
                </span>
              ))}
              {filters.minScore > 0 && (
                <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
                  style={{ backgroundColor: 'color-mix(in srgb, var(--ts-primary) 12%, transparent)', color: 'var(--ts-primary)', border: '1px solid var(--ts-primary)' }}>
                  Score ≥ {filters.minScore}
                  <button onClick={() => setFilters(f => ({ ...f, minScore: 0 }))} className="ml-1">×</button>
                </span>
              )}
              {filters.verified && (
                <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
                  style={{ backgroundColor: 'var(--ts-success-bg)', color: 'var(--ts-success)', border: '1px solid var(--ts-success)' }}>
                  Verified only
                  <button onClick={() => setFilters(f => ({ ...f, verified: false }))} className="ml-1">×</button>
                </span>
              )}
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-4xl mb-4">🔍</p>
              <h3 className="font-semibold mb-2" style={{ color: 'var(--ts-fg)', fontFamily: 'var(--font-display)' }}>No results</h3>
              <p className="text-sm" style={{ color: 'var(--ts-fg-muted)' }}>Try adjusting your filters</p>
            </div>
          ) : view === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filtered.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filtered.map(p => (
                <div key={p.id} className="flex gap-4 p-4 rounded-2xl transition-all"
                  style={{ backgroundColor: 'var(--ts-card)', border: '1px solid var(--ts-border)', boxShadow: 'var(--ts-shadow)' }}>
                  <img src={p.image} alt={p.name} className="w-20 h-20 rounded-xl object-cover shrink-0"
                    style={{ backgroundColor: 'var(--ts-secondary)' }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-medium" style={{ color: 'var(--ts-fg-subtle)', fontFamily: 'var(--font-mono)' }}>{p.brand}</p>
                        <h3 className="font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--ts-fg)' }}>{p.name}</h3>
                      </div>
                      <span className="font-bold tabnum text-lg shrink-0" style={{ fontFamily: 'var(--font-mono)', color: 'var(--ts-fg)' }}>${p.price.toLocaleString()}</span>
                    </div>
                    <p className="text-sm mt-1 truncate" style={{ color: 'var(--ts-fg-muted)' }}>
                      {p.category === 'phone' ? `${p.specs['Chipset']} · ${p.specs['RAM']} RAM · ${p.specs['Battery']}` : `${p.specs['Processor']} · ${p.specs['RAM']} · ${p.specs['Battery Life']}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
