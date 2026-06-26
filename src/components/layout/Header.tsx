'use client'

import { useState } from 'react'
import { Search, ShoppingCart, Menu, X, User, LogOut, LayoutDashboard, BookOpen, Package, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import useStore from '@/lib/store'

const navLinks = [
  { label: 'Home', page: 'home' as const, requiresAuth: false },
  { label: 'Courses', page: 'courses' as const, requiresAuth: false },
  { label: 'Dashboard', page: 'dashboard' as const, requiresAuth: true },
]

export default function Header() {
  const {
    currentPage, navigateTo, setSearchOpen,
    isCartOpen, setCartOpen, cartItemCount,
    isLoggedIn, currentUser, loginAsDemo, logout,
    fetchProducts, setCategory, setLevel, setSort, setSearchQuery,
  } = useStore()

  const [mobileOpen, setMobileOpen] = useState(false)

  const handleNavClick = (page: typeof currentPage, params?: Record<string, string>) => {
    navigateTo(page, params)
    setMobileOpen(false)
    if (page === 'courses') {
      fetchProducts()
    }
  }

  const handleCoursesNav = () => {
    setCategory('')
    setLevel('')
    setSort('')
    setSearchQuery('')
    handleNavClick('courses')
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b backdrop-blur-md bg-background/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button onClick={() => handleNavClick('home')} className="flex items-center gap-2.5 shrink-0">
            <img src="/logo.png" alt="Kalakriti Academy" className="w-9 h-9 rounded-lg object-cover" />
            <div className="hidden sm:block">
              <span className="font-bold text-base tracking-tight">Kalakriti</span>
              <span className="font-light text-base tracking-tight ml-1 text-muted-foreground">Academy</span>
            </div>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              if (link.requiresAuth && !isLoggedIn) return null
              return (
                <Button
                  key={link.page}
                  variant="ghost"
                  size="sm"
                  onClick={() => link.page === 'courses' ? handleCoursesNav() : handleNavClick(link.page)}
                  className={`text-sm font-medium ${currentPage === link.page ? 'text-primary bg-primary/5' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {link.label}
                </Button>
              )
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-1.5">
            {/* Search */}
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setSearchOpen(true)}>
              <Search className="w-[18px] h-[18px]" />
            </Button>

            {/* Cart */}
            <Button variant="ghost" size="icon" className="h-9 w-9 relative" onClick={() => setCartOpen(!isCartOpen)}>
              <ShoppingCart className="w-[18px] h-[18px]" />
              {cartItemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </Button>

            {/* User Menu */}
            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-9 gap-2 px-2.5">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-semibold text-primary">
                        {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <span className="hidden sm:inline text-sm font-medium max-w-24 truncate">{currentUser?.name}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground hidden sm:block" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => handleNavClick('dashboard')}>
                    <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleNavClick('dashboard')}>
                    <BookOpen className="w-4 h-4 mr-2" /> My Courses
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleNavClick('orders')}>
                    <Package className="w-4 h-4 mr-2" /> Order History
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                    <LogOut className="w-4 h-4 mr-2" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                size="sm"
                onClick={loginAsDemo}
                className="h-9 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium px-4"
              >
                <User className="w-4 h-4 mr-1.5" />
                Sign In
              </Button>
            )}

            {/* Mobile Menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 md:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <div className="px-4 py-5 border-b">
                  <div className="flex items-center gap-2.5">
                    <img src="/logo.png" alt="Kalakriti Academy" className="w-8 h-8 rounded-lg" />
                    <div>
                      <span className="font-bold text-sm">Kalakriti</span>
                      <span className="font-light text-sm ml-1 text-muted-foreground">Academy</span>
                    </div>
                  </div>
                </div>
                <nav className="px-2 py-3 space-y-0.5">
                  {navLinks.map((link) => {
                    if (link.requiresAuth && !isLoggedIn) return null
                    return (
                      <Button
                        key={link.page}
                        variant="ghost"
                        className={`w-full justify-start text-sm ${currentPage === link.page ? 'text-primary bg-primary/5' : ''}`}
                        onClick={() => link.page === 'courses' ? handleCoursesNav() : handleNavClick(link.page)}
                      >
                        {link.label}
                      </Button>
                    )
                  })}
                  {isLoggedIn && (
                    <>
                      <div className="my-2 border-t" />
                      <Button variant="ghost" className="w-full justify-start text-sm" onClick={() => handleNavClick('orders')}>
                        <Package className="w-4 h-4 mr-2" /> Order History
                      </Button>
                      <Button variant="ghost" className="w-full justify-start text-sm text-destructive" onClick={logout}>
                        <LogOut className="w-4 h-4 mr-2" /> Sign Out
                      </Button>
                    </>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}