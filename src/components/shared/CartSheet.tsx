'use client'

import { useState } from 'react'
import { X, Minus, Plus, ShoppingBag, Tag, Trash2 } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import useStore from '@/lib/store'

function formatPrice(price: number) {
  return '₹' + price.toLocaleString('en-IN')
}

export default function CartSheet() {
  const { isCartOpen, setCartOpen, cartItems, removeFromCart, updateQuantity, cartItemCount, appliedCoupon, couponError, applyCoupon, removeCoupon, navigateTo } = useStore()
  const [couponInput, setCouponInput] = useState('')
  const [applyingCoupon, setApplyingCoupon] = useState(false)

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const discountAmount = appliedCoupon ? Math.round((cartTotal * appliedCoupon.discount) / 100) : 0
  const finalTotal = Math.max(0, cartTotal - discountAmount)

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return
    setApplyingCoupon(true)
    await applyCoupon(couponInput.trim(), cartTotal)
    setApplyingCoupon(false)
  }

  const handleCheckout = () => {
    setCartOpen(false)
    navigateTo('checkout')
  }

  return (
    <Sheet open={isCartOpen} onOpenChange={setCartOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="px-6 py-4 border-b shrink-0">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Shopping Cart
            {cartItemCount > 0 && (
              <span className="text-sm font-normal text-muted-foreground">({cartItemCount} item{cartItemCount > 1 ? 's' : ''})</span>
            )}
          </SheetTitle>
        </SheetHeader>

        {cartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
              <ShoppingBag className="w-10 h-10 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="font-medium">Your cart is empty</p>
              <p className="text-sm text-muted-foreground mt-1">Add courses to start learning</p>
            </div>
            <Button variant="outline" onClick={() => { setCartOpen(false); navigateTo('courses') }}>
              Browse Courses
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 px-6 py-4">
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3 relative group">
                    {item.thumbnail ? (
                      <img src={item.thumbnail} alt={item.title} className="w-20 h-14 object-cover rounded-lg shrink-0" />
                    ) : (
                      <div className="w-20 h-14 bg-primary/10 rounded-lg shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium line-clamp-1">{item.title}</h4>
                      <p className="text-xs text-muted-foreground">{item.instructor}</p>
                      <div className="flex items-center justify-between mt-1.5">
                        <div className="flex items-center gap-2 border rounded-md">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center hover:bg-muted transition-colors rounded-l-md"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-medium w-6 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center hover:bg-muted transition-colors rounded-r-md"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="text-sm font-semibold">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full items-center justify-center hidden group-hover:flex transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              {/* Coupon */}
              <div>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm font-medium text-emerald-700">{appliedCoupon.code}</span>
                      <span className="text-xs text-emerald-600">{appliedCoupon.discount}% off</span>
                    </div>
                    <button onClick={removeCoupon} className="text-emerald-600 hover:text-emerald-800">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Coupon code"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        className="pl-9 h-9 text-sm"
                        onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleApplyCoupon}
                      disabled={applyingCoupon || !couponInput.trim()}
                      className="h-9"
                    >
                      {applyingCoupon ? '...' : 'Apply'}
                    </Button>
                  </div>
                )}
                {couponError && <p className="text-xs text-destructive mt-1.5">{couponError}</p>}
              </div>
            </ScrollArea>

            <div className="border-t px-6 py-4 space-y-3 shrink-0">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount ({appliedCoupon.discount}%)</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold text-base">
                  <span>Total</span>
                  <span>{formatPrice(finalTotal)}</span>
                </div>
              </div>
              <Button className="w-full h-11 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleCheckout}>
                Proceed to Checkout
              </Button>
              <Button variant="ghost" className="w-full text-sm" onClick={() => { setCartOpen(false); navigateTo('courses') }}>
                Continue Shopping
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}