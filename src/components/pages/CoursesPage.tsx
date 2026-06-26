'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { SlidersHorizontal, X, Grid3X3, List, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import CourseCard from '@/components/shared/CourseCard'
import useStore from '@/lib/store'

const levels = ['Beginner', 'Intermediate', 'Advanced']

type Category = { id: string; name: string; slug: string; color: string | null; _count: { products: number } }

function FilterSidebar({ categories, searchQuery, setSearchQuery, selectedCategory, setCategory, selectedLevel, setLevel, priceRange, setPriceRange, clearFilters, hasFilters }: {
  categories: Category[]
  searchQuery: string
  setSearchQuery: (q: string) => void
  selectedCategory: string
  setCategory: (c: string) => void
  selectedLevel: string
  setLevel: (l: string) => void
  priceRange: [number, number]
  setPriceRange: (r: [number, number]) => void
  clearFilters: () => void
  hasFilters: boolean
}) {
  return (
    <div className="space-y-6">
      <div>
        <Label className="text-sm font-medium mb-2 block">Search</Label>
        <Input placeholder="Search courses..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-9" />
      </div>
      <div>
        <Label className="text-sm font-medium mb-2 block">Category</Label>
        <div className="space-y-1.5">
          <button onClick={() => setCategory('')} className={`w-full text-left px-3 py-1.5 text-sm rounded-lg transition-colors ${!selectedCategory ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted'}`}>All Categories</button>
          {categories.map(cat => (
            <button key={cat.id} onClick={() => setCategory(cat.slug)} className={`w-full text-left px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center justify-between ${selectedCategory === cat.slug ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted'}`}>
              <span>{cat.name}</span>
              <span className="text-xs text-muted-foreground">{cat._count?.products ?? 0}</span>
            </button>
          ))}
        </div>
      </div>
      <div>
        <Label className="text-sm font-medium mb-2 block">Level</Label>
        <div className="flex flex-wrap gap-2">
          {levels.map(level => (
            <Button key={level} variant={selectedLevel === level ? 'default' : 'outline'} size="sm" className={`h-8 text-xs ${selectedLevel === level ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : ''}`} onClick={() => setLevel(selectedLevel === level ? '' : level)}>{level}</Button>
          ))}
        </div>
      </div>
      <div>
        <Label className="text-sm font-medium mb-2 block">Price Range: ₹{priceRange[0].toLocaleString('en-IN')} — ₹{priceRange[1].toLocaleString('en-IN')}</Label>
        <Slider value={priceRange} onValueChange={(v) => setPriceRange(v as [number, number])} min={0} max={50000} step={500} className="mt-3" />
      </div>
      {hasFilters && (
        <Button variant="ghost" size="sm" className="w-full text-destructive" onClick={clearFilters}>
          <X className="w-4 h-4 mr-1" /> Clear All Filters
        </Button>
      )}
    </div>
  )
}

export default function CoursesPage() {
  const {
    fetchProducts, products, productsLoading, productsTotal,
    searchQuery, setSearchQuery,
    selectedCategory, setCategory,
    selectedLevel, setLevel,
    selectedSort, setSort,
    priceRange, setPriceRange,
    currentPageNum, navigateTo,
  } = useStore()

  const [categories, setCategories] = useState<Category[]>([])
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const itemsPerPage = 9

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(d => setCategories(d.categories ?? []))
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [searchQuery, selectedCategory, selectedLevel, selectedSort, priceRange, currentPageNum, fetchProducts])

  const totalPages = Math.ceil(productsTotal / itemsPerPage)
  const hasFilters = selectedCategory || selectedLevel || searchQuery || priceRange[0] > 0 || priceRange[1] < 50000

  const clearFilters = () => {
    setSearchQuery('')
    setCategory('')
    setLevel('')
    setSort('')
    setPriceRange([0, 50000])
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink onClick={() => navigateTo('home')} className="cursor-pointer">Home</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><span className="text-foreground font-medium">Courses</span></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Explore Courses</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{productsTotal} courses available</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Mobile filter toggle */}
          <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="lg:hidden">
                <SlidersHorizontal className="w-4 h-4 mr-1.5" /> Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 overflow-y-auto">
              <SheetTitle className="text-lg font-semibold mb-4">Filters</SheetTitle>
              <FilterSidebar categories={categories} searchQuery={searchQuery} setSearchQuery={setSearchQuery} selectedCategory={selectedCategory} setCategory={setCategory} selectedLevel={selectedLevel} setLevel={setLevel} priceRange={priceRange} setPriceRange={setPriceRange} clearFilters={clearFilters} hasFilters={hasFilters} />
            </SheetContent>
          </Sheet>

          <Select value={selectedSort || 'popular'} onValueChange={(v) => setSort(v)}>
            <SelectTrigger className="w-40 h-9 text-sm">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Top Rated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filters */}
      {hasFilters && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-muted rounded-full text-xs font-medium">
              &quot;{searchQuery}&quot; <button onClick={() => setSearchQuery('')}><X className="w-3 h-3" /></button>
            </span>
          )}
          {selectedCategory && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-muted rounded-full text-xs font-medium">
              {categories.find(c => c.slug === selectedCategory)?.name || selectedCategory}
              <button onClick={() => setCategory('')}><X className="w-3 h-3" /></button>
            </span>
          )}
          {selectedLevel && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-muted rounded-full text-xs font-medium">
              {selectedLevel} <button onClick={() => setLevel('')}><X className="w-3 h-3" /></button>
            </span>
          )}
        </div>
      )}

      <div className="flex gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-24">
            <h2 className="text-sm font-semibold mb-4">Filters</h2>
            <FilterSidebar categories={categories} searchQuery={searchQuery} setSearchQuery={setSearchQuery} selectedCategory={selectedCategory} setCategory={setCategory} selectedLevel={selectedLevel} setLevel={setLevel} priceRange={priceRange} setPriceRange={setPriceRange} clearFilters={clearFilters} hasFilters={hasFilters} />
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1 min-w-0">
          {productsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-80 rounded-2xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                <Grid3X3 className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-1">No courses found</h3>
              <p className="text-sm text-muted-foreground mb-4">Try adjusting your filters or search terms</p>
              <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              {products.map((product) => (
                <CourseCard key={product.id} product={product} />
              ))}
            </motion.div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <Button
                variant="outline" size="sm"
                disabled={currentPageNum <= 1}
                onClick={() => useStore.setState({ currentPageNum: currentPageNum - 1 })}
              >
                Previous
              </Button>
              {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                const page = i + 1
                return (
                  <Button
                    key={page}
                    variant={currentPageNum === page ? 'default' : 'outline'}
                    size="sm"
                    className={currentPageNum === page ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : ''}
                    onClick={() => useStore.setState({ currentPageNum: page })}
                  >
                    {page}
                  </Button>
                )
              })}
              <Button
                variant="outline" size="sm"
                disabled={currentPageNum >= totalPages}
                onClick={() => useStore.setState({ currentPageNum: currentPageNum + 1 })}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}