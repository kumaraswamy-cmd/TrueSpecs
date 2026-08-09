import { useState } from 'react'
import { useApp } from '../context/AppContext'

const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
)
const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
)
const HeartIcon = ({ filled }: { filled?: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
)
const BarChart2Icon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
)
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)
const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
)

export default function Navbar() {
  const { theme, toggleTheme, wishlist, compareList, navigate, currentPage } = useApp()
  const [search, setSearch] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)

  const navLinks = [
    { label: 'Phones', page: 'listing' as const, params: { category: 'phone' } },
    { label: 'Laptops', page: 'listing' as const, params: { category: 'laptop' } },
    { label: 'Compare', page: 'compare' as const, params: {} },
    { label: 'Admin', page: 'admin' as const, params: {} },
  ]

  return (
    <header style={{ backgroundColor: 'var(--ts-bg-elevated)', borderBottom: '1px solid var(--ts-border)', boxShadow: 'var(--ts-shadow)' }}
      className="sticky top-0 z-50">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-4 h-16">
          {/* Logo */}
          <button onClick={() => navigate('home')} className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
              style={{ background: 'linear-gradient(135deg, var(--ts-primary), #0F766E)', fontFamily: 'var(--font-display)' }}>
              TS
            </div>
            <span className="text-lg font-semibold hidden sm:block" style={{ fontFamily: 'var(--font-display)', color: 'var(--ts-fg)' }}>
              TrueSpecs
            </span>
          </button>

          {/* Nav links — desktop */}
          <nav className="hidden md:flex items-center gap-1 ml-2">
            {navLinks.map(l => (
              <button key={l.label} onClick={() => navigate(l.page, l.params)}
                className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                style={{
                  color: currentPage === l.page ? 'var(--ts-primary)' : 'var(--ts-fg-muted)',
                  backgroundColor: currentPage === l.page ? 'color-mix(in srgb, var(--ts-primary) 10%, transparent)' : 'transparent',
                }}>
                {l.label}
              </button>
            ))}
          </nav>

          {/* Search bar */}
          <div className="flex-1 max-w-sm relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--ts-fg-subtle)' }}>
              <SearchIcon />
            </span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search phones, laptops…"
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg outline-none transition-all"
              style={{
                backgroundColor: 'var(--ts-secondary)',
                color: 'var(--ts-fg)',
                border: '1px solid transparent',
                fontFamily: 'var(--font-body)',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--ts-primary)'; e.currentTarget.style.backgroundColor = 'var(--ts-bg-elevated)' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.backgroundColor = 'var(--ts-secondary)' }}
            />
          </div>

          <div className="flex items-center gap-1 ml-auto">
            {/* Compare */}
            <button onClick={() => navigate('compare')} className="relative p-2 rounded-lg transition-colors hover:bg-ts-secondary"
              style={{ color: compareList.length > 0 ? 'var(--ts-primary)' : 'var(--ts-fg-muted)' }}>
              <BarChart2Icon />
              {compareList.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
                  style={{ backgroundColor: 'var(--ts-primary)' }}>
                  {compareList.length}
                </span>
              )}
            </button>

            {/* Wishlist */}
            <button onClick={() => navigate('wishlist')} className="relative p-2 rounded-lg transition-colors hover:bg-ts-secondary"
              style={{ color: wishlist.length > 0 ? 'var(--ts-wishlist)' : 'var(--ts-fg-muted)' }}>
              <HeartIcon filled={wishlist.length > 0} />
              {wishlist.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
                  style={{ backgroundColor: 'var(--ts-wishlist)' }}>
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Theme toggle */}
            <button onClick={toggleTheme} className="p-2 rounded-lg transition-colors hover:bg-ts-secondary"
              style={{ color: 'var(--ts-fg-muted)' }}>
              {theme === 'light' ? <MoonIcon /> : <SunIcon />}
            </button>

            {/* Mobile menu */}
            <button className="md:hidden p-2 rounded-lg transition-colors hover:bg-ts-secondary"
              style={{ color: 'var(--ts-fg-muted)' }}
              onClick={() => setMobileOpen(o => !o)}>
              <MenuIcon />
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden pb-3 flex flex-col gap-1" style={{ borderTop: '1px solid var(--ts-border)' }}>
            {navLinks.map(l => (
              <button key={l.label} onClick={() => { navigate(l.page, l.params); setMobileOpen(false) }}
                className="text-left px-3 py-2 rounded-md text-sm font-medium transition-colors"
                style={{ color: 'var(--ts-fg-muted)' }}>
                {l.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  )
}
