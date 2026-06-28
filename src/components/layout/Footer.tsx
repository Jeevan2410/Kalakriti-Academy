'use client'

import { Instagram, Youtube, Twitter, Facebook, Mail, MapPin, Phone, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import useStore from '@/lib/store'

const quickLinks = [
  { label: 'All Courses', page: 'courses' as const },
  { label: 'Best Sellers', page: 'courses' as const },
  { label: 'Free Courses', page: 'courses' as const },
  { label: 'My Dashboard', page: 'dashboard' as const },
  { label: 'Order History', page: 'orders' as const },
]

const categories = [
  'Painting & Drawing',
  'Digital Art',
  'Traditional Art',
  'Photography',
  'Calligraphy',
  'Pottery & Sculpture',
]

const socialLinks = [
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Youtube, href: '#', label: 'YouTube' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Facebook, href: '#', label: 'Facebook' },
]

export default function Footer() {
  const { navigateTo, setSort } = useStore()

  const handleNav = (page: typeof quickLinks[0]['page'], sort?: string) => {
    if (sort) setSort(sort)
    navigateTo(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="bg-foreground text-background mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* About */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <img src="/logo.png" alt="Kalakriti Academy" className="w-9 h-9 rounded-lg bg-white/10 p-0.5" />
              <div>
                <span className="font-bold text-sm text-white">Kalakriti</span>
                <span className="font-light text-sm ml-1 text-white/60">Academy</span>
              </div>
            </div>
            <p className="text-sm text-white/60 leading-relaxed mb-5">
              India&apos;s premier online academy for art & craft courses. Learn painting, digital art, traditional crafts, and more from expert instructors.
            </p>
            <div className="flex gap-2.5">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors"
                >
                  <Icon className="w-4 h-4 text-white" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-sm text-white mb-4">Quick Links</h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => handleNav(link.page, link.label === 'Best Sellers' ? 'popular' : link.label === 'Free Courses' ? 'price-low' : undefined)}
                    className="text-sm text-white/60 hover:text-primary transition-colors flex items-center gap-1.5 group"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold text-sm text-white mb-4">Categories</h3>
            <ul className="space-y-2.5">
              {categories.map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => { navigateTo('courses'); }}
                    className="text-sm text-white/60 hover:text-primary transition-colors"
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter + Contact */}
          <div>
            <h3 className="font-semibold text-sm text-white mb-4">Stay Updated</h3>
            <p className="text-sm text-white/60 mb-3">Get notified about new courses and offers.</p>
            <div className="flex gap-2 mb-6">
              <Input
                placeholder="your@email.com"
                className="h-9 bg-white/10 border-white/10 text-white placeholder:text-white/40 text-sm focus-visible:ring-primary"
              />
              <Button size="sm" className="h-9 bg-primary hover:bg-primary/90 text-primary-foreground shrink-0">
                <Mail className="w-3.5 h-3.5" />
              </Button>
            </div>
            <div className="space-y-2.5 text-sm text-white/60">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 shrink-0 text-primary" />
                <span>Mumbai, Maharashtra, India</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 shrink-0 text-primary" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0 text-primary" />
                <span>hello@kalakriti.com</span>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-white/10" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-white/50">
          <p>&copy; {new Date().getFullYear()} Kalakriti Academy. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <span className="text-red-400">&hearts;</span> in India
          </p>
        </div>
      </div>
    </footer>
  )
}