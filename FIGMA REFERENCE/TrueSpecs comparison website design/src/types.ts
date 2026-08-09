export type Category = 'phone' | 'laptop'
export type Page = 'home' | 'listing' | 'detail' | 'compare' | 'wishlist' | 'admin'

export interface SubScores {
  performance: number
  display: number
  battery: number
  value: number
  camera?: number
}

export interface Product {
  id: string
  name: string
  brand: string
  category: Category
  price: number
  image: string
  images: string[]
  specs: Record<string, string>
  specsScore: number
  subScores: SubScores
  rating: number
  reviewCount: number
  verified: boolean
  inStock: boolean
  pros: string[]
  cons: string[]
  tags: string[]
}

export interface AppContextType {
  theme: 'light' | 'dark'
  toggleTheme: () => void
  wishlist: string[]
  toggleWishlist: (id: string) => void
  compareList: string[]
  toggleCompare: (id: string) => void
  currentPage: Page
  pageParams: Record<string, string>
  navigate: (page: Page, params?: Record<string, string>) => void
}
