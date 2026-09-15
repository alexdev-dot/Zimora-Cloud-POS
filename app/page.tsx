"use client"

import React, { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  Box, 
  BarChart3, 
  Users, 
  Zap, 
  Shield, 
  Smartphone,
  ArrowRight,
  CheckCircle,
  Crown,
  Building2,
  Mail,
  Check,
  Menu,
  X,
  Star,
  Send
} from "lucide-react"
import { motion, useScroll, useTransform, AnimatePresence, useInView } from "framer-motion"

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0 }
}

const fadeInLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0 }
}

const fadeInRight = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0 }
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 }
}

const slideInFromBottom = {
  hidden: { opacity: 0, y: 100 },
  visible: { opacity: 1, y: 0 }
}

const features = [
  {
    icon: Box,
    title: "Inventory Management",
    description: "Track stock levels, set low-stock alerts, and manage suppliers effortlessly.",
  },
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description: "Get instant insights into sales performance, trends, and customer behavior.",
  },
  {
    icon: Users,
    title: "Multi-user Access",
    description: "Assign roles and permissions to your team for secure collaboration.",
  },
  {
    icon: Zap,
    title: "Fast Checkout",
    description: "Process transactions quickly with barcode scanning and integrated payments.",
  },
  {
    icon: Shield,
    title: "Secure & Reliable",
    description: "Enterprise-grade security with data encryption and regular backups.",
  },
  {
    icon: Smartphone,
    title: "Works Everywhere",
    description: "Access your POS from any device - desktop, tablet, or mobile.",
  },
  {
    icon: Check,
    title: "Easy Setup",
    description: "Get started in minutes. Import existing inventory, train staff quickly, and migrate from your current system.",
  },
  {
    icon: Mail,
    title: "24/7 Support",
    description: "Local support team available via phone, WhatsApp, and email. Free training sessions and setup assistance.",
  }
]

const benefits = [
  "Save time with automated inventory tracking",
  "Reduce errors with barcode scanning",
  "Make data-driven decisions with real-time reports",
  "Improve customer experience with faster checkout",
  "Scale your business with multi-location support",
  "Stay compliant with integrated tax management",
]

const plans = [
  {
    id: "starter",
    name: "Starter",
    icon: Zap,
    price: "KSh 2,500",
    period: "/month",
    description: "Basic POS for small businesses",
    features: ["Basic POS", "Product Management", "Basic Inventory", "Sales Reports", "Email Support", "Up to 2 users", "1 location"],
    popular: false
  },
  {
    id: "professional",
    name: "Professional",
    icon: Crown,
    price: "KSh 4,999",
    period: "/month",
    description: "Professional plan with advanced features",
    features: ["Everything in Business", "Multi-location support", "Advanced analytics", "Staff roles & permissions", "Priority support", "Up to 30 users", "10 locations"],
    popular: true
  },
  {
    id: "enterprise",
    name: "Enterprise",
    icon: Building2,
    price: "KSh 120,000",
    period: "one-time",
    description: "One-time payment plan for large businesses or lifetime usage",
    features: ["Lifetime access", "Unlimited users & locations", "Dedicated account support", "Custom feature enablement", "Data migration assistance", "Up to 100 users", "100 locations"],
    popular: false
  }
]

// Animated counter component
function AnimatedCounter({ end, duration = 2, suffix = "" }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    let startTime: number
    let animationFrame: number
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1)
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      setCount(Math.floor(easeOutQuart * end))
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }
    
    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [end, duration])
  
  return <span>{count.toLocaleString()}{suffix}</span>
}

// Scroll-triggered animation wrapper
function ScrollReveal({ children, variants = fadeInUp, className = "" }: { children: React.ReactNode; variants?: any; className?: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { scrollY } = useScroll()
  const navY = useTransform(scrollY, [0, 100], [0, -20])
  const navOpacity = useTransform(scrollY, [0, 100], [1, 0.95])
  const navShadow = useTransform(scrollY, [0, 100], [0, 0.1])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-white"
    >
      {/* Navigation */}
      <motion.nav
        style={{ y: navY, opacity: navOpacity, boxShadow: navShadow ? `0 1px 3px rgba(0,0,0,${navShadow})` : 'none' }}
        className="sticky top-0 z-50 bg-navy border-b border-slate-200 backdrop-blur-sm"
      >
        <div className="container mx-auto flex h-24 items-center justify-between px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center"
            aria-label="Zimora Cloud POS home"
          >
            <Image
              src="/logo.png"
              alt="Zimora Cloud POS"
              width={558}
              height={447}
              className="h-16 md:h-20 w-auto object-contain"
              priority
            />
          </Link>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-6 lg:gap-8">
              <Link href="#features" className="text-sm sm:text-base font-medium text-white/80 hover:text-white transition-colors">
                Features
              </Link>
              <Link href="#pricing" className="text-sm sm:text-base font-medium text-white/80 hover:text-white transition-colors">
                Pricing
              </Link>
              <Link href="#support" className="text-sm sm:text-base font-medium text-white/80 hover:text-white transition-colors">
                Support
              </Link>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" className="text-sm sm:text-base font-medium text-white hover:bg-white/10 h-10 sm:h-11 px-4 sm:px-5">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="text-sm sm:text-base font-medium bg-primary hover:bg-primary/90 h-10 sm:h-11 px-4 sm:px-5 rounded-full">
                  Get Started
                </Button>
              </Link>
            </div>
            <motion.button
              className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <AnimatePresence mode="wait">
                {mobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="h-6 w-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="h-6 w-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden border-t border-white/10 bg-navy overflow-hidden"
            >
              <div className="container mx-auto px-6 py-6 space-y-4">
                <Link
                  href="#features"
                  className="block text-lg font-medium text-white/80 hover:text-white transition-colors py-3"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Features
                </Link>
                <Link
                  href="#pricing"
                  className="block text-lg font-medium text-white/80 hover:text-white transition-colors py-3"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pricing
                </Link>
                <Link
                  href="#support"
                  className="block text-lg font-medium text-white/80 hover:text-white transition-colors py-3"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Support
                </Link>
                <div className="pt-4 space-y-3">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full text-lg font-medium text-white hover:bg-white/10 h-12">
                      Login
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full text-lg font-medium bg-primary hover:bg-primary/90 h-12 rounded-full">
                      Get Started
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, 0]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-32 -right-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
          />
          <motion.div 
            animate={{ 
              scale: [1.1, 1, 1.1],
              rotate: [5, 0, 5]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-32 -left-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"
          />
          <motion.div 
            animate={{ 
              y: [0, -20, 0]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 left-1/4 w-64 h-64 bg-amber-500/5 rounded-full blur-2xl"
          />
        </div>

        <div className="container mx-auto px-6 lg:px-8 py-20 md:py-32 lg:py-40 relative">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content - Asymmetric Layout */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="lg:col-span-7 max-w-3xl"
            >
              {/* Main Headline */}
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 text-slate-900"
              >
                Transform Your
                <br />
                <span className="relative inline-block">
                  <span className="relative z-10 bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
                    Retail Business
                  </span>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 1, duration: 0.8 }}
                    className="absolute bottom-1 left-0 h-3 bg-primary/20 -z-0"
                  />
                </span>
              </motion.h1>

              {/* Subheadline */}
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="text-lg sm:text-xl md:text-2xl text-slate-600 mb-8 leading-relaxed max-w-2xl"
              >
                The POS system that understands African markets. Track sales in KSh, manage inventory across locations, and grow your business with insights that matter.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 mb-10"
              >
                <Link href="/signup">
                  <motion.div 
                    whileHover={{ scale: 1.05, boxShadow: "0 20px 40px -15px rgba(15, 118, 110, 0.4)" }}
                    whileTap={{ scale: 0.98 }}
                    className="relative group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary to-emerald-600 rounded-full blur opacity-25 group-hover:opacity-50 transition-opacity"></div>
                    <Button size="lg" className="relative bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 text-base font-semibold h-14 px-8 w-full sm:w-auto rounded-full shadow-lg border-0">
                      Start Your Free Trial
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </motion.div>
                </Link>
                <Link href="/login">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button size="lg" variant="outline" className="border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 text-base font-semibold h-14 px-8 w-full sm:w-auto rounded-full">
                      Book a Demo
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>

              {/* Trust Indicators - Unique Layout */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-6"
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span className="text-2xl font-bold text-slate-900">10K+</span>
                  </div>
                  <span className="text-sm text-slate-600">Active Users</span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 className="h-5 w-5 text-emerald-600" />
                    <span className="text-2xl font-bold text-slate-900">500+</span>
                  </div>
                  <span className="text-sm text-slate-600">Locations</span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    <span className="text-2xl font-bold text-slate-900">4.9</span>
                  </div>
                  <span className="text-sm text-slate-600">User Rating</span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="h-5 w-5 text-amber-500" />
                    <span className="text-2xl font-bold text-slate-900">99.9%</span>
                  </div>
                  <span className="text-sm text-slate-600">Uptime</span>
                </div>
              </motion.div>
            </motion.div>
            
            {/* Right Side - Hardware Image */}
            <motion.div 
              initial={{ opacity: 0, x: 50, rotate: 5 }}
              animate={{ opacity: 1, x: 0, rotate: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="lg:col-span-5 relative"
            >
              <div className="relative">
                {/* Main Image Container */}
                <div className="relative overflow-hidden">
                  <Image
                    src="/images/pos-hardware.png"
                    alt="Point of sale hardware"
                    width={1000}
                    height={750}
                    className="h-auto w-full object-contain rounded-3xl drop-shadow-2xl"
                    priority
                  />
                </div>

                {/* Floating Elements */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg border border-slate-200 p-3 z-10"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-emerald-100 rounded-full flex items-center justify-center">
                      <Zap className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">Speed</p>
                      <p className="text-sm font-bold text-slate-900">2.3s</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg border border-slate-200 p-3 z-10"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-amber-100 rounded-full flex items-center justify-center">
                      <Shield className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">Secure</p>
                      <p className="text-sm font-bold text-slate-900">256-bit</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-24 lg:py-28 bg-white">
        <div className="container mx-auto px-6 lg:px-8">
          <ScrollReveal className="text-center mb-16">
            <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-slate-900">
              Everything You Need to Run Your Business
            </h2>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
              Powerful features designed to help you manage sales, inventory, and customers with ease.
            </p>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-xl p-6 border border-slate-200 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-slate-600 text-sm sm:text-base leading-relaxed">{feature.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 md:py-24 lg:py-28 bg-white">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <ScrollReveal variants={fadeInLeft}>
              <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-slate-900">
                Why Choose Our POS System?
              </h2>
              <p className="text-base sm:text-lg text-slate-600 mb-8 leading-relaxed max-w-lg">
                Built for businesses of all sizes, our POS system helps you streamline operations, increase efficiency, and grow your revenue.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.li
                    key={benefit}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base text-slate-700">{benefit}</span>
                  </motion.li>
                ))}
              </ul>
            </ScrollReveal>
            <ScrollReveal variants={fadeInRight}>
              <div className="bg-white rounded-2xl p-8 lg:p-12 shadow-sm border border-slate-200">
                <div className="space-y-8">
                  <motion.div 
                    className="text-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-primary mb-2">
                      <AnimatedCounter end={10000} duration={2.5} suffix="+" />
                    </div>
                    <div className="text-sm sm:text-base text-slate-600">Active Businesses</div>
                  </motion.div>
                  <div className="grid grid-cols-2 gap-8">
                    <motion.div 
                      className="text-center"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 }}
                    >
                      <div className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">99.9%</div>
                      <div className="text-sm text-slate-600">Uptime</div>
                    </motion.div>
                    <motion.div 
                      className="text-center"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4 }}
                    >
                      <div className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">24/7</div>
                      <div className="text-sm text-slate-600">Support</div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Subscription Section */}
      <section id="pricing" className="py-20 md:py-24 lg:py-28 bg-white">
        <div className="container mx-auto px-6 lg:px-8">
          <ScrollReveal className="text-center mb-16">
            <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-slate-900">
              Choose Your Plan
            </h2>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-6">
              Select the subscription that fits your business needs
            </p>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full"
            >
              <CheckCircle className="h-4 w-4 text-primary" />
              <span className="text-sm sm:text-base font-semibold text-primary">14-day free trial on all paid plans</span>
            </motion.div>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => {
              const Icon = plan.icon
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: index * 0.15, duration: 0.5 }}
                  whileHover={{ y: -4 }}
                  className={`
                    relative rounded-2xl p-8 transition-all duration-300
                    ${plan.popular
                      ? 'bg-primary text-white shadow-xl shadow-primary/20'
                      : 'bg-white border border-slate-200 shadow-sm hover:shadow-lg'
                    }
                  `}
                >
                  {plan.popular && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 }}
                      className="absolute -top-3 left-1/2 -translate-x-1/2"
                    >
                      <span className="px-4 py-1 bg-white text-primary text-xs font-bold rounded-full shadow-sm">
                        Most Popular
                      </span>
                    </motion.div>
                  )}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="flex flex-col items-center text-center mb-6"
                  >
                    <div className={`
                      flex h-14 w-14 items-center justify-center rounded-xl mb-4
                      ${plan.popular ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'}
                    `}>
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold mb-2">{plan.name}</h3>
                    <p className={`text-sm sm:text-base ${plan.popular ? 'text-white/80' : 'text-slate-600'}`}>{plan.description}</p>
                  </motion.div>
                  <div className="text-center mb-6">
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="text-3xl sm:text-4xl font-bold mb-1"
                    >
                      {plan.price}
                    </motion.div>
                    {plan.period && <div className={`text-sm sm:text-base ${plan.popular ? 'text-white/80' : 'text-slate-600'}`}>{plan.period}</div>}
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <motion.li
                        key={feature}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 + index * 0.1 + featureIndex * 0.05 }}
                        className="flex items-center gap-3"
                      >
                        <CheckCircle className={`h-5 w-5 ${plan.popular ? 'text-white' : 'text-primary'}`} />
                        <span className={`text-sm sm:text-base ${plan.popular ? 'text-white/90' : 'text-slate-700'}`}>{feature}</span>
                      </motion.li>
                    ))}
                  </ul>
                  <Link href="/signup">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        className={`
                          w-full h-12 rounded-full text-sm sm:text-base font-semibold
                          ${plan.popular
                            ? 'bg-white text-primary hover:bg-white/90'
                            : 'bg-primary text-white hover:bg-primary/90'
                          }
                        `}
                      >
                        Get Started
                      </Button>
                    </motion.div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-24 lg:py-28 bg-primary text-white">
        <ScrollReveal className="container mx-auto px-6 lg:px-8 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
          >
            Ready to Transform Your Business?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-base sm:text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-8"
          >
            Join thousands of businesses already using our POS system to streamline operations and boost sales.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/signup">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 text-base font-semibold h-12 px-8 w-full sm:w-auto rounded-full">
                  Start Your Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            </Link>
            <Link href="/login">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button size="lg" className="bg-transparent border-2 border-white text-white hover:bg-white/10 text-base font-semibold h-12 px-8 w-full sm:w-auto rounded-full">
                  Login to Your Account
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </ScrollReveal>
      </section>

      {/* Footer */}
      <footer id="support" className="bg-slate-900 text-white pt-16 pb-8">
        <div className="container mx-auto px-6 lg:px-8">
          {/* Main Footer Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12"
          >
            {/* Brand & Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-1"
            >
              <div className="mb-6">
                <Image
                  src="/logo.png"
                  alt="Zimora Cloud POS"
                  width={558}
                  height={447}
                  className="h-16 w-auto object-contain"
                  priority
                />
              </div>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
                Transform your business with our powerful POS system. Manage sales, inventory, and customers with ease.
              </p>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="font-heading text-lg font-bold mb-6">Quick Links</h3>
              <ul className="space-y-4">
                <li>
                  <Link href="#features" className="text-slate-300 hover:text-primary transition-colors text-sm sm:text-base flex items-center gap-2 group">
                    <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="text-slate-300 hover:text-primary transition-colors text-sm sm:text-base flex items-center gap-2 group">
                    <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-slate-300 hover:text-primary transition-colors text-sm sm:text-base flex items-center gap-2 group">
                    <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-slate-300 hover:text-primary transition-colors text-sm sm:text-base flex items-center gap-2 group">
                    <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    Blog
                  </Link>
                </li>
              </ul>
            </motion.div>

            {/* Support */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              <h3 className="font-heading text-lg font-bold mb-6">Support</h3>
              <ul className="space-y-4">
                <li className="text-slate-300 text-sm sm:text-base flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  24/7 Customer Support
                </li>
                <li className="text-slate-300 text-sm sm:text-base flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Free Setup & Training
                </li>
                <li className="text-slate-300 text-sm sm:text-base flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Video Tutorials
                </li>
                <li className="text-slate-300 text-sm sm:text-base flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Data Migration Help
                </li>
              </ul>
            </motion.div>

            {/* Contact & Newsletter */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
            >
              <h3 className="font-heading text-lg font-bold mb-6">Contact Us</h3>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-slate-300 text-sm sm:text-base">support@zimoracloudpos.com</span>
                </li>
                <li className="flex items-start gap-3">
                  <Smartphone className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-slate-300 text-sm sm:text-base">+254 117411547</span>
                </li>
              </ul>
              
              {/* Newsletter Signup */}
              <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm">
                <h4 className="font-semibold text-sm mb-3">Stay Updated</h4>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Your email"
                    className="flex-1 rounded-lg px-4 py-2 text-sm bg-white/10 border text-white transition-colors focus:border-primary focus:outline-none"
                    suppressHydrationWarning
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-primary hover:bg-primary/90 rounded-lg px-3 py-2 transition-colors"
                  >
                    <Send className="h-4 w-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Bottom Bar */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.7 }}
            className="border-t border-white/10 pt-8"
          >
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-sm text-slate-400 text-center md:text-left">
                © 2026 Zimora Cloud POS. All rights reserved.
              </div>
              <div className="flex gap-6">
                <Link href="/privacy-policy" className="text-sm text-slate-400 hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/terms-of-use" className="text-sm text-slate-400 hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </footer>
    </motion.div>
  )
}
