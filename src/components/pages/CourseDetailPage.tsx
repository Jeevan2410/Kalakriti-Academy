'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Star, Users, Clock, Award, BookOpen, Globe, GraduationCap,
  ChevronDown, ChevronUp, Play, FileText, HelpCircle,
  Share2, Heart, ShoppingCart, Zap, CheckCircle2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import useStore from '@/lib/store'
import type { Product } from '@/lib/store'

function formatPrice(price: number) {
  return '₹' + price.toLocaleString('en-IN')
}

function getDiscount(price: number, original: number | null) {
  if (!original || original <= price) return 0
  return Math.round(((original - price) / original) * 100)
}

const lessonIcons: Record<string, React.ReactNode> = {
  video: <Play className="w-4 h-4" />,
  article: <FileText className="w-4 h-4" />,
  quiz: <HelpCircle className="w-4 h-4" />,
  resource: <BookOpen className="w-4 h-4" />,
}

export default function CourseDetailPage() {
  const { currentProduct, fetchProductById, navigationParams, addToCart, navigateTo, isLoggedIn, loginAsDemo, goBack } = useStore()
  const [loading, setLoading] = useState(true)

  const id = navigationParams?.id

  // Track which product ID we've loaded
  useEffect(() => {
    if (id && (!currentProduct || currentProduct.id !== id)) {
      fetchProductById(id).finally(() => setLoading(false))
    } else if (!id) {
      // No ID yet
      void 0
    } else {
      // Product already matches, mark loaded via async tick
      Promise.resolve().then(() => setLoading(false))
    }
  }, [id])

  if (loading || !currentProduct) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-64 sm:h-80 rounded-2xl" />
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-72 rounded-2xl" />
          </div>
        </div>
      </div>
    )
  }

  const p = currentProduct
  const discount = getDiscount(p.price, p.originalPrice)
  const totalLessons = p.chapters?.reduce((sum, ch) => sum + (ch.lessons?.length ?? 0), 0) ?? p.lessons
  const freeLessons = p.chapters?.reduce((sum, ch) => sum + ch.lessons.filter(l => ch.isFree).length, 0) ?? 0

  const handleAddToCart = () => {
    if (!isLoggedIn) loginAsDemo()
    addToCart({ id: p.id, title: p.title, thumbnail: p.thumbnail, price: p.price, originalPrice: p.originalPrice, instructor: p.instructor })
  }

  const handleBuyNow = () => {
    if (!isLoggedIn) loginAsDemo()
    addToCart({ id: p.id, title: p.title, thumbnail: p.thumbnail, price: p.price, originalPrice: p.originalPrice, instructor: p.instructor })
    navigateTo('checkout')
  }

  const infoItems = [
    { icon: Award, label: 'Level', value: p.level },
    { icon: Clock, label: 'Duration', value: p.duration || `${p.lessons} lessons` },
    { icon: BookOpen, label: 'Lessons', value: `${totalLessons} lessons` },
    { icon: Users, label: 'Students', value: p.students.toLocaleString('en-IN') },
    { icon: Globe, label: 'Language', value: 'English' },
    { icon: GraduationCap, label: 'Certificate', value: 'Yes' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink onClick={() => navigateTo('home')} className="cursor-pointer">Home</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbLink onClick={() => navigateTo('courses')} className="cursor-pointer">Courses</BreadcrumbLink></BreadcrumbItem>
          {p.category && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem><span className="text-muted-foreground">{p.category.name}</span></BreadcrumbItem>
            </>
          )}
          <BreadcrumbSeparator />
          <BreadcrumbItem><span className="text-foreground font-medium line-clamp-1 max-w-48">{p.title}</span></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 space-y-8"
        >
          {/* Thumbnail */}
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-muted">
            {p.thumbnail ? (
              <img src={p.thumbnail} alt={p.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-amber-100 flex items-center justify-center">
                <Play className="w-16 h-16 text-primary/40" />
              </div>
            )}
            {freeLessons > 0 && (
              <Badge className="absolute bottom-4 left-4 bg-black/70 text-white hover:bg-black/70">
                <Play className="w-3 h-3 mr-1" /> {freeLessons} Free Preview Lessons
              </Badge>
            )}
          </div>

          {/* Title & Meta */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {p.bestSeller && <Badge className="bg-amber-500 text-white hover:bg-amber-600"><Award className="w-3 h-3 mr-1" /> Bestseller</Badge>}
              {p.featured && <Badge className="bg-primary text-primary-foreground">Featured</Badge>}
              <Badge variant="secondary">{p.level}</Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-3">{p.title}</h1>
            <p className="text-sm text-muted-foreground mb-4">{p.shortDesc || p.description?.slice(0, 200)}</p>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <span className="font-bold text-lg">{p.rating.toFixed(1)}</span>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.round(p.rating) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`} />
                ))}
              </div>
              <span className="text-muted-foreground">({p.ratingCount.toLocaleString('en-IN')} ratings)</span>
              <span className="text-muted-foreground">{p.students.toLocaleString('en-IN')} students</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Created by <span className="text-primary font-medium cursor-pointer">{p.instructor}</span>
            </p>
          </div>

          {/* What You'll Learn */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">What You&apos;ll Learn</h2>
              <div className="grid sm:grid-cols-2 gap-2.5">
                {p.description.split('\n').filter(Boolean).slice(0, 8).map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{item.replace(/^[-•*]\s*/, '')}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Curriculum */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Course Curriculum</h2>
                <span className="text-sm text-muted-foreground">{p.chapters?.length ?? 0} chapters &middot; {totalLessons} lessons</span>
              </div>
              <Accordion type="multiple" className="space-y-2">
                {p.chapters?.map((chapter) => (
                  <AccordionItem key={chapter.id} value={chapter.id} className="border rounded-xl px-4">
                    <AccordionTrigger className="text-sm font-medium hover:no-underline py-3">
                      <div className="flex items-center gap-3 text-left">
                        <span className="font-mono text-xs text-muted-foreground">{String(chapter.order + 1).padStart(2, '0')}</span>
                        <span className="flex-1">{chapter.title}</span>
                        {chapter.duration && (
                          <span className="text-xs text-muted-foreground">{chapter.duration}</span>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pb-2 space-y-1">
                        {chapter.lessons.map((lesson) => (
                          <div key={lesson.id} className="flex items-center gap-3 py-1.5 text-sm">
                            <span className="text-muted-foreground">{lessonIcons[lesson.type] || <Play className="w-4 h-4" />}</span>
                            <span className="flex-1">{lesson.title}</span>
                            {lesson.duration && <span className="text-xs text-muted-foreground">{lesson.duration}</span>}
                            {chapter.isFree && (
                              <Badge variant="secondary" className="text-[10px] bg-emerald-50 text-emerald-600 hover:bg-emerald-50">Free</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          {/* Reviews */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Student Reviews</h2>
              {p.reviews && p.reviews.length > 0 ? (
                <div className="space-y-4">
                  {p.reviews.map((review) => (
                    <div key={review.id} className="flex gap-3 pb-4 border-b last:border-0 last:pb-0">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-sm font-semibold text-primary">
                          {review.user?.name?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium">{review.user?.name || 'Student'}</span>
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`} />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        {review.comment && <p className="text-sm text-muted-foreground mt-1">{review.comment}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-6">No reviews yet. Be the first to review!</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Sticky Sidebar */}
        <div className="lg:sticky lg:top-24 lg:self-start space-y-4">
          <Card className="overflow-hidden">
            <CardContent className="p-6 space-y-5">
              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold">{formatPrice(p.price)}</span>
                {p.originalPrice && p.originalPrice > p.price && (
                  <>
                    <span className="text-lg text-muted-foreground line-through">{formatPrice(p.originalPrice)}</span>
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">{discount}% OFF</Badge>
                  </>
                )}
              </div>

              {/* CTA Buttons */}
              <div className="space-y-2.5">
                <Button
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm gap-2"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="w-4 h-4" /> Add to Cart
                </Button>
                <Button
                  className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 font-semibold text-sm gap-2"
                  onClick={handleBuyNow}
                >
                  <Zap className="w-4 h-4" /> Buy Now
                </Button>
              </div>

              <Separator />

              {/* Course Info */}
              <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                {infoItems.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="font-medium text-xs">{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Instructor */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-base font-semibold text-primary">{p.instructor.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-sm font-medium">{p.instructor}</p>
                  <p className="text-xs text-muted-foreground">Course Instructor</p>
                </div>
              </div>

              {/* Share */}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="flex-1 text-xs h-8">
                  <Share2 className="w-3.5 h-3.5 mr-1.5" /> Share
                </Button>
                <Button variant="outline" size="sm" className="flex-1 text-xs h-8">
                  <Heart className="w-3.5 h-3.5 mr-1.5" /> Wishlist
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}