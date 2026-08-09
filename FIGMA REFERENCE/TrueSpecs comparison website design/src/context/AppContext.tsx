import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { AppContextType, Page } from '../types'

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('ts-theme')
    return (saved as 'light' | 'dark') || 'light'
  })

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('ts-wishlist') || '[]') }
    catch { return [] }
  })

  const [compareList, setCompareList] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState<Page>('home')
  const [pageParams, setPageParams] = useState<Record<string, string>>({})

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('ts-theme', theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem('ts-wishlist', JSON.stringify(wishlist))
  }, [wishlist])

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light')

  const toggleWishlist = (id: string) =>
    setWishlist(w => w.includes(id) ? w.filter(x => x !== id) : [...w, id])

  const toggleCompare = (id: string) =>
    setCompareList(c => c.includes(id) ? c.filter(x => x !== id) : c.length < 4 ? [...c, id] : c)

  const navigate = (page: Page, params: Record<string, string> = {}) => {
    setCurrentPage(page)
    setPageParams(params)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <AppContext.Provider value={{ theme, toggleTheme, wishlist, toggleWishlist, compareList, toggleCompare, currentPage, pageParams, navigate }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
