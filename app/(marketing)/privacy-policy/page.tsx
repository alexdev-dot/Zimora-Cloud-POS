"use client"

import React, { useState, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  Menu,
  X,
  ArrowRight,
  Shield,
  Lock,
  Eye,
  Database,
  UserCheck,
  FileText
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

export default function PrivacyPolicy() {
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
                loading="eager"
              />
            </Link>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-6 lg:gap-8">
              <Link href="/" className="text-sm sm:text-base font-medium text-white/80 hover:text-white transition-colors">
                Home
              </Link>
              <Link href="/terms-of-use" className="text-sm sm:text-base font-medium text-white/80 hover:text-white transition-colors">
                Terms of Use
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
                  href="/terms-of-use"
                  className="block text-base sm:text-lg font-medium text-white/80 hover:text-white transition-colors py-2 sm:py-3"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Terms of Use
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
                <Shield className="h-8 w-8" />
              </motion.div>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-slate-900"
            >
              Privacy Policy
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
                  Introduction
                </h2>
                <motion.p 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="text-slate-600 leading-relaxed mb-4"
                >
                  At Zimora Cloud POS ("we," "our," or "us"), we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Point of Sale (POS) software and services.
                </motion.p>
                <motion.p 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="text-slate-600 leading-relaxed"
                >
                  Please read this Privacy Policy carefully. By using our services, you agree to the collection and use of information in accordance with this policy.
                </motion.p>
              </motion.div>
            </ScrollReveal>

              {/* Information We Collect */}
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
                      <Database className="h-6 w-6" />
                    </motion.div>
                    <h2 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900">
                      Information We Collect
                    </h2>
                  </motion.div>
                  
                  <div className="space-y-6">
                    {[
                      {
                        title: "Personal Information",
                        items: [
                          "Name, email address, phone number, and contact details",
                          "Business information (business name, address, registration details)",
                          "Payment and billing information"
                        ]
                      },
                      {
                        title: "Business Data",
                        items: [
                          "Product inventory and sales data",
                          "Customer information and purchase history",
                          "Employee and staff data",
                          "Financial transactions and reports"
                        ]
                      },
                      {
                        title: "Technical Information",
                        items: [
                          "Device information (IP address, browser type, operating system)",
                          "Usage data and log files",
                          "Cookies and similar tracking technologies"
                        ]
                      }
                    ].map((section, sectionIndex) => (
                      <motion.div
                        key={section.title}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + sectionIndex * 0.1 }}
                        whileHover={{ scale: 1.02, y: -4 }}
                        className="bg-slate-50 rounded-xl p-6 border border-slate-200 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                      >
                        <h3 className="font-semibold text-lg text-slate-900 mb-3">{section.title}</h3>
                        <ul className="space-y-2 text-slate-600">
                          {section.items.map((item, itemIndex) => (
                            <motion.li
                              key={item}
                              initial={{ opacity: 0, x: -10 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true }}
                              transition={{ delay: 0.4 + sectionIndex * 0.1 + itemIndex * 0.05 }}
                              className="flex items-start gap-2"
                            >
                              <span className="text-primary mt-1">•</span>
                              <span>{item}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </ScrollReveal>

              {/* How We Use Your Information */}
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
                      <Eye className="h-6 w-6" />
                    </motion.div>
                    <h2 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900">
                      How We Use Your Information
                    </h2>
                  </motion.div>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      { number: 1, title: "Service Provision", description: "To provide, maintain, and improve our POS services" },
                      { number: 2, title: "Account Management", description: "To manage your account and provide customer support" },
                      { number: 3, title: "Security & Fraud Prevention", description: "To protect against fraud and ensure security" },
                      { number: 4, title: "Analytics & Improvement", description: "To analyze usage patterns and improve our services" },
                      { number: 5, title: "Legal Compliance", description: "To comply with legal obligations and regulations" },
                      { number: 6, title: "Communication", description: "To send important updates and service-related communications" }
                    ].map((item, index) => (
                      <motion.div
                        key={item.number}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        whileHover={{ scale: 1.05, y: -4 }}
                        className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                      >
                        <motion.div 
                          whileHover={{ scale: 1.2, rotate: 10 }}
                          transition={{ type: "spring", stiffness: 300 }}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0"
                        >
                          <span className="text-sm font-bold">{item.number}</span>
                        </motion.div>
                        <div>
                          <h4 className="font-semibold text-slate-900 mb-1">{item.title}</h4>
                          <p className="text-sm text-slate-600">{item.description}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </ScrollReveal>

              {/* Data Security */}
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
                      <Lock className="h-6 w-6" />
                    </motion.div>
                    <h2 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900">
                      Data Security
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
                      We implement industry-standard security measures to protect your information:
                    </p>
                    <ul className="space-y-3 text-slate-600">
                      {[
                        "SSL/TLS encryption for data in transit",
                        "Secure data storage with encryption at rest",
                        "Regular security audits and vulnerability assessments",
                        "Access controls and authentication mechanisms",
                        "Regular data backups and disaster recovery procedures"
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

              {/* Data Sharing */}
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
                      <UserCheck className="h-6 w-6" />
                    </motion.div>
                    <h2 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900">
                      Data Sharing & Disclosure
                    </h2>
                  </motion.div>
                  
                  <motion.p 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="text-slate-600 leading-relaxed mb-6"
                  >
                    We do not sell your personal information. We may share your information only in the following circumstances:
                  </motion.p>
                  
                  <div className="space-y-4">
                    {[
                      { title: "With Your Consent", description: "When you explicitly consent to the sharing" },
                      { title: "Service Providers", description: "With trusted third-party service providers who assist in operating our services" },
                      { title: "Legal Requirements", description: "When required by law, court order, or government authorities" },
                      { title: "Business Transfers", description: "In connection with a merger, acquisition, or sale of assets" }
                    ].map((item, index) => (
                      <motion.div
                        key={item.title}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 + index * 0.1 }}
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

              {/* Your Rights */}
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
                      <FileText className="h-6 w-6" />
                    </motion.div>
                    <h2 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900">
                      Your Privacy Rights
                    </h2>
                  </motion.div>
                  
                  <motion.p 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="text-slate-600 leading-relaxed mb-6"
                  >
                    You have the following rights regarding your personal information:
                  </motion.p>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      { title: "Access", description: "Request access to your personal information" },
                      { title: "Correction", description: "Request correction of inaccurate information" },
                      { title: "Deletion", description: "Request deletion of your personal information" },
                      { title: "Portability", description: "Request transfer of your data to another service" },
                      { title: "Objection", description: "Object to processing of your information" },
                      { title: "Restriction", description: "Request restriction of processing" }
                    ].map((right, index) => (
                      <motion.div
                        key={right.title}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        whileHover={{ scale: 1.05, y: -4 }}
                        className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                      >
                        <h4 className="font-semibold text-slate-900 mb-2">{right.title}</h4>
                        <p className="text-sm text-slate-600">{right.description}</p>
                      </motion.div>
                    ))}
                  </div>
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
                      If you have any questions about this Privacy Policy or our data practices, please contact us:
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

              {/* Policy Updates */}
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
                    Changes to This Policy
                  </motion.h2>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="text-slate-600 leading-relaxed"
                  >
                    We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are encouraged to review this Privacy Policy periodically for any changes.
                  </motion.p>
                </motion.div>
              </ScrollReveal>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-primary text-white">
        <div className="container mx-auto px-6 lg:px-8 text-center">
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
      <footer className="border-t border-slate-200 bg-slate-50 py-12">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center">
            <div className="text-sm sm:text-base text-slate-600 mb-4">
              © 2026 Zimora Cloud POS. All rights reserved.
            </div>
            <div className="flex justify-center gap-6">
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
