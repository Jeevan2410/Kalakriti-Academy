'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowRight, Search, Users, BookOpen, Award, Star,
  Palette, Monitor, Brush, Camera, PenTool, Flame,
  Quote, ChevronRight, Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import CourseCard from '@/components/shared/CourseCard'
import useStore from '@/lib/store'

const categoryIcons: Record<string, React.ReactNode> = {
  'Painting & Drawing': <Palette className="w-6 h-6" />,
  'Digital Art': <Monitor className="w-6 h-6" />,
  'Traditional Art': <Brush className="w-6 h-6" />,
  'Photography': <Camera className="w-6 h-6" />,
  'Calligraphy': <PenTool className="w-6 h-6" />,
  'Pottery & Sculpture': <Flame className="w-6 h-6" />,
}

const stats = [
  { value: '10,000+', label: 'Students', icon: Users },
  { value: '50+', label: 'Courses', icon: BookOpen },
  { value: '25+', label: 'Instructors', icon: Award },
  { value: '4.8', label: 'Rating', icon: Star },
]

const testimonials = [
  {
    name: 'Priya Sharma',
    course: 'Watercolor Masterclass',
    rating: 5,
    text: 'The watercolor course completely transformed my painting skills. The instructor explains every technique so clearly. I went from beginner to painting professional-level artworks in just 3 months!',
  },
  {
    name: 'Arjun Patel',
    course: 'Digital Art with Procreate',
    rating: 5,
    text: 'As a self-taught digital artist, this course filled all the gaps in my knowledge. The curriculum is well-structured and the community support is amazing. Worth every rupee!',
  },
  {
    name: 'Meera Krishnan',
    course: 'Madhubani Art',
    rating: 5,
    text: 'Learning traditional Madhubani art online seemed impossible, but Kalakriti made it accessible and fun. The step-by-step approach and detailed video lessons are outstanding.',
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
}

export default function HomePage() {
  const { fetchProducts, products, navigateTo, setSearchQuery, setCategory, setSort, productsLoading } = useStore()
  const [featured, setFeatured] = useState<typeof products>([])
  const [bestSellers, setBestSellers] = useState<typeof products>([])
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string; color: string | null; icon: string | null; _count: { products: number } }[]>([])
  const [heroSearch, setHeroSearch] = useState('')

  useEffect(() => {
    fetchProducts({ featured: 'true', limit: '6' }).then(() => {
      setFeatured(useStore.getState().products)
    })
  }, [fetchProducts])

  useEffect(() => {
    fetchProducts({ bestSeller: 'true', limit: '4' }).then(() => {
      setBestSellers(useStore.getState().products)
    })
  }, [fetchProducts])

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(d => setCategories(d.categories ?? []))
  }, [])

  const handleHeroSearch = () => {
    setSearchQuery(heroSearch)
    navigateTo('courses')
    fetchProducts({ q: heroSearch })
  }

  const handleCategoryClick = (slug: string) => {
    setCategory(slug)
    navigateTo('courses')
    fetchProducts({ category: slug })
  }

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-background">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20 lg:py-28">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="max-w-3xl mx-auto text-center"
          >
            <motion.div variants={fadeUp}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                India&apos;s #1 Art & Craft Learning Platform
              </span>
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight mb-4">
              Unlock Your{' '}
              <span className="text-primary">Creative</span>
              {' '}Potential
            </motion.h1>
            <motion.p variants={fadeUp} className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto mb-8">
              Learn art & craft from India&apos;s best instructors. Master painting, digital art, traditional crafts, photography, and more.
            </motion.p>
            <motion.div variants={fadeUp} className="flex items-center gap-3 max-w-lg mx-auto mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="What do you want to learn?"
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleHeroSearch()}
                  className="pl-10 h-12 rounded-xl text-base"
                />
              </div>
              <Button onClick={handleHeroSearch} className="h-12 px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium">
                <Search className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Search</span>
              </Button>
            </motion.div>
            <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-3">
              <Button
                onClick={() => navigateTo('courses')}
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6"
                size="lg"
              >
                Explore Courses <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                onClick={() => { setSort('newest'); navigateTo('courses'); fetchProducts({ sort: 'newest' }) }}
                variant="outline"
                className="rounded-xl px-6"
                size="lg"
              >
                Start Learning
              </Button>
            </motion.div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto"
          >
            {stats.map(({ value, label, icon: Icon }) => (
              <div key={label} className="text-center">
                <Icon className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="text-xl sm:text-2xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={stagger}
        >
          <motion.div variants={fadeUp} className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold">Featured Courses</h2>
              <p className="text-muted-foreground text-sm mt-1">Handpicked by our experts for you</p>
            </div>
            <Button
              variant="ghost"
              className="text-primary hover:text-primary/80"
              onClick={() => navigateTo('courses')}
            >
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </motion.div>
          {productsLoading && featured.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-72 rounded-2xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : (
            <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.slice(0, 6).map((product) => (
                <CourseCard key={product.id} product={product} />
              ))}
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* Categories */}
      <section className="bg-muted/40 py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={stagger}
          >
            <motion.div variants={fadeUp} className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold">Browse by Category</h2>
              <p className="text-muted-foreground text-sm mt-1">Find the perfect course for your creative journey</p>
            </motion.div>
            <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <Card
                  key={cat.id}
                  className="cursor-pointer group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20"
                  onClick={() => handleCategoryClick(cat.slug)}
                >
                  <CardContent className="p-5 flex flex-col items-center text-center gap-3">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110"
                      style={{ backgroundColor: (cat.color || '#E85D04') + '15', color: cat.color || '#E85D04' }}
                    >
                      {categoryIcons[cat.name] || <Palette className="w-6 h-6" />}
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">{cat.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{cat._count?.products ?? 0} courses</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={stagger}
        >
          <motion.div variants={fadeUp} className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold">Best Sellers</h2>
              <p className="text-muted-foreground text-sm mt-1">Most popular courses loved by students</p>
            </div>
            <Button
              variant="ghost"
              className="text-primary hover:text-primary/80"
              onClick={() => { setSort('popular'); navigateTo('courses'); fetchProducts({ sort: 'popular' }) }}
            >
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </motion.div>
          <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {bestSellers.slice(0, 4).map((product) => (
              <CourseCard key={product.id} product={product} />
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Testimonials */}
      <section className="bg-muted/40 py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={stagger}
          >
            <motion.div variants={fadeUp} className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold">What Our Students Say</h2>
              <p className="text-muted-foreground text-sm mt-1">Real stories from our creative community</p>
            </motion.div>
            <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <Card key={i} className="border-border/50">
                  <CardContent className="p-6 flex flex-col gap-4">
                    <Quote className="w-8 h-8 text-primary/20" />
                    <p className="text-sm leading-relaxed text-muted-foreground flex-1">{t.text}</p>
                    <div className="flex items-center gap-3 pt-2 border-t">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-sm font-semibold text-primary">{t.name.charAt(0)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{t.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{t.course}</p>
                      </div>
                      <div className="flex gap-0.5 shrink-0">
                        {Array.from({ length: t.rating }).map((_, j) => (
                          <Star key={j} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-amber-500 p-8 sm:p-12 lg:p-16 text-center"
        >
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          </div>
          <div className="relative">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
              Ready to Start Your Creative Journey?
            </h2>
            <p className="text-white/80 max-w-lg mx-auto mb-8">
              Join thousands of students learning art and craft online. Your first masterpiece is just one course away.
            </p>
            <Button
              size="lg"
              onClick={() => navigateTo('courses')}
              className="bg-white text-primary hover:bg-white/90 rounded-xl px-8 font-semibold"
            >
              Browse Courses <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  )
}