'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CreditCard, Smartphone, Building2, Wallet, ShieldCheck, Lock, Loader2,
  CheckCircle2, Tag
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import useStore from '@/lib/store'
import { useToast } from '@/hooks/use-toast'

function formatPrice(price: number) {
  return '₹' + price.toLocaleString('en-IN')
}

const paymentMethods = [
  { id: 'upi', label: 'UPI', icon: Smartphone, desc: 'Pay using any UPI app' },
  { id: 'card', label: 'Credit/Debit Card', icon: CreditCard, desc: 'Visa, Mastercard, RuPay' },
  { id: 'netbanking', label: 'Net Banking', icon: Building2, desc: 'All major banks supported' },
  { id: 'razorpay', label: 'Razorpay', icon: Wallet, desc: 'Multiple payment options' },
]

export default function CheckoutPage() {
  const {
    cartItems, appliedCoupon, couponError, applyCoupon, removeCoupon,
    currentUser, isLoggedIn, loginAsDemo, createOrder, navigateTo,
  } = useStore()
  const { toast } = useToast()

  // Compute totals inline for reactivity
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const discountAmount = appliedCoupon ? Math.round((cartTotal * appliedCoupon.discount) / 100) : 0
  const finalTotal = Math.max(0, cartTotal - discountAmount)

  const [paymentMethod, setPaymentMethod] = useState('upi')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [upiId, setUpiId] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [couponInput, setCouponInput] = useState('')
  const [processing, setProcessing] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name)
      setEmail(currentUser.email)
    }
  }, [currentUser])

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = 'Name is required'
    if (!email.trim() || !email.includes('@')) errs.email = 'Valid email is required'
    if (!phone.trim() || phone.length < 10) errs.phone = 'Valid phone is required'
    if (paymentMethod === 'upi' && !upiId.includes('@')) errs.upiId = 'Enter a valid UPI ID'
    if (paymentMethod === 'card') {
      if (cardNumber.replace(/\s/g, '').length < 16) errs.cardNumber = 'Enter a valid card number'
      if (!expiry || !expiry.includes('/')) errs.expiry = 'Enter MM/YY'
      if (cvv.length < 3) errs.cvv = 'Enter CVV'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async () => {
    if (!isLoggedIn) {
      loginAsDemo()
      return
    }
    if (cartItems.length === 0) {
      navigateTo('cart')
      return
    }
    if (!validate()) return

    setProcessing(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      const order = await createOrder({
        userId: currentUser?.id,
        couponCode: appliedCoupon?.code,
        paymentMethod,
      })
      toast({ title: 'Payment successful!', description: `Order ${order.orderNumber} confirmed.` })
      navigateTo('order-confirmation')
    } catch {
      toast({ title: 'Payment failed', description: 'Something went wrong. Please try again.', variant: 'destructive' })
    } finally {
      setProcessing(false)
    }
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <h2 className="text-xl font-bold mb-2">Your cart is empty</h2>
          <Button onClick={() => navigateTo('courses')} className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground">Browse Courses</Button>
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
          <BreadcrumbItem><BreadcrumbLink onClick={() => navigateTo('cart')} className="cursor-pointer">Cart</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><span className="text-foreground font-medium">Checkout</span></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="text-2xl sm:text-3xl font-bold mb-6">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Payment Form */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2 space-y-6">
          {/* Student Details */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-primary" /> Student Details</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5" placeholder="Enter your name" />
                  {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5" placeholder="you@example.com" />
                  {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                </div>
                <div>
                  <Label htmlFor="phone">Phone *</Label>
                  <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1.5" placeholder="+91 98765 43210" />
                  {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-primary" /> Payment Method</h2>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                {paymentMethods.map(({ id, label, icon: Icon, desc }) => (
                  <label key={id} className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === id ? 'border-primary bg-primary/5' : 'hover:border-primary/30'}`}>
                    <RadioGroupItem value={id} />
                    <Icon className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{label}</p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                  </label>
                ))}
              </RadioGroup>

              {/* UPI Input */}
              {paymentMethod === 'upi' && (
                <div className="pt-2">
                  <Label htmlFor="upi">UPI ID</Label>
                  <Input id="upi" value={upiId} onChange={(e) => setUpiId(e.target.value)} className="mt-1.5" placeholder="yourname@upi" />
                  {errors.upiId && <p className="text-xs text-destructive mt-1">{errors.upiId}</p>}
                </div>
              )}

              {/* Card Input */}
              {paymentMethod === 'card' && (
                <div className="pt-2 grid sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-3">
                    <Label htmlFor="card">Card Number</Label>
                    <Input id="card" value={cardNumber} onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim())} className="mt-1.5" placeholder="1234 5678 9012 3456" maxLength={19} />
                    {errors.cardNumber && <p className="text-xs text-destructive mt-1">{errors.cardNumber}</p>}
                  </div>
                  <div>
                    <Label htmlFor="expiry">Expiry</Label>
                    <Input id="expiry" value={expiry} onChange={(e) => setExpiry(e.target.value)} className="mt-1.5" placeholder="MM/YY" maxLength={5} />
                    {errors.expiry && <p className="text-xs text-destructive mt-1">{errors.expiry}</p>}
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input id="cvv" type="password" value={cvv} onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))} className="mt-1.5" placeholder="•••" maxLength={4} />
                    {errors.cvv && <p className="text-xs text-destructive mt-1">{errors.cvv}</p>}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Coupon */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-sm font-semibold mb-3">Have a coupon?</h2>
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2.5">
                  <div className="flex items-center gap-2 text-sm">
                    <Tag className="w-4 h-4 text-emerald-600" />
                    <span className="font-medium text-emerald-700">{appliedCoupon.code} — {appliedCoupon.discount}% off</span>
                  </div>
                  <button onClick={removeCoupon} className="text-xs text-emerald-600 font-medium hover:underline">Remove</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input placeholder="Enter coupon code" value={couponInput} onChange={(e) => setCouponInput(e.target.value.toUpperCase())} className="max-w-xs" />
                  <Button variant="outline" onClick={async () => { await applyCoupon(couponInput, cartTotal); setCouponInput('') }}>Apply</Button>
                </div>
              )}
              {couponError && <p className="text-xs text-destructive mt-2">{couponError}</p>}
            </CardContent>
          </Card>
        </motion.div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-24">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-lg font-semibold">Order Summary</h2>
              <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar">
                {cartItems.map(item => (
                  <div key={item.id} className="flex items-start gap-3">
                    {item.thumbnail ? (
                      <img src={item.thumbnail} alt="" className="w-12 h-9 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="w-12 h-9 bg-primary/10 rounded-lg shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.instructor}</p>
                    </div>
                    <span className="text-sm font-medium shrink-0">{formatPrice(item.price)}</span>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(cartTotal)}</span></div>
                {appliedCoupon && <div className="flex justify-between text-emerald-600"><span>Discount</span><span>-{formatPrice(discountAmount)}</span></div>}
                <Separator />
                <div className="flex justify-between font-bold text-lg"><span>Total</span><span>{formatPrice(finalTotal)}</span></div>
              </div>

              <Button
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm gap-2"
                onClick={handleSubmit}
                disabled={processing}
              >
                {processing ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                ) : (
                  <><Lock className="w-4 h-4" /> Place Order & Pay {formatPrice(finalTotal)}</>
                )}
              </Button>

              <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>100% Secure Payment</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Processing Overlay */}
      <AnimatePresence>
        {processing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-card border rounded-2xl p-8 text-center shadow-xl max-w-sm mx-4">
              <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-1">Processing Payment</h3>
              <p className="text-sm text-muted-foreground">Please do not close this page...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}