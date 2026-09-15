"use client"

import React, { useState, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  Menu,
  X,
  ArrowRight,
  FileText,
  CheckCircle,
  AlertCircle,
  Users,
  Shield,
  Gavel
} from "lucide-react"
import { motion, AnimatePresence, useInView, useScroll, useTransform } from "framer-motion"

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

export default function TermsOfUse() {
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
        <div className="container mx-auto flex h-20 md:h-24 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <Link href="/">
              <Image
                src="/logo.png"
                alt="Zimora Cloud POS"
                width={558}
                height={447}
                className="h-12 sm:h-14 md:h-16 lg:h-20 w-auto object-contain"
                priority
              />
            </Link>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-6 lg:gap-8">
              <Link href="/" className="text-sm sm:text-base font-medium text-white/80 hover:text-white transition-colors">
                Home
              </Link>
              <Link href="/privacy-policy" className="text-sm sm:text-base font-medium text-white/80 hover:text-white transition-colors">
                Privacy Policy
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
              <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-3 sm:space-y-4">
                <Link
                  href="/"
                  className="block text-base sm:text-lg font-medium text-white/80 hover:text-white transition-colors py-2 sm:py-3"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  href="/privacy-policy"
                  className="block text-base sm:text-lg font-medium text-white/80 hover:text-white transition-colors py-2 sm:py-3"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Privacy Policy
                </Link>
                <div className="pt-3 sm:pt-4 space-y-2 sm:space-y-3">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full text-base sm:text-lg font-medium text-white hover:bg-white/10 h-11 sm:h-12">
                      Login
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full text-base sm:text-lg font-medium bg-primary hover:bg-primary/90 h-11 sm:h-12 rounded-full">
                      Get Started
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Header Section */}
      <section className="bg-blue-50 py-12 sm:py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="max-w-4xl mx-auto text-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex justify-center mb-6"
            >
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary"
              >
                <FileText className="h-8 w-8" />
              </motion.div>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-slate-900"
            >
              Terms of Use
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto"
            >
              Last updated: January 2026
            </motion.p>
          </ScrollReveal>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Introduction */}
            <ScrollReveal className="mb-12">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="font-heading text-2xl sm:text-3xl font-bold mb-4 text-slate-900">
                  Agreement to Terms
                </h2>
                <motion.p 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="text-slate-600 leading-relaxed mb-4"
                >
                  By accessing or using Zimora Cloud POS ("the Service"), you agree to be bound by these Terms of Use ("Terms"). These Terms constitute a legally binding agreement between you and Zimora Cloud POS.
                </motion.p>
                <motion.p 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="text-slate-600 leading-relaxed"
                >
                  If you do not agree to these Terms, please do not use our Service. We reserve the right to modify these Terms at any time, and your continued use of the Service constitutes acceptance of any changes.
                </motion.p>
              </motion.div>
            </ScrollReveal>

              {/* Acceptance of Terms */}
              <ScrollReveal className="mb-12">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <motion.div 
                    className="flex items-center gap-3 mb-6"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                  >
                    <motion.div 
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary"
                    >
                      <CheckCircle className="h-6 w-6" />
                    </motion.div>
                    <h2 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900">
                      Acceptance of Terms
                    </h2>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    whileHover={{ scale: 1.02 }}
                    className="bg-slate-50 rounded-xl p-6 border border-slate-200 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                  >
                    <p className="text-slate-600 leading-relaxed mb-4">
                      By using our Service, you acknowledge that you have read, understood, and agree to be bound by these Terms. If you are using the Service on behalf of a business or entity, you represent that you have the authority to bind that entity to these Terms.
                    </p>
                    <ul className="space-y-2 text-slate-600">
                      {[
                        "You must be at least 18 years old to use this Service",
                        "You must provide accurate and complete information",
                        "You are responsible for maintaining account security"
                      ].map((item, index) => (
                        <motion.li
                          key={item}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.4 + index * 0.1 }}
                          whileHover={{ x: 5 }}
                          className="flex items-start gap-2"
                        >
                          <span className="text-primary mt-1">•</span>
                          <span>{item}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                </motion.div>
              </ScrollReveal>

              {/* User Responsibilities */}
              <ScrollReveal className="mb-12">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <motion.div 
                    className="flex items-center gap-3 mb-6"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                  >
                    <motion.div 
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary"
                    >
                      <Users className="h-6 w-6" />
                    </motion.div>
                    <h2 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900">
                      User Responsibilities
                    </h2>
                  </motion.div>
                  
                  <div className="space-y-4">
                    {[
                      { title: "Account Security", description: "You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account" },
                      { title: "Accurate Information", description: "You agree to provide accurate, current, and complete information during registration" },
                      { title: "Compliance with Laws", description: "You must comply with all applicable laws and regulations when using our Service" },
                      { title: "Prohibited Activities", description: "You may not use the Service for illegal purposes, fraud, or any activity that violates these Terms" }
                    ].map((item, index) => (
                      <motion.div
                        key={item.title}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        whileHover={{ x: 10, backgroundColor: "rgba(59, 130, 246, 0.05)" }}
                        className="border-l-4 border-primary pl-4 py-2 rounded-r-lg transition-all duration-300 cursor-default"
                      >
                        <h4 className="font-semibold text-slate-900">{item.title}</h4>
                        <p className="text-sm text-slate-600">{item.description}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </ScrollReveal>

              {/* Prohibited Uses */}
              <ScrollReveal className="mb-12">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <motion.div 
                    className="flex items-center gap-3 mb-6"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                  >
                    <motion.div 
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-600"
                    >
                      <AlertCircle className="h-6 w-6" />
                    </motion.div>
                    <h2 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900">
                      Prohibited Uses
                    </h2>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    whileHover={{ scale: 1.02 }}
                    className="bg-red-50 rounded-xl p-6 border border-red-200 hover:shadow-lg transition-all duration-300"
                  >
                    <p className="text-slate-700 leading-relaxed mb-4">
                      You may not use the Service for any of the following purposes:
                    </p>
                    <ul className="space-y-3 text-slate-600">
                      {[
                        "Violating any local, state, national, or international law",
                        "Infringing on intellectual property rights of others",
                        "Engaging in fraud, money laundering, or other illegal financial activities",
                        "Transmitting viruses, malware, or harmful code",
                        "Interfering with or disrupting the Service or servers",
                        "Attempting to gain unauthorized access to the Service"
                      ].map((item, index) => (
                        <motion.li
                          key={item}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.4 + index * 0.1 }}
                          whileHover={{ x: 5 }}
                          className="flex items-start gap-3"
                        >
                          <motion.div 
                            whileHover={{ scale: 1.2, rotate: 10 }}
                            transition={{ type: "spring", stiffness: 300 }}
                            className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shrink-0 mt-0.5"
                          >
                            <span className="text-xs">✗</span>
                          </motion.div>
                          <span>{item}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                </motion.div>
              </ScrollReveal>

              {/* Intellectual Property */}
              <ScrollReveal className="mb-12">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <motion.div 
                    className="flex items-center gap-3 mb-6"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                  >
                    <motion.div 
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary"
                    >
                      <Shield className="h-6 w-6" />
                    </motion.div>
                    <h2 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900">
                      Intellectual Property
                    </h2>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    whileHover={{ scale: 1.02 }}
                    className="bg-primary/5 rounded-xl p-6 border border-primary/20 hover:shadow-lg transition-all duration-300"
                  >
                    <p className="text-slate-700 leading-relaxed mb-4">
                      The Service and its original content, features, and functionality are owned by Zimora Cloud POS and are protected by international copyright, trademark, and other intellectual property laws.
                    </p>
                    <ul className="space-y-3 text-slate-600">
                      {[
                        "You may not copy, modify, or distribute our content without permission",
                        "Zimora Cloud POS retains all rights to the Service and its content",
                        "Your business data remains your property"
                      ].map((item, index) => (
                        <motion.li
                          key={item}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.4 + index * 0.1 }}
                          whileHover={{ x: 5 }}
                          className="flex items-start gap-3"
                        >
                          <motion.div 
                            whileHover={{ scale: 1.2, rotate: 10 }}
                            transition={{ type: "spring", stiffness: 300 }}
                            className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white shrink-0 mt-0.5"
                          >
                            <span className="text-xs">✓</span>
                          </motion.div>
                          <span>{item}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                </motion.div>
              </ScrollReveal>

              {/* Payment Terms */}
              <ScrollReveal className="mb-12">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <motion.div 
                    className="flex items-center gap-3 mb-6"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                  >
                    <motion.div 
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary"
                    >
                      <Gavel className="h-6 w-6" />
                    </motion.div>
                    <h2 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900">
                      Payment & Subscription Terms
                    </h2>
                  </motion.div>
                  
                  <div className="space-y-4">
                    {[
                      { title: "Subscription Plans", description: "We offer various subscription plans with different features and pricing. You agree to pay the fees for your selected plan." },
                      { title: "Payment Methods", description: "We accept various payment methods including M-PESA, credit cards, and bank transfers. All payments are processed securely." },
                      { title: "Refund Policy", description: "Refunds are handled on a case-by-case basis. Please contact our support team for refund requests." },
                      { title: "Cancellation", description: "You may cancel your subscription at any time. Cancellation will take effect at the end of the current billing period." }
                    ].map((item, index) => (
                      <motion.div
                        key={item.title}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        whileHover={{ scale: 1.02, y: -4 }}
                        className="bg-slate-50 rounded-xl p-6 border border-slate-200 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                      >
                        <h4 className="font-semibold text-slate-900 mb-2">{item.title}</h4>
                        <p className="text-sm text-slate-600">{item.description}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </ScrollReveal>

              {/* Limitation of Liability */}
              <ScrollReveal className="mb-12">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <motion.h2 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="font-heading text-2xl sm:text-3xl font-bold mb-4 text-slate-900"
                  >
                    Limitation of Liability
                  </motion.h2>
                  
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    whileHover={{ scale: 1.02 }}
                    className="bg-slate-50 rounded-xl p-6 border border-slate-200 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                  >
                    <p className="text-slate-600 leading-relaxed mb-4">
                      To the maximum extent permitted by law, Zimora Cloud POS shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or other intangible losses, resulting from:
                    </p>
                    <ul className="space-y-2 text-slate-600">
                      {[
                        "Your access to or use of or inability to access or use the Service",
                        "Any conduct or content of any third party on the Service",
                        "Any content obtained from the Service",
                        "Unauthorized access, use, or alteration of your transmissions or content"
                      ].map((item, index) => (
                        <motion.li
                          key={item}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.4 + index * 0.1 }}
                          whileHover={{ x: 5 }}
                          className="flex items-start gap-2"
                        >
                          <span className="text-primary mt-1">•</span>
                          <span>{item}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                </motion.div>
              </ScrollReveal>

              {/* Termination */}
              <ScrollReveal className="mb-12">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <motion.h2 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="font-heading text-2xl sm:text-3xl font-bold mb-4 text-slate-900"
                  >
                    Termination
                  </motion.h2>
                  
                  <motion.p 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="text-slate-600 leading-relaxed mb-4"
                  >
                    We reserve the right to terminate or suspend your account and access to the Service at our sole discretion, without prior notice, for any reason, including but not limited to:
                  </motion.p>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      { title: "Violation of Terms", description: "Breach of these Terms of Use" },
                      { title: "Fraudulent Activity", description: "Engagement in fraudulent or illegal activities" },
                      { title: "Non-Payment", description: "Failure to pay subscription fees" },
                      { title: "Service Changes", description: "Discontinuation or modification of the Service" }
                    ].map((item, index) => (
                      <motion.div
                        key={item.title}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        whileHover={{ scale: 1.05, y: -4 }}
                        className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                      >
                        <h4 className="font-semibold text-slate-900 mb-2">{item.title}</h4>
                        <p className="text-sm text-slate-600">{item.description}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </ScrollReveal>

              {/* Governing Law */}
              <ScrollReveal className="mb-12">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <motion.h2 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="font-heading text-2xl sm:text-3xl font-bold mb-4 text-slate-900"
                  >
                    Governing Law
                  </motion.h2>
                  
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    whileHover={{ scale: 1.02 }}
                    className="bg-primary/10 rounded-xl p-6 border border-primary/20 hover:shadow-lg transition-all duration-300"
                  >
                    <p className="text-slate-700 leading-relaxed mb-4">
                      These Terms shall be governed by and construed in accordance with the laws of Kenya, without regard to its conflict of law provisions.
                    </p>
                    <p className="text-slate-600 leading-relaxed">
                      Any disputes arising from these Terms or your use of the Service shall be resolved through arbitration in Nairobi, Kenya, in accordance with the rules of the Kenya Arbitration Centre.
                    </p>
                  </motion.div>
                </motion.div>
              </ScrollReveal>

              {/* Contact Information */}
              <ScrollReveal className="mb-12">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <motion.h2 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="font-heading text-2xl sm:text-3xl font-bold mb-6 text-slate-900"
                  >
                    Contact Us
                  </motion.h2>
                  
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    whileHover={{ scale: 1.02 }}
                    className="bg-primary/10 rounded-xl p-6 border border-primary/20 hover:shadow-lg transition-all duration-300"
                  >
                    <p className="text-slate-700 leading-relaxed mb-4">
                      If you have any questions about these Terms of Use, please contact us:
                    </p>
                    <div className="space-y-2 text-slate-600">
                      <motion.p 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 }}
                        whileHover={{ x: 5 }}
                        className="cursor-default"
                      >
                        <strong>Email:</strong> zimoracloudpos@gmail.com
                      </motion.p>
                      <motion.p 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 }}
                        whileHover={{ x: 5 }}
                        className="cursor-default"
                      >
                        <strong>Phone:</strong> +254 117411547
                      </motion.p>
                      <motion.p 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.6 }}
                        whileHover={{ x: 5 }}
                        className="cursor-default"
                      >
                        <strong>Address:</strong> Nairobi, Kenya
                      </motion.p>
                    </div>
                  </motion.div>
                </motion.div>
              </ScrollReveal>

              {/* Changes to Terms */}
              <ScrollReveal className="mb-12">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <motion.h2 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="font-heading text-2xl sm:text-3xl font-bold mb-4 text-slate-900"
                  >
                    Changes to These Terms
                  </motion.h2>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="text-slate-600 leading-relaxed"
                  >
                    We may update these Terms of Use from time to time. We will notify you of any changes by posting the new Terms on this page and updating the "Last updated" date. Your continued use of the Service after such changes constitutes your acceptance of the new Terms.
                  </motion.p>
                </motion.div>
              </ScrollReveal>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-primary text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold mb-4"
            >
              Ready to Get Started?
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-base sm:text-lg text-white/90 max-w-2xl mx-auto mb-8"
            >
              Join thousands of businesses using Zimora Cloud POS to streamline their operations.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/signup">
                <motion.div 
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Button size="lg" className="bg-white text-primary hover:bg-white/90 text-base font-semibold h-12 px-8 w-full sm:w-auto rounded-full shadow-lg">
                    Start Free Trial
                    <motion.div
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </motion.div>
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-sm sm:text-base text-slate-600 mb-4">
              © 2026 Zimora Cloud POS. All rights reserved.
            </div>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-6">
              <Link href="/privacy-policy" className="text-sm text-slate-600 hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms-of-use" className="text-sm text-slate-600 hover:text-primary transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </motion.div>
  )
}
