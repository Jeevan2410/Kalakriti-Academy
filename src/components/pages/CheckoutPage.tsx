'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Wallet, ShieldCheck, Lock, Loader2,
  CheckCircle2, Tag
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  { id: 'razorpay', label: 'Razorpay (UPI, Card, Net Banking)', icon: Wallet, desc: 'All payment methods via Razorpay — UPI, Cards, Wallets, Net Banking' },
]

// Extend window type for Razorpay
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance
  }
}

interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  handler: (response: RazorpayResponse) => void
  prefill: { name: string; email: string; contact: string }
  theme: { color: string }
  modal?: { ondismiss?: () => void }
}

interface RazorpayInstance {
  open: () => void
}

interface RazorpayResponse {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

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

  const [paymentMethod, setPaymentMethod] = useState('razorpay')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [couponInput, setCouponInput] = useState('')
  const [processing, setProcessing] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [razorpayLoaded, setRazorpayLoaded] = useState(false)
  const [razorpayKeyId, setRazorpayKeyId] = useState<string | null>(null)

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name)
      setEmail(currentUser.email)
    }
  }, [currentUser])

  // Check if Razorpay is configured
  useEffect(() => {
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    if (keyId) {
      setRazorpayKeyId(keyId)
      // Load Razorpay script
      if (typeof window !== 'undefined' && !window.Razorpay) {
        const script = document.createElement('script')
        script.src = 'https://checkout.razorpay.com/v1/checkout.js'
        script.async = true
        script.onload = () => setRazorpayLoaded(true)
        script.onerror = () => {
          console.warn('Razorpay script failed to load — will use simulated payment')
          setRazorpayLoaded(false)
        }
        document.body.appendChild(script)
      } else if (window.Razorpay) {
        setRazorpayLoaded(true)
      }
    }
  }, [])

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = 'Name is required'
    if (!email.trim() || !email.includes('@')) errs.email = 'Valid email is required'
    if (!phone.trim() || phone.length < 10) errs.phone = 'Valid phone is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleRazorpayPayment = async () => {
    if (!validate()) return

    setProcessing(true)
    try {
      // Step 1: Create Razorpay order from our backend
      const orderRes = await fetch('/api/payments/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: finalTotal,
          currency: 'INR',
          receipt: `KA_${Date.now()}`,
          notes: { userId: currentUser?.id },
        }),
      })

      if (!orderRes.ok) throw new Error('Failed to create payment order')
      const orderData = await orderRes.json()

      // Step 2: If Razorpay is configured, open the checkout modal
      if (!orderData.simulated && window.Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const options: RazorpayOptions = {
            key: orderData.key,
            amount: orderData.amount,
            currency: orderData.currency,
            name: 'Kalakriti Academy',
            description: `${cartItems.length} course(s) purchase`,
            order_id: orderData.id,
            handler: async (response: RazorpayResponse) => {
              try {
                // Step 3: Verify payment
                const verifyRes = await fetch('/api/payments/razorpay/verify', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(response),
                })
                const verifyData = await verifyRes.json()

                if (verifyData.verified) {
                  // Step 4: Create the order in our database
                  const order = await createOrder({
                    userId: currentUser?.id,
                    couponCode: appliedCoupon?.code,
                    paymentMethod: 'razorpay',
                  })
                  toast({ title: 'Payment successful!', description: `Order ${order.orderNumber} confirmed.` })
                  navigateTo('order-confirmation')
                  resolve()
                } else {
                  reject(new Error('Payment verification failed'))
                }
              } catch (err) {
                reject(err)
              }
            },
            prefill: {
              name: name,
              email: email,
              contact: phone,
            },
            theme: { color: '#c2410c' }, // Saffron/primary color
            modal: {
              ondismiss: () => {
                setProcessing(false)
                reject(new Error('Payment cancelled by user'))
              },
            },
          }

          const rzp = new window.Razorpay(options)
          rzp.open()
        })
      } else {
        // Simulated payment (no Razorpay keys configured)
        await new Promise(resolve => setTimeout(resolve, 1500))
        const order = await createOrder({
          userId: currentUser?.id,
          couponCode: appliedCoupon?.code,
          paymentMethod: 'razorpay',
        })
        toast({ title: 'Payment successful! (Demo Mode)', description: `Order ${order.orderNumber} confirmed. Configure Razorpay keys for real payments.` })
        navigateTo('order-confirmation')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      if (message !== 'Payment cancelled by user') {
        toast({ title: 'Payment failed', description: message, variant: 'destructive' })
      }
    } finally {
      setProcessing(false)
    }
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

    await handleRazorpayPayment()
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
                    <div className="flex-1">
                      <p className="text-sm font-medium">{label}</p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                    {!razorpayKeyId && (
                      <Badge variant="secondary" className="text-[10px] bg-amber-50 text-amber-700">Demo Mode</Badge>
                    )}
                  </label>
                ))}
              </RadioGroup>

              {!razorpayKeyId && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                  <strong>Demo Mode:</strong> Razorpay is not configured. Payments are simulated. To enable real payments, add your Razorpay API keys in the <code className="bg-amber-100 px-1 rounded">.env</code> file.
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
                <span>100% Secure Payment via Razorpay</span>
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
              <p className="text-sm text-muted-foreground">Please complete the payment...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}