'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, Tag, Trash2, Minus, Plus, ShieldCheck, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import useStore from '@/lib/store'

function formatPrice(price: number) {
  return '₹' + price.toLocaleString('en-IN')
}

export default function CartPage() {
  const {
    cartItems, removeFromCart, updateQuantity, cartTotal, cartItemCount,
    appliedCoupon, couponError, applyCoupon, removeCoupon, navigateTo,
  } = useStore()

  const [couponInput, setCouponInput] = useState('')
  const [applying, setApplying] = useState(false)

  const discountAmount = appliedCoupon ? Math.round((cartTotal * appliedCoupon.discount) / 100) : 0
  const finalTotal = Math.max(0, cartTotal - discountAmount)

  const handleApply = async () => {
    if (!couponInput.trim()) return
    setApplying(true)
    await applyCoupon(couponInput.trim(), cartTotal)
    setApplying(false)
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink onClick={() => navigateTo('home')} className="cursor-pointer">Home</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><span className="text-foreground font-medium">Cart</span></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
            <ShoppingCart className="w-12 h-12 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6 max-w-md">Looks like you haven&apos;t added any courses yet. Explore our catalog and find something you love!</p>
          <Button onClick={() => navigateTo('courses')} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Browse Courses <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink onClick={() => navigateTo('home')} className="cursor-pointer">Home</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><span className="text-foreground font-medium">Cart ({cartItemCount} items)</span></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="text-2xl sm:text-3xl font-bold mb-6">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4 flex gap-4">
                {item.thumbnail ? (
                  <img src={item.thumbnail} alt={item.title} className="w-28 h-20 sm:w-36 sm:h-24 object-cover rounded-xl shrink-0 cursor-pointer" onClick={() => { useStore.getState().fetchProductById(item.productId); navigateTo('course-detail', { id: item.productId }) }} />
                ) : (
                  <div className="w-28 h-20 sm:w-36 sm:h-24 bg-primary/10 rounded-xl shrink-0" />
                )}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h3 className="font-medium text-sm sm:text-base line-clamp-2 cursor-pointer hover:text-primary transition-colors" onClick={() => { useStore.getState().fetchProductById(item.productId); navigateTo('course-detail', { id: item.productId }) }}>{item.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.instructor}</p>
                  </div>
                  <div className="flex items-center justify-between mt-3 flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center border rounded-lg">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-muted rounded-l-lg transition-colors">
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-muted rounded-r-lg transition-colors">
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeFromCart(item.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="text-right">
                      {item.originalPrice && item.originalPrice > item.price && (
                        <span className="text-xs text-muted-foreground line-through mr-1.5">{formatPrice(item.originalPrice * item.quantity)}</span>
                      )}
                      <span className="font-semibold">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-24">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-lg font-semibold">Order Summary</h2>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal ({cartItemCount} items)</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount ({appliedCoupon.discount}%)</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(finalTotal)}</span>
                </div>
              </div>

              {/* Coupon */}
              <div className="space-y-2">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Tag className="w-4 h-4 text-emerald-600" />
                      <span className="font-medium text-emerald-700">{appliedCoupon.code}</span>
                      <span className="text-xs text-emerald-600">{appliedCoupon.discount}% off</span>
                    </div>
                    <button onClick={removeCoupon} className="text-emerald-600 hover:text-emerald-800 text-xs font-medium">Remove</button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input placeholder="Coupon code" value={couponInput} onChange={(e) => setCouponInput(e.target.value.toUpperCase())} className="pl-9 h-9 text-sm" onKeyDown={(e) => e.key === 'Enter' && handleApply()} />
                    </div>
                    <Button variant="outline" size="sm" className="h-9" onClick={handleApply} disabled={applying || !couponInput.trim()}>
                      {applying ? '...' : 'Apply'}
                    </Button>
                  </div>
                )}
                {couponError && <p className="text-xs text-destructive">{couponError}</p>}
                <p className="text-xs text-muted-foreground">Try: KALAKRITI20</p>
              </div>

              <Button className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold" onClick={() => navigateTo('checkout')}>
                Proceed to Checkout
              </Button>
              <Button variant="ghost" className="w-full text-sm" onClick={() => navigateTo('courses')}>
                Continue Shopping
              </Button>

              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
                <ShieldCheck className="w-4 h-4" />
                <span>Secure checkout &middot; SSL encrypted</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}