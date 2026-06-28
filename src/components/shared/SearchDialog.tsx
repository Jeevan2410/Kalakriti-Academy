'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, X, Star, Users, Clock } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import useStore from '@/lib/store'

function formatPrice(price: number) {
  return '₹' + price.toLocaleString('en-IN')
}

export default function SearchDialog() {
  const { searchOpen, setSearchOpen, searchQuery, setSearchQuery, fetchProducts, products, navigateTo, fetchProductById } = useStore()
  const [localQuery, setLocalQuery] = useState(searchQuery)
  const [loading, setLoading] = useState(false)

  const debouncedSearch = useCallback(
    (value: string) => {
      setSearchQuery(value)
      const timer = setTimeout(() => {
        setLoading(true)
        fetchProducts({ q: value }).finally(() => setLoading(false))
      }, 300)
      return () => clearTimeout(timer)
    },
    [setSearchQuery, fetchProducts]
  )

  useEffect(() => {
    if (!searchOpen) return
    return debouncedSearch(localQuery)
  }, [localQuery, searchOpen, debouncedSearch])

  const handleSelect = (product: typeof products[0]) => {
    fetchProductById(product.id)
    navigateTo('course-detail', { id: product.id })
    setSearchOpen(false)
  }

  return (
    <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
      <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>Search Courses</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-3 px-4 py-3 border-b">
          <Search className="w-5 h-5 text-muted-foreground shrink-0" />
          <Input
            placeholder="Search courses, instructors, topics..."
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            className="border-0 focus-visible:ring-0 h-11 text-base shadow-none px-0"
            autoFocus
          />
          {localQuery && (
            <Button variant="ghost" size="icon" className="shrink-0" onClick={() => setLocalQuery('')}>
              <X className="w-4 h-4" />
            </Button>
          )}
          <kbd className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
            ESC
          </kbd>
        </div>
        <div className="max-h-96 overflow-y-auto custom-scrollbar">
          {loading && (
            <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">Searching...</div>
          )}
          {!loading && localQuery && products.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
              <Search className="w-10 h-10 opacity-30" />
              <p className="text-sm font-medium">No courses found</p>
              <p className="text-xs">Try a different search term</p>
            </div>
          )}
          {!loading && localQuery && products.length > 0 && (
            <div className="py-2">
              {products.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleSelect(product)}
                  className="w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors flex items-start gap-3"
                >
                  {product.thumbnail ? (
                    <img src={product.thumbnail} alt="" className="w-16 h-12 object-cover rounded-lg shrink-0" />
                  ) : (
                    <div className="w-16 h-12 bg-primary/10 rounded-lg shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium line-clamp-1">{product.title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{product.instructor}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {product.rating.toFixed(1)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {product.students}
                      </span>
                      {product.duration && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {product.duration}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold">{formatPrice(product.price)}</p>
                    <Badge variant="secondary" className="text-[10px] mt-0.5">{product.level}</Badge>
                  </div>
                </button>
              ))}
            </div>
          )}
          {!loading && !localQuery && (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
              <Search className="w-10 h-10 opacity-30" />
              <p className="text-sm font-medium">Start typing to search</p>
              <p className="text-xs">Find courses, instructors, and topics</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}