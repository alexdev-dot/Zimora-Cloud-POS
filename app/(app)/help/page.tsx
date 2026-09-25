"use client";

import * as React from "react";
import Link from "next/link";
import {
  BookOpen,
  ChevronRight,
  Clock,
  ExternalLink,
  Headphones,
  Keyboard,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  Search,
  Video,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function HelpSupportPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [category, setCategory] = React.useState("all");
  const [expandedFaq, setExpandedFaq] = React.useState<number | null>(null);

  const faqs = [
    {
      id: 1,
      question: "How do I add a new product to my inventory?",
      answer: "Navigate to Products → Click 'Add Product' → Fill in product details (name, SKU, price, category, stock quantity) → Click 'Save'. You can also bulk import products using CSV.",
      category: "products",
      popular: true,
    },
    {
      id: 2,
      question: "How do I process a sale at the POS terminal?",
      answer: "Go to POS → Scan product barcode or search for product → Add to cart → Select customer (optional) → Choose payment method (Cash, M-Pesa, Card) → Complete sale.",
      category: "pos",
      popular: true,
    },
    {
      id: 3,
      question: "How do I handle refunds and returns?",
      answer: "Navigate to Sales → Find the sale → Click on the sale → Click 'Refund' → Select items to refund → Enter refund amount → Choose refund method → Confirm.",
      category: "sales",
      popular: true,
    },
    {
      id: 4,
      question: "How do I set up M-Pesa payments?",
      answer: "Go to Settings → Payments → Configure M-Pesa → Enter your shortcode and credentials → Test the integration → Save changes. Contact support if you need help with API setup.",
      category: "payments",
      popular: false,
    },
    {
      id: 5,
      question: "How do I generate sales reports?",
      answer: "Navigate to Reports → Select report type (Sales, Inventory, Performance) → Choose date range → Select location → Click 'Generate Report' → Export as PDF or CSV.",
      category: "reports",
      popular: false,
    },
    {
      id: 6,
      question: "How do I manage user permissions?",
      answer: "Go to Settings → Users & Roles → Create new user or edit existing → Assign role (Owner, Manager, Cashier) → Configure specific permissions → Save changes.",
      category: "users",
      popular: false,
    },
    {
      id: 7,
      question: "How do I set up tax rates?",
      answer: "Navigate to Settings → Taxes → Add new tax rate → Enter rate name (e.g., VAT Standard) → Set percentage (e.g., 16%) → Choose applicable products → Save.",
      category: "taxes",
      popular: false,
    },
    {
      id: 8,
      question: "How do I customize receipt templates?",
      answer: "Go to Settings → Receipt Templates → Choose template style → Add logo and business details → Customize footer message → Preview → Save changes.",
      category: "receipts",
      popular: false,
    },
  ];

  const quickActions = [
    {
      title: "Getting Started Guide",
      description: "Step-by-step setup for new users",
      icon: BookOpen,
      href: "#",
      color: "bg-sky-50 text-sky-700",
    },
    {
      title: "Video Tutorials",
      description: "Watch and learn with our video guides",
      icon: Video,
      href: "#",
      color: "bg-violet-50 text-violet-700",
    },
    {
      title: "Keyboard Shortcuts",
      description: "Speed up your workflow with shortcuts",
      icon: Keyboard,
      href: "#",
      color: "bg-amber-50 text-amber-700",
    },
    {
      title: "API Documentation",
      description: "Integrate with our REST API",
      icon: ExternalLink,
      href: "#",
      color: "bg-emerald-50 text-emerald-700",
    },
  ];

  const contactMethods = [
    {
      title: "Live Chat",
      description: "Chat with our support team in real-time",
      icon: MessageSquare,
      action: "Start chat",
      available: "24/7",
      color: "bg-emerald-50 text-emerald-700",
    },
    {
      title: "Email Support",
      description: "Send us a detailed message",
      icon: Mail,
      action: "Send email",
      available: "Response within 24h",
      color: "bg-sky-50 text-sky-700",
    },
    {
      title: "Phone Support",
      description: "Call us for urgent issues",
      icon: Phone,
      action: "Call now",
      available: "Mon-Fri 8AM-6PM",
      color: "bg-amber-50 text-amber-700",
    },
  ];

  const resources = [
    {
      title: "User Manual",
      description: "Complete guide to all features",
      size: "2.4 MB",
      format: "PDF",
    },
    {
      title: "Quick Reference Card",
      description: "Essential functions at a glance",
      size: "850 KB",
      format: "PDF",
    },
    {
      title: "Setup Checklist",
      description: "Ensure your system is properly configured",
      size: "120 KB",
      format: "PDF",
    },
  ];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = category === "all" || faq.category === category;
    return matchesSearch && matchesCategory;
  });

  const handleContact = (method: string) => {
    toast.info(`Contacting via ${method}`, {
      description: "This will connect you with our support team.",
    });
  };

  const handleDownload = (resource: string) => {
    toast.success("Download started", {
      description: `${resource} is being downloaded.`,
    });
  };

  return (
    <div className="page space-y-5">
      <PageHeader
        title="Help & Support"
        description="Find answers, guides, and contact our support team"
      />

      {/* Search and Filter */}
      <Card className="p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search for help articles, FAQs, guides..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-input bg-background pl-10 pr-4 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            />
          </div>
          <NativeSelect
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full md:w-[180px]"
          >
            <option value="all">All Categories</option>
            <option value="products">Products</option>
            <option value="pos">POS</option>
            <option value="sales">Sales</option>
            <option value="payments">Payments</option>
            <option value="reports">Reports</option>
            <option value="users">Users</option>
            <option value="taxes">Taxes</option>
            <option value="receipts">Receipts</option>
          </NativeSelect>
        </div>
      </Card>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-3 text-[15px] font-semibold tracking-tight">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link key={action.title} href={action.href}>
              <Card className="transition-colors hover:border-primary/30">
                <CardContent className="p-4">
                  <div className={`mb-3 flex size-10 items-center justify-center rounded-lg ${action.color}`}>
                    <action.icon className="size-5" />
                  </div>
                  <h3 className="text-[13px] font-semibold">{action.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{action.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold tracking-tight">Frequently Asked Questions</h2>
          <Badge variant="outline">{filteredFaqs.length} articles</Badge>
        </div>
        <Card>
          <CardContent className="p-0">
            {filteredFaqs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Search className="mb-3 size-8 text-muted-foreground" />
                <p className="text-sm font-medium">No results found</p>
                <p className="mt-1 text-xs text-muted-foreground">Try adjusting your search or filter</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredFaqs.map((faq) => (
                  <div key={faq.id} className="px-5 py-4">
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                      className="flex w-full items-start justify-between text-left"
                    >
                      <div className="flex-1 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-medium">{faq.question}</span>
                          {faq.popular && (
                            <Badge variant="warning" className="text-[10px]">Popular</Badge>
                          )}
                        </div>
                        {expandedFaq === faq.id && (
                          <p className="mt-2 text-xs text-muted-foreground">{faq.answer}</p>
                        )}
                      </div>
                      {expandedFaq === faq.id ? (
                        <X className="size-4 shrink-0 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Contact Support */}
      <div>
        <h2 className="mb-3 text-[15px] font-semibold tracking-tight">Contact Support</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {contactMethods.map((method) => (
            <Card key={method.title}>
              <CardContent className="p-4">
                <div className={`mb-3 flex size-10 items-center justify-center rounded-lg ${method.color}`}>
                  <method.icon className="size-5" />
                </div>
                <h3 className="text-[13px] font-semibold">{method.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{method.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">{method.available}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleContact(method.title)}
                  >
                    {method.action}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Resources */}
      <div>
        <h2 className="mb-3 text-[15px] font-semibold tracking-tight">Resources & Downloads</h2>
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {resources.map((resource) => (
                <div
                  key={resource.title}
                  className="flex items-center justify-between px-5 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-slate-100">
                      <BookOpen className="size-4 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-[13px] font-medium">{resource.title}</p>
                      <p className="text-xs text-muted-foreground">{resource.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-[11px] text-muted-foreground">{resource.size}</p>
                      <p className="text-[10px] text-muted-foreground">{resource.format}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDownload(resource.title)}
                    >
                      <ExternalLink className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[15px]">System Status</CardTitle>
          <CardDescription>Current operational status of Zimora Cloud POS services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-border bg-emerald-50 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="size-2.5 rounded-full bg-emerald-500" />
                <div>
                  <p className="text-[13px] font-medium">All Systems Operational</p>
                  <p className="text-xs text-muted-foreground">Last checked: Just now</p>
                </div>
              </div>
              <Badge variant="success">Normal</Badge>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                <span className="text-xs text-muted-foreground">Web Application</span>
                <div className="flex items-center gap-1.5">
                  <div className="size-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-medium text-emerald-700">Online</span>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                <span className="text-xs text-muted-foreground">API Services</span>
                <div className="flex items-center gap-1.5">
                  <div className="size-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-medium text-emerald-700">Online</span>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                <span className="text-xs text-muted-foreground">Database</span>
                <div className="flex items-center gap-1.5">
                  <div className="size-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-medium text-emerald-700">Online</span>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                <span className="text-xs text-muted-foreground">Payment Processing</span>
                <div className="flex items-center gap-1.5">
                  <div className="size-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-medium text-emerald-700">Online</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Support Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[15px]">Support Hours</CardTitle>
          <CardDescription>When our support team is available to help you</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-muted-foreground" />
                <span className="text-[13px] font-medium">Live Chat</span>
              </div>
              <span className="text-xs text-muted-foreground">24/7</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Phone className="size-4 text-muted-foreground" />
                <span className="text-[13px] font-medium">Phone Support</span>
              </div>
              <span className="text-xs text-muted-foreground">Mon-Fri, 8AM-6PM EAT</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="size-4 text-muted-foreground" />
                <span className="text-[13px] font-medium">Email Support</span>
              </div>
              <span className="text-xs text-muted-foreground">Response within 24 hours</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}