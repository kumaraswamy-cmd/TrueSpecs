import { getProductById } from '../data/products'
import ProductCard from '../components/ProductCard'
import { useApp } from '../context/AppContext'

export default function WishlistPage() {
  const { wishlist, navigate } = useApp()
  const saved = wishlist.map(id => getProductById(id)).filter(Boolean) as NonNullable<ReturnType<typeof getProductById>>[]

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--ts-fg)' }}>
          Saved Products
        </h1>
        <p className="text-sm" style={{ color: 'var(--ts-fg-muted)' }}>
          {saved.length} {saved.length === 1 ? 'product' : 'products'} saved
        </p>
      </div>

      {saved.length === 0 ? (
        <div className="text-center py-28">
          <p className="text-6xl mb-4">🤍</p>
          <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--ts-fg)' }}>
            Your wishlist is empty
          </h3>
          <p className="text-sm mb-6" style={{ color: 'var(--ts-fg-muted)' }}>
            Save products you like by tapping the heart icon
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate('listing', { category: 'phone' })}
              className="px-6 py-3 rounded-xl font-semibold text-sm text-white"
              style={{ backgroundColor: 'var(--ts-primary)' }}>
              Browse Phones
            </button>
            <button onClick={() => navigate('listing', { category: 'laptop' })}
              className="px-6 py-3 rounded-xl font-semibold text-sm"
              style={{ backgroundColor: 'var(--ts-secondary)', color: 'var(--ts-fg)' }}>
              Browse Laptops
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {saved.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  )
}
