import { create } from 'zustand'

// ─── Types ──────────────────────────────────────────────────────────────────

interface CartItem {
  id: string
  productId: string
  title: string
  thumbnail: string | null
  price: number
  originalPrice: number | null
  quantity: number
  instructor: string
}

interface Lesson {
  id: string
  title: string
  duration: string | null
  order: number
  type: string
}

interface Chapter {
  id: string
  title: string
  order: number
  duration: string | null
  isFree: boolean
  lessons: Lesson[]
}

interface Review {
  id: string
  rating: number
  comment: string | null
  createdAt: string
  user: { name: string; avatar: string | null }
}

interface Product {
  id: string
  title: string
  slug: string
  description: string
  shortDesc: string | null
  price: number
  originalPrice: number | null
  thumbnail: string | null
  level: string
  duration: string | null
  lessons: number
  students: number
  rating: number
  ratingCount: number
  instructor: string
  instructorAvatar: string | null
  featured: boolean
  bestSeller: boolean
  categoryId: string | null
  category?: { id: string; name: string; slug: string; color: string | null; icon: string | null }
  chapters?: Chapter[]
  reviews?: Review[]
  _enrolled?: boolean
}

interface OrderItem {
  id: string
  title: string
  thumbnail: string | null
  price: number
  quantity: number
}

interface Order {
  id: string
  orderNumber: string
  status: string
  totalAmount: number
  subtotal: number
  discount: number
  paymentMethod: string
  paymentStatus: string
  paidAt: string | null
  createdAt: string
  items: OrderItem[]
}

interface User {
  id: string
  email: string
  name: string
  avatar: string | null
}

interface Enrollment {
  id: string
  productId: string
  progress: number
  status: string
  enrolledAt: string
  lastAccessedAt: string | null
  product?: Product
}

interface CreateOrderData {
  userId?: string
  sessionId?: string
  couponCode?: string
  paymentMethod?: string
}

// ─── Session ID ─────────────────────────────────────────────────────────────

const sessionId =
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : Date.now().toString(36)

// ─── Store ──────────────────────────────────────────────────────────────────

interface AppStore {
  // ── Navigation ──────────────────────────────────────────────────────────
  currentPage: 'home' | 'courses' | 'course-detail' | 'cart' | 'checkout' | 'orders' | 'dashboard'
  previousPage: string | null
  navigationParams: Record<string, string>
  navigateTo: (page: AppStore['currentPage'], params?: Record<string, string>) => void
  goBack: () => void

  // ── Cart ────────────────────────────────────────────────────────────────
  cartItems: CartItem[]
  get cartTotal(): number
  get cartItemCount(): number
  isCartOpen: boolean
  addToCart: (product: { id: string; title: string; thumbnail: string | null; price: number; originalPrice: number | null; instructor: string }) => Promise<void>
  removeFromCart: (itemId: string) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  clearCart: () => void
  toggleCart: () => void
  setCartOpen: (open: boolean) => void
  fetchCart: () => Promise<void>

  // ── Products ────────────────────────────────────────────────────────────
  products: Product[]
  featuredProducts: Product[]
  bestSellerProducts: Product[]
  currentProduct: Product | null
  productsLoading: boolean
  productsTotal: number
  searchQuery: string
  selectedCategory: string
  selectedLevel: string
  selectedSort: string
  priceRange: [number, number]
  currentPageNum: number
  fetchProducts: (params?: Record<string, string>) => Promise<void>
  fetchProductById: (id: string) => Promise<void>
  setSearchQuery: (query: string) => void
  setCategory: (category: string) => void
  setLevel: (level: string) => void
  setSort: (sort: string) => void
  setPriceRange: (range: [number, number]) => void

  // ── Orders ──────────────────────────────────────────────────────────────
  orders: Order[]
  currentOrder: Order | null
  ordersLoading: boolean
  fetchOrders: (userId: string) => Promise<void>
  createOrder: (orderData: CreateOrderData) => Promise<Order>

  // ── User ────────────────────────────────────────────────────────────────
  currentUser: User | null
  isLoggedIn: boolean
  loginAsDemo: () => void
  logout: () => void

  // ── Coupon ──────────────────────────────────────────────────────────────
  appliedCoupon: { code: string; discount: number } | null
  couponError: string | null
  applyCoupon: (code: string, totalAmount: number) => Promise<boolean>
  removeCoupon: () => void

  // ── Enrollment ──────────────────────────────────────────────────────────
  enrollments: Enrollment[]
  fetchEnrollments: (userId: string) => Promise<void>
  updateProgress: (enrollmentId: string, productId: string, progress: number) => Promise<void>

  // ── UI ──────────────────────────────────────────────────────────────────
  searchOpen: boolean
  setSearchOpen: (open: boolean) => void
}

export const useStore = create<AppStore>((set, get) => ({
  // ════════════════════════════════════════════════════════════════════════
  // Navigation
  // ════════════════════════════════════════════════════════════════════════
  currentPage: 'home',
  previousPage: null,
  navigationParams: {},

  navigateTo: (page, params = {}) => {
    set((state) => ({
      previousPage: state.currentPage,
      currentPage: page,
      navigationParams: params,
    }))
  },

  goBack: () => {
    const { previousPage, currentPage } = get()
    if (previousPage) {
      set({
        currentPage: previousPage as AppStore['currentPage'],
        previousPage: currentPage,
        navigationParams: {},
      })
    } else {
      set({ currentPage: 'home', navigationParams: {} })
    }
  },

  // ════════════════════════════════════════════════════════════════════════
  // Cart
  // ════════════════════════════════════════════════════════════════════════
  cartItems: [],
  get cartTotal() {
    return get().cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  },
  get cartItemCount() {
    return get().cartItems.reduce((sum, item) => sum + item.quantity, 0)
  },
  isCartOpen: false,

  addToCart: async (product) => {
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          productId: product.id,
          quantity: 1,
        }),
      })
      if (!res.ok) throw new Error('Failed to add to cart')
      const item = await res.json()
      set((state) => {
        const existing = state.cartItems.find((c) => c.productId === product.id)
        if (existing) {
          return {
            cartItems: state.cartItems.map((c) =>
              c.productId === product.id ? { ...c, quantity: c.quantity + 1 } : c
            ),
          }
        }
        return {
          cartItems: [
            ...state.cartItems,
            {
              id: item.id ?? product.id,
              productId: product.id,
              title: product.title,
              thumbnail: product.thumbnail,
              price: product.price,
              originalPrice: product.originalPrice,
              quantity: 1,
              instructor: product.instructor,
            },
          ],
        }
      })
    } catch {
      // Optimistic add on failure
      set((state) => {
        const existing = state.cartItems.find((c) => c.productId === product.id)
        if (existing) return state
        return {
          cartItems: [
            ...state.cartItems,
            {
              id: product.id,
              productId: product.id,
              title: product.title,
              thumbnail: product.thumbnail,
              price: product.price,
              originalPrice: product.originalPrice,
              quantity: 1,
              instructor: product.instructor,
            },
          ],
        }
      })
    }
  },

  removeFromCart: async (itemId) => {
    set((state) => ({
      cartItems: state.cartItems.filter((item) => item.id !== itemId),
    }))
    try {
      await fetch('/api/cart', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, itemId }),
      })
    } catch {
      // Item already removed from local state
    }
  },

  updateQuantity: async (itemId, quantity) => {
    if (quantity < 1) return
    set((state) => ({
      cartItems: state.cartItems.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      ),
    }))
    try {
      await fetch('/api/cart', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, itemId, quantity }),
      })
    } catch {
      // Local state already updated
    }
  },

  clearCart: () => {
    set({ cartItems: [], appliedCoupon: null, couponError: null })
  },

  toggleCart: () => {
    set((state) => ({ isCartOpen: !state.isCartOpen }))
  },

  setCartOpen: (open) => {
    set({ isCartOpen: open })
  },

  fetchCart: async () => {
    try {
      const res = await fetch(`/api/cart?sessionId=${sessionId}`)
      if (res.ok) {
        const data = await res.json()
        const items: CartItem[] = (Array.isArray(data) ? data : data.items ?? []).map(
          (item: { [key: string]: unknown }) => ({
            id: String(item.id),
            productId: String(item.productId),
            title: String(item.title ?? item.product?.title ?? ''),
            thumbnail: (item.thumbnail as string | null) ?? (item.product?.thumbnail as string | null) ?? null,
            price: Number(item.price ?? item.product?.price ?? 0),
            originalPrice: (item.originalPrice as number | null) ?? (item.product?.originalPrice as number | null) ?? null,
            quantity: Number(item.quantity ?? 1),
            instructor: String(item.instructor ?? item.product?.instructor ?? ''),
          })
        )
        set({ cartItems: items })
      }
    } catch {
      // Silently fail — cart starts empty
    }
  },

  // ════════════════════════════════════════════════════════════════════════
  // Products
  // ════════════════════════════════════════════════════════════════════════
  products: [],
  featuredProducts: [],
  bestSellerProducts: [],
  currentProduct: null,
  productsLoading: false,
  productsTotal: 0,
  searchQuery: '',
  selectedCategory: '',
  selectedLevel: '',
  selectedSort: '',
  priceRange: [0, 50000],
  currentPageNum: 1,

  fetchProducts: async (extraParams = {}) => {
    set({ productsLoading: true })
    try {
      const state = get()
      const params = new URLSearchParams()
      if (state.searchQuery) params.set('q', state.searchQuery)
      if (state.selectedCategory) params.set('category', state.selectedCategory)
      if (state.selectedLevel) params.set('level', state.selectedLevel)
      if (state.selectedSort) params.set('sort', state.selectedSort)
      params.set('minPrice', String(state.priceRange[0]))
      params.set('maxPrice', String(state.priceRange[1]))
      params.set('page', String(state.currentPageNum))
      Object.entries(extraParams).forEach(([k, v]) => params.set(k, v))

      const res = await fetch(`/api/products?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch products')
      const data = await res.json()
      const items: Product[] = Array.isArray(data) ? data : data.items ?? data.products ?? []
      set({
        products: items,
        productsTotal: data.total ?? items.length,
        productsLoading: false,
      })
    } catch {
      set({ productsLoading: false })
    }
  },

  fetchProductById: async (id) => {
    set({ productsLoading: true })
    try {
      const res = await fetch(`/api/products/${encodeURIComponent(id)}`)
      if (!res.ok) throw new Error('Failed to fetch product')
      const product: Product = await res.json()
      set({ currentProduct: product, productsLoading: false })
    } catch {
      set({ productsLoading: false })
    }
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query, currentPageNum: 1 })
  },

  setCategory: (category) => {
    set({ selectedCategory: category, currentPageNum: 1 })
  },

  setLevel: (level) => {
    set({ selectedLevel: level, currentPageNum: 1 })
  },

  setSort: (sort) => {
    set({ selectedSort: sort, currentPageNum: 1 })
  },

  setPriceRange: (range) => {
    set({ priceRange: range, currentPageNum: 1 })
  },

  // ════════════════════════════════════════════════════════════════════════
  // Orders
  // ════════════════════════════════════════════════════════════════════════
  orders: [],
  currentOrder: null,
  ordersLoading: false,

  fetchOrders: async (userId) => {
    set({ ordersLoading: true })
    try {
      const res = await fetch(`/api/orders?userId=${encodeURIComponent(userId)}`)
      if (!res.ok) throw new Error('Failed to fetch orders')
      const data = await res.json()
      set({
        orders: Array.isArray(data) ? data : data.orders ?? [],
        ordersLoading: false,
      })
    } catch {
      set({ ordersLoading: false })
    }
  },

  createOrder: async (orderData) => {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...orderData,
        sessionId: orderData.sessionId ?? sessionId,
      }),
    })
    if (!res.ok) throw new Error('Failed to create order')
    const order: Order = await res.json()
    set((state) => ({
      currentOrder: order,
      orders: [order, ...state.orders],
      cartItems: [],
      appliedCoupon: null,
      couponError: null,
    }))
    return order
  },

  // ════════════════════════════════════════════════════════════════════════
  // User
  // ════════════════════════════════════════════════════════════════════════
  currentUser: null,
  isLoggedIn: false,

  loginAsDemo: () => {
    // Seed data on first login
    fetch('/api/seed', { method: 'POST' }).catch(() => {})
    set({
      currentUser: {
        id: 'demo-user',
        email: 'demo@kalakriti.com',
        name: 'Demo User',
        avatar: null,
      },
      isLoggedIn: true,
    })
  },

  logout: () => {
    set({
      currentUser: null,
      isLoggedIn: false,
      orders: [],
      currentOrder: null,
      enrollments: [],
    })
  },

  // ════════════════════════════════════════════════════════════════════════
  // Coupon
  // ════════════════════════════════════════════════════════════════════════
  appliedCoupon: null,
  couponError: null,

  applyCoupon: async (code, _totalAmount) => {
    set({ couponError: null })
    try {
      const res = await fetch('/api/coupons/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, sessionId }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        set({ couponError: (err as { error?: string }).error ?? 'Invalid coupon code' })
        return false
      }
      const data = await res.json()
      set({
        appliedCoupon: { code: data.code ?? code, discount: Number(data.discount ?? 0) },
        couponError: null,
      })
      return true
    } catch {
      set({ couponError: 'Failed to apply coupon' })
      return false
    }
  },

  removeCoupon: () => {
    set({ appliedCoupon: null, couponError: null })
  },

  // ════════════════════════════════════════════════════════════════════════
  // Enrollment
  // ════════════════════════════════════════════════════════════════════════
  enrollments: [],

  fetchEnrollments: async (userId) => {
    try {
      const res = await fetch(`/api/enrollments?userId=${encodeURIComponent(userId)}`)
      if (!res.ok) throw new Error('Failed to fetch enrollments')
      const data = await res.json()
      set({ enrollments: Array.isArray(data) ? data : data.enrollments ?? [] })
    } catch {
      // Silently fail
    }
  },

  updateProgress: async (enrollmentId, _productId, progress) => {
    try {
      await fetch('/api/enrollments/progress', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enrollmentId, progress }),
      })
      set((state) => ({
        enrollments: state.enrollments.map((e) =>
          e.id === enrollmentId ? { ...e, progress } : e
        ),
      }))
    } catch {
      // Silently fail
    }
  },

  // ════════════════════════════════════════════════════════════════════════
  // UI
  // ════════════════════════════════════════════════════════════════════════
  searchOpen: false,
  setSearchOpen: (open) => {
    set({ searchOpen: open })
  },
}))

// Initialize cart on store creation
useStore.getState().fetchCart()

export default useStore