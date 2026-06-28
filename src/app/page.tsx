'use client'

import { useEffect } from 'react'
import { useStore } from '@/lib/store'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import SearchDialog from '@/components/shared/SearchDialog'
import CartSheet from '@/components/shared/CartSheet'
import HomePage from '@/components/pages/HomePage'
import CoursesPage from '@/components/pages/CoursesPage'
import CourseDetailPage from '@/components/pages/CourseDetailPage'
import CartPage from '@/components/pages/CartPage'
import CheckoutPage from '@/components/pages/CheckoutPage'
import OrderConfirmationPage from '@/components/pages/OrderConfirmationPage'
import OrderHistoryPage from '@/components/pages/OrderHistoryPage'
import DashboardPage from '@/components/pages/DashboardPage'

export default function Home() {
  const { currentPage, fetchProducts } = useStore()

  // Seed data and fetch products on first load
  useEffect(() => {
    fetch('/api/seed', { method: 'POST' }).catch(() => {})
    fetchProducts({ featured: 'true', limit: '6' }).catch(() => {})
  }, [])

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentPage])

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />
      case 'courses':
        return <CoursesPage />
      case 'course-detail':
        return <CourseDetailPage />
      case 'cart':
        return <CartPage />
      case 'checkout':
        return <CheckoutPage />
      case 'order-confirmation':
        return <OrderConfirmationPage />
      case 'orders':
        return <OrderHistoryPage />
      case 'dashboard':
        return <DashboardPage />
      default:
        return <HomePage />
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {renderPage()}
      </main>
      <Footer />
      <SearchDialog />
      <CartSheet />
    </div>
  )
}