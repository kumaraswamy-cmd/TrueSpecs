import { AppProvider, useApp } from './context/AppContext'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import ListingPage from './pages/ListingPage'
import ProductDetailPage from './pages/ProductDetailPage'
import ComparePage from './pages/ComparePage'
import WishlistPage from './pages/WishlistPage'
import AdminPage from './pages/AdminPage'

function CompareBar() {
  const { compareList, navigate } = useApp()
  if (compareList.length < 2) return null
  return (
    <div className="fixed bottom-0 inset-x-0 z-40 flex items-center justify-between px-6 py-3"
      style={{
        backgroundColor: 'var(--ts-fg)',
        color: 'var(--ts-bg)',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.2)',
      }}>
      <span className="text-sm font-semibold">
        {compareList.length} products selected for comparison
      </span>
      <button onClick={() => navigate('compare')}
        className="px-5 py-2 rounded-lg text-sm font-bold transition-all hover:opacity-90"
        style={{ backgroundColor: 'var(--ts-primary)', color: 'white' }}>
        Compare Now →
      </button>
    </div>
  )
}

function AppShell() {
  const { currentPage } = useApp()

  const page = (() => {
    switch (currentPage) {
      case 'home': return <HomePage />
      case 'listing': return <ListingPage />
      case 'detail': return <ProductDetailPage />
      case 'compare': return <ComparePage />
      case 'wishlist': return <WishlistPage />
      case 'admin': return <AdminPage />
      default: return <HomePage />
    }
  })()

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--ts-bg)' }}>
      <Navbar />
      <main className="pb-16">{page}</main>
      <CompareBar />
      <footer className="py-8 text-center text-xs" style={{ color: 'var(--ts-fg-subtle)', borderTop: '1px solid var(--ts-border)' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--ts-fg)', marginBottom: 4 }}>TrueSpecs</p>
        <p>© 2026 TrueSpecs · Precision Specs, Trusted Comparisons</p>
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  )
}
