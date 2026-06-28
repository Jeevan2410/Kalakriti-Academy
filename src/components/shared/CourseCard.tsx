'use client'

import { motion } from 'framer-motion'
import { Star, ShoppingCart, Users, Clock, Award, BadgeCheck, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import useStore from '@/lib/store'

function formatPrice(price: number) {
  return '₹' + price.toLocaleString('en-IN')
}

function getDiscount(price: number, original: number | null) {
  if (!original || original <= price) return 0
  return Math.round(((original - price) / original) * 100)
}

export default function CourseCard({ product }: { product: Parameters<typeof useStore.getState>['products'][0] }) {
  const { addToCart, navigateTo, fetchProductById, isLoggedIn, loginAsDemo } = useStore()
  const discount = getDiscount(product.price, product.originalPrice)

  const handleCardClick = () => {
    fetchProductById(product.id)
    navigateTo('course-detail', { id: product.id })
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isLoggedIn) loginAsDemo()
    addToCart(product as Parameters<typeof addToCart>[0])
  }

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
      transition={{ duration: 0.2 }}
      className="group bg-card border border-border rounded-2xl overflow-hidden cursor-pointer flex flex-col"
      onClick={handleCardClick}
    >
      {/* Thumbnail */}
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {product.thumbnail ? (
          <img
            src={product.thumbnail}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 via-primary/10 to-amber-100 flex items-center justify-center">
            <BookOpen className="w-12 h-12 text-primary/40" />
          </div>
        )}
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.bestSeller && (
            <Badge className="bg-amber-500 text-white text-[10px] font-semibold px-2 py-0.5 hover:bg-amber-600">
              <Award className="w-3 h-3 mr-1" /> Bestseller
            </Badge>
          )}
          {product.featured && !product.bestSeller && (
            <Badge className="bg-primary text-primary-foreground text-[10px] font-semibold px-2 py-0.5 hover:bg-primary/90">
              <BadgeCheck className="w-3 h-3 mr-1" /> Featured
            </Badge>
          )}
          {discount > 0 && (
            <Badge className="bg-emerald-500 text-white text-[10px] font-semibold px-2 py-0.5 hover:bg-emerald-600">
              {discount}% OFF
            </Badge>
          )}
        </div>
        {/* Level Badge */}
        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className="bg-white/90 text-foreground backdrop-blur-sm text-[10px] font-medium px-2 py-0.5">
            {product.level}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
          {product.title}
        </h3>
        <p className="text-xs text-muted-foreground">{product.instructor}</p>

        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
          <span className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-medium text-foreground">{product.rating.toFixed(1)}</span>
            <span>({product.ratingCount})</span>
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {product.students.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="w-3.5 h-3.5" />
          {product.duration || `${product.lessons} lessons`}
        </div>

        <div className="mt-auto pt-3 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-foreground">{formatPrice(product.price)}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
            )}
          </div>
          <Button
            size="sm"
            onClick={handleAddToCart}
            className="h-8 gap-1.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Add
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

