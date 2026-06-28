'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  BookOpen, TrendingUp, CheckCircle2, Clock, PlayCircle, Award,
  ArrowRight, BarChart3
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import useStore from '@/lib/store'

export default function DashboardPage() {
  const { enrollments, fetchEnrollments, currentUser, isLoggedIn, loginAsDemo, navigateTo, fetchProductById } = useStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isLoggedIn && currentUser) {
      fetchEnrollments(currentUser.id).finally(() => setLoading(false))
    } else {
      Promise.resolve().then(() => setLoading(false))
    }
  }, [isLoggedIn, currentUser, fetchEnrollments])

  if (!isLoggedIn) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
          <BarChart3 className="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold mb-2">Welcome to Kalakriti Academy</h2>
        <p className="text-muted-foreground mb-4 max-w-md mx-auto">Sign in to access your dashboard, track your progress, and manage your courses.</p>
        <Button onClick={loginAsDemo} className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
          <PlayCircle className="w-4 h-4" /> Get Started
        </Button>
      </div>
    )
  }

  const totalCourses = enrollments.length
  const inProgress = enrollments.filter(e => e.status === 'active' && e.progress > 0).length
  const completed = enrollments.filter(e => e.status === 'completed').length
  const totalProgress = enrollments.reduce((sum, e) => sum + e.progress, 0)
  const avgProgress = totalCourses > 0 ? Math.round(totalProgress / totalCourses) : 0

  const stats = [
    { label: 'Total Courses', value: totalCourses, icon: BookOpen, color: 'text-primary bg-primary/10' },
    { label: 'In Progress', value: inProgress, icon: Clock, color: 'text-amber-600 bg-amber-100' },
    { label: 'Completed', value: completed, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-100' },
    { label: 'Avg Progress', value: `${avgProgress}%`, icon: TrendingUp, color: 'text-violet-600 bg-violet-100' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink onClick={() => navigateTo('home')} className="cursor-pointer">Home</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><span className="text-foreground font-medium">Dashboard</span></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-amber-500 p-6 sm:p-8 mb-8 text-white"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        </div>
        <div className="relative">
          <h1 className="text-xl sm:text-2xl font-bold mb-1">Welcome back, {currentUser?.name || 'Student'}!</h1>
          <p className="text-white/80 text-sm">Continue your creative journey. You have {inProgress > 0 ? `${inProgress} course${inProgress > 1 ? 's' : ''} in progress` : 'no courses in progress'}. Let&apos;s keep learning!</p>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{value}</p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* My Courses */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">My Courses</h2>
          <Button variant="ghost" className="text-primary text-sm" onClick={() => navigateTo('courses')}>
            Browse More <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-44 rounded-xl" />)}
          </div>
        ) : enrollments.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-1">No courses yet</h3>
              <p className="text-sm text-muted-foreground mb-4">Start your learning journey today!</p>
              <Button onClick={() => navigateTo('courses')} className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                Explore Courses <ArrowRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All ({totalCourses})</TabsTrigger>
              <TabsTrigger value="progress">In Progress ({inProgress})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({completed})</TabsTrigger>
            </TabsList>

            {['all', 'progress', 'completed'].map(tab => (
              <TabsContent key={tab} value={tab}>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {enrollments
                    .filter(e => {
                      if (tab === 'progress') return e.status === 'active' && e.progress > 0
                      if (tab === 'completed') return e.status === 'completed' || e.progress >= 100
                      return true
                    })
                    .map(enrollment => (
                      <Card key={enrollment.id} className="overflow-hidden hover:shadow-md transition-shadow">
                        <CardContent className="p-0">
                          <div className="flex">
                            {enrollment.product?.thumbnail ? (
                              <img src={enrollment.product.thumbnail} alt="" className="w-24 h-24 object-cover shrink-0" />
                            ) : (
                              <div className="w-24 h-24 bg-primary/10 shrink-0" />
                            )}
                            <div className="p-4 flex-1 min-w-0 flex flex-col justify-between">
                              <div>
                                <h4 className="text-sm font-medium line-clamp-1">{enrollment.product?.title || 'Course'}</h4>
                                <p className="text-xs text-muted-foreground">{enrollment.product?.instructor}</p>
                              </div>
                              <div className="space-y-2 mt-2">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-muted-foreground">Progress</span>
                                  <span className="font-medium">{Math.round(enrollment.progress)}%</span>
                                </div>
                                <Progress value={enrollment.progress} className="h-1.5" />
                              </div>
                            </div>
                          </div>
                          <div className="px-4 pb-3 pt-2 border-t flex items-center justify-between">
                            {(enrollment.status === 'completed' || enrollment.progress >= 100) ? (
                              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-[10px]">
                                <CheckCircle2 className="w-3 h-3 mr-1" /> Completed
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-[10px]">
                                <Clock className="w-3 h-3 mr-1" /> In Progress
                              </Badge>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs text-primary"
                              onClick={() => {
                                if (enrollment.product?.id) {
                                  fetchProductById(enrollment.product.id)
                                  navigateTo('course-detail', { id: enrollment.product.id })
                                }
                              }}
                            >
                              {enrollment.status === 'completed' ? 'Review' : 'Continue'} <PlayCircle className="w-3 h-3 ml-1" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
            ))}
          </Tabs>
        )}
      </motion.div>
    </div>
  )
}