import { useState } from 'react'
import { products } from '../data/products'
import ProductCard from '../components/ProductCard'
import { useApp } from '../context/AppContext'

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)

const featureCards = [
  { icon: '🎯', title: 'Precision Specs', body: 'Every spec is manually verified against official sources and user-submitted benchmarks.' },
  { icon: '⚖️', title: 'True Comparison', body: 'Side-by-side comparison with intelligent highlighting of meaningful differences.' },
  { icon: '✅', title: 'Verified Data', body: 'Green badges indicate specs confirmed by our editorial team and community testers.' },
  { icon: '📊', title: 'Specs Score', body: 'Composite performance scores built from five weighted sub-scores across key categories.' },
]

const topPhones = products.filter(p => p.category === 'phone').sort((a, b) => b.specsScore - a.specsScore).slice(0, 4)
const topLaptops = products.filter(p => p.category === 'laptop').sort((a, b) => b.specsScore - a.specsScore).slice(0, 4)

const phoneBrands = ['Apple', 'Samsung', 'Google', 'OnePlus', 'Nothing', 'Xiaomi', 'Motorola', 'Realme']
const laptopBrands = ['Apple', 'Dell', 'ASUS', 'Lenovo', 'HP', 'Microsoft', 'Razer', 'Acer']

export default function HomePage() {
  const { navigate } = useApp()
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<'phones' | 'laptops'>('phones')

  const topProducts = tab === 'phones' ? topPhones : topLaptops
  const brands = tab === 'phones' ? phoneBrands : laptopBrands

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 40%, #134E4A 100%)' }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="relative max-w-screen-xl mx-auto px-6 py-20 md:py-28 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-6"
            style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)' }}>
            ✦ Precision Specs. Trusted Comparisons.
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight"
            style={{ fontFamily: 'var(--font-display)' }}>
            The Definitive<br />Specs Database
          </h1>
          <p className="text-lg text-white/75 mb-10 max-w-lg mx-auto leading-relaxed">
            Compare phones and laptops with verified specs, honest scores, and side-by-side analysis.
          </p>
          {/* Search */}
          <div className="relative max-w-xl mx-auto">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50"><SearchIcon /></span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search iPhone 16, MacBook Pro, Galaxy S25…"
              className="w-full pl-12 pr-36 py-4 rounded-2xl text-base outline-none"
              style={{
                backgroundColor: 'rgba(255,255,255,0.12)',
                color: 'white',
                border: '1.5px solid rgba(255,255,255,0.25)',
                backdropFilter: 'blur(12px)',
                fontFamily: 'var(--font-body)',
              }}
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 rounded-xl font-semibold text-sm transition-all hover:opacity-90"
              style={{ backgroundColor: 'white', color: 'var(--ts-primary)' }}>
              Search
            </button>
          </div>
          {/* Quick links */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {['iPhone 16 Pro', 'MacBook M4', 'Galaxy S25', 'Surface Laptop 7', 'Pixel 9 Pro'].map(q => (
              <button key={q} className="px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:bg-white/20"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.2)' }}>
                {q}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <div style={{ backgroundColor: 'var(--ts-bg-elevated)', borderBottom: '1px solid var(--ts-border)' }}>
        <div className="max-w-screen-xl mx-auto px-6 py-4 flex flex-wrap justify-center gap-8">
          {[
            { val: '3,200+', label: 'Products Listed' },
            { val: '98%', label: 'Spec Accuracy' },
            { val: '1.2M+', label: 'Monthly Readers' },
            { val: '8 years', label: 'Trusted Since 2016' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="text-xl font-bold tabnum" style={{ color: 'var(--ts-primary)', fontFamily: 'var(--font-mono)' }}>{s.val}</p>
              <p className="text-xs" style={{ color: 'var(--ts-fg-muted)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 py-14">
        {/* Top Specs Performers */}
        <section className="mb-16">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--ts-fg)' }}>
                Top Specs Performers
              </h2>
              <p className="text-sm mt-1" style={{ color: 'var(--ts-fg-muted)' }}>Highest composite Specs Scores this season</p>
            </div>
            {/* Tab toggle */}
            <div className="flex rounded-xl overflow-hidden shrink-0" style={{ border: '1px solid var(--ts-border)', backgroundColor: 'var(--ts-secondary)' }}>
              {(['phones', 'laptops'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className="px-5 py-2 text-sm font-semibold capitalize transition-all"
                  style={{
                    backgroundColor: tab === t ? 'var(--ts-primary)' : 'transparent',
                    color: tab === t ? 'white' : 'var(--ts-fg-muted)',
                  }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {topProducts.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
          <div className="mt-6 text-center">
            <button onClick={() => navigate('listing', { category: tab === 'phones' ? 'phone' : 'laptop' })}
              className="px-8 py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90"
              style={{ backgroundColor: 'var(--ts-secondary)', color: 'var(--ts-fg)' }}>
              View all {tab} →
            </button>
          </div>
        </section>

        {/* Feature cards */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8" style={{ fontFamily: 'var(--font-display)', color: 'var(--ts-fg)' }}>
            Why TrueSpecs?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {featureCards.map(f => (
              <div key={f.title} className="p-6 rounded-2xl"
                style={{ backgroundColor: 'var(--ts-card)', border: '1px solid var(--ts-border)', boxShadow: 'var(--ts-shadow)' }}>
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-semibold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--ts-fg)' }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--ts-fg-muted)' }}>{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Brand shortcuts */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--ts-fg)' }}>
              Browse by Brand
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--ts-fg-subtle)', fontFamily: 'var(--font-mono)' }}>Phones</p>
              <div className="flex flex-wrap gap-2">
                {phoneBrands.map(b => (
                  <button key={b} onClick={() => navigate('listing', { category: 'phone', brand: b })}
                    className="px-4 py-2 rounded-xl text-sm font-medium transition-all hover:border-ts-primary"
                    style={{ backgroundColor: 'var(--ts-card)', border: '1px solid var(--ts-border)', color: 'var(--ts-fg)' }}>
                    {b}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--ts-fg-subtle)', fontFamily: 'var(--font-mono)' }}>Laptops</p>
              <div className="flex flex-wrap gap-2">
                {laptopBrands.map(b => (
                  <button key={b} onClick={() => navigate('listing', { category: 'laptop', brand: b })}
                    className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                    style={{ backgroundColor: 'var(--ts-card)', border: '1px solid var(--ts-border)', color: 'var(--ts-fg)' }}>
                    {b}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
