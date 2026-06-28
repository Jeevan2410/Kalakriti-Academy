'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, ArrowRight, Download, BookOpen, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import useStore from '@/lib/store'
import { useToast } from '@/hooks/use-toast'

function formatPrice(price: number) {
  return '₹' + price.toLocaleString('en-IN')
}

export default function OrderConfirmationPage() {
  const { currentOrder, navigateTo } = useStore()
  const { toast } = useToast()

  const handleDownload = () => {
    toast({ title: 'Invoice downloaded', description: 'Your invoice has been saved.' })
  }

  const order = currentOrder
  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
        <h2 className="text-xl font-bold mb-2">No order found</h2>
        <Button onClick={() => navigateTo('courses')} className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground">Browse Courses</Button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.6 }}
        className="text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-muted-foreground mb-1">Thank you for your purchase. Your courses are ready!</p>
        </motion.div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <Card className="mt-8">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b">
              <div>
                <p className="text-sm text-muted-foreground">Order Number</p>
                <p className="font-semibold text-lg">{order.orderNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>

            <div className="space-y-2.5">
              {order.items?.map(item => (
                <div key={item.id} className="flex items-center gap-3">
                  {item.thumbnail ? (
                    <img src={item.thumbnail} alt="" className="w-14 h-10 rounded-lg object-cover" />
                  ) : (
                    <div className="w-14 h-10 bg-primary/10 rounded-lg" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">{item.title}</p>
                  </div>
                  <span className="text-sm font-medium">{formatPrice(item.price)}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-3 space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
              {order.discount > 0 && <div className="flex justify-between text-emerald-600"><span>Discount</span><span>-{formatPrice(order.discount)}</span></div>}
              <div className="flex justify-between font-bold text-base pt-1"><span>Total Paid</span><span>{formatPrice(order.totalAmount)}</span></div>
            </div>

            <div className="flex items-center gap-2 pt-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Payment via {order.paymentMethod} &middot; {order.paymentStatus}</span>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <Button onClick={() => navigateTo('dashboard')} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
            <BookOpen className="w-4 h-4" /> View My Courses
          </Button>
          <Button variant="outline" onClick={handleDownload} className="flex-1 gap-2">
            <Download className="w-4 h-4" /> Download Invoice
          </Button>
          <Button variant="ghost" onClick={() => navigateTo('courses')} className="flex-1 gap-2">
            Continue Shopping
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
