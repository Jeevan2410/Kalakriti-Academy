'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Package, Clock, Eye, ChevronDown, ChevronUp, ArrowRight, ShoppingBag } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import useStore from '@/lib/store'

function formatPrice(price: number) {
  return '₹' + price.toLocaleString('en-IN')
}

const statusColors: Record<string, string> = {
  completed: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100',
  pending: 'bg-amber-100 text-amber-700 hover:bg-amber-100',
  cancelled: 'bg-red-100 text-red-700 hover:bg-red-100',
  refunded: 'bg-gray-100 text-gray-700 hover:bg-gray-100',
}

export default function OrderHistoryPage() {
  const { orders, ordersLoading, fetchOrders, currentUser, isLoggedIn, loginAsDemo, navigateTo, fetchProductById } = useStore()
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

  useEffect(() => {
    if (isLoggedIn && currentUser) {
      fetchOrders(currentUser.id)
    }
  }, [isLoggedIn, currentUser])

  if (!isLoggedIn) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
          <Package className="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold mb-2">Sign In Required</h2>
        <p className="text-muted-foreground mb-4">Please sign in to view your order history.</p>
        <Button onClick={loginAsDemo} className="bg-primary hover:bg-primary/90 text-primary-foreground">Sign In</Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink onClick={() => navigateTo('home')} className="cursor-pointer">Home</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><span className="text-foreground font-medium">My Orders</span></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="text-2xl sm:text-3xl font-bold mb-6">Order History</h1>

      {ordersLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
            <ShoppingBag className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold mb-2">No orders yet</h2>
          <p className="text-muted-foreground mb-6">Your purchased courses will appear here.</p>
          <Button onClick={() => navigateTo('courses')} className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
            Browse Courses <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isExpanded = expandedOrder === order.id
            return (
              <Card key={order.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <button
                    className="w-full text-left p-4 sm:p-5 flex items-center gap-4 hover:bg-muted/30 transition-colors"
                    onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Package className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-sm sm:text-base">{order.orderNumber}</h3>
                        <Badge variant="secondary" className={statusColors[order.status] || ''}>{order.status}</Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        <span>{order.items?.length ?? 0} course{(order.items?.length ?? 0) !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold text-sm sm:text-base">{formatPrice(order.totalAmount)}</p>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground mx-auto mt-1" /> : <ChevronDown className="w-4 h-4 text-muted-foreground mx-auto mt-1" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Separator />
                      <div className="p-4 sm:p-5 space-y-3">
                        {order.items?.map(item => (
                          <div key={item.id} className="flex items-center gap-3">
                            {item.thumbnail ? (
                              <img src={item.thumbnail} alt="" className="w-14 h-10 rounded-lg object-cover shrink-0" />
                            ) : (
                              <div className="w-14 h-10 bg-primary/10 rounded-lg shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium line-clamp-1">{item.title}</p>
                            </div>
                            <span className="text-sm font-medium">{formatPrice(item.price)}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs shrink-0"
                              onClick={() => { fetchProductById(item.productId); navigateTo('course-detail', { id: item.productId }) }}
                            >
                              <Eye className="w-3 h-3 mr-1" /> View
                            </Button>
                          </div>
                        ))}
                        <div className="pt-2 border-t flex justify-between text-sm">
                          <span className="text-muted-foreground">Payment via {order.paymentMethod}</span>
                          <span className="text-muted-foreground">{order.paymentStatus}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}