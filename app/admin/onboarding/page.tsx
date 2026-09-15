"use client";

import * as React from "react";
import { useState } from "react";
import {
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  Globe,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
  Settings,
  Shield,
  Smartphone,
  Store,
  User,
  Users,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, FormField, Textarea, NativeSelect } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type OnboardingStep = "welcome" | "company" | "admin" | "business" | "integrations" | "review";

const ONBOARDING_STEPS = [
  { id: "welcome" as OnboardingStep, title: "Welcome", icon: Zap },
  { id: "company" as OnboardingStep, title: "Company Info", icon: Building2 },
  { id: "admin" as OnboardingStep, title: "Admin Account", icon: User },
  { id: "business" as OnboardingStep, title: "Business Setup", icon: Store },
  { id: "integrations" as OnboardingStep, title: "Integrations", icon: Globe },
  { id: "review" as OnboardingStep, title: "Review & Launch", icon: CheckCircle2 },
];

export default function AdminOnboardingPage() {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("welcome");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentStepIndex = ONBOARDING_STEPS.findIndex((step) => step.id === currentStep);

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < ONBOARDING_STEPS.length) {
      setCurrentStep(ONBOARDING_STEPS[nextIndex].id);
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(ONBOARDING_STEPS[prevIndex].id);
    }
  };

  const handleStepClick = (stepId: OnboardingStep) => {
    // Only allow going back to previous steps, not skipping ahead
    const stepIndex = ONBOARDING_STEPS.findIndex((step) => step.id === stepId);
    if (stepIndex <= currentStepIndex) {
      setCurrentStep(stepId);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    toast.success("Onboarding completed successfully!", {
      description: "Your tenant has been created and configured.",
    });
  };

  return (
    <div className="page space-y-6">
      <PageHeader
        title="Tenant Onboarding"
        description="Set up a new tenant account with guided configuration"
      />

      {/* Progress Steps */}
      <Card className="p-5">
        <div className="flex items-center justify-between overflow-x-auto pb-2">
          {ONBOARDING_STEPS.map((step, index) => {
            const StepIcon = step.icon;
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const isUpcoming = index > currentStepIndex;

            return (
              <div key={step.id} className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleStepClick(step.id)}
                  disabled={isUpcoming}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isCompleted
                      ? "bg-primary/10 text-primary hover:bg-primary/20"
                      : isCurrent
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  )}
                >
                  <StepIcon className="size-4" />
                  <span className="hidden sm:inline">{step.title}</span>
                  {isCompleted && <CheckCircle2 className="size-4" />}
                </button>
                {index < ONBOARDING_STEPS.length - 1 && (
                  <ChevronRight className={cn("size-4 text-muted-foreground", isUpcoming && "opacity-50")} />
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Step Content */}
      {currentStep === "welcome" && <WelcomeStep onNext={handleNext} />}
      {currentStep === "company" && <CompanyInfoStep onNext={handleNext} onBack={handleBack} />}
      {currentStep === "admin" && <AdminAccountStep onNext={handleNext} onBack={handleBack} />}
      {currentStep === "business" && <BusinessSetupStep onNext={handleNext} onBack={handleBack} />}
      {currentStep === "integrations" && <IntegrationsStep onNext={handleNext} onBack={handleBack} />}
      {currentStep === "review" && (
        <ReviewStep
          onNext={handleSubmit}
          onBack={handleBack}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}

function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2 p-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Welcome to Zimora Cloud POS</h2>
            <p className="mt-2 text-muted-foreground">
              Let's get your new tenant set up and running. This process will take approximately 5-10 minutes.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FeatureCard
              icon={Building2}
              title="Company Setup"
              description="Configure your company details and branding"
            />
            <FeatureCard
              icon={User}
              title="Admin Account"
              description="Create the primary administrator account"
            />
            <FeatureCard
              icon={Store}
              title="Business Configuration"
              description="Set up stores, locations, and business rules"
            />
            <FeatureCard
              icon={Globe}
              title="Integrations"
              description="Connect payment processors and third-party services"
            />
          </div>

          <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
            <div className="flex gap-3">
              <Clock className="size-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-900">What you'll need</p>
                <ul className="mt-2 space-y-1 text-sm text-amber-800">
                  <li>• Company registration details</li>
                  <li>• Business contact information</li>
                  <li>• Administrator email and phone</li>
                  <li>• Payment method preferences</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="font-semibold">Quick Start Guide</h3>
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                1
              </div>
              <div>
                <p className="text-sm font-medium">Company Information</p>
                <p className="text-xs text-muted-foreground">Basic business details</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                2
              </div>
              <div>
                <p className="text-sm font-medium">Admin Account</p>
                <p className="text-xs text-muted-foreground">Primary user setup</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                3
              </div>
              <div>
                <p className="text-sm font-medium">Business Configuration</p>
                <p className="text-xs text-muted-foreground">Stores and locations</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                4
              </div>
              <div>
                <p className="text-sm font-medium">Integrations</p>
                <p className="text-xs text-muted-foreground">Payment and services</p>
              </div>
            </div>
          </div>

          <Button onClick={onNext} className="w-full mt-6">
            Get Started <ChevronRight className="ml-2 size-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}

function CompanyInfoStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Company Information</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Provide your company details for official records and communications
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <FormField label="Company Name" required htmlFor="companyName">
            <Input id="companyName" placeholder="Enter company name" />
          </FormField>

          <FormField label="Business Registration Number" htmlFor="registrationNumber">
            <Input id="registrationNumber" placeholder="e.g., BN-123456789" />
          </FormField>

          <FormField label="Tax ID / KRA PIN" required htmlFor="taxId">
            <Input id="taxId" placeholder="Enter tax identification number" />
          </FormField>

          <FormField label="Industry" htmlFor="industry">
            <NativeSelect id="industry">
              <option value="">Select industry</option>
              <option value="retail">Retail</option>
              <option value="restaurant">Restaurant / Food Service</option>
              <option value="wholesale">Wholesale</option>
              <option value="manufacturing">Manufacturing</option>
              <option value="services">Services</option>
              <option value="other">Other</option>
            </NativeSelect>
          </FormField>

          <FormField label="Business Email" required htmlFor="businessEmail">
            <Input id="businessEmail" type="email" placeholder="company@example.com" />
          </FormField>

          <FormField label="Business Phone" required htmlFor="businessPhone">
            <Input id="businessPhone" type="tel" placeholder="+254 700 000 000" />
          </FormField>

          <FormField label="Website" htmlFor="website">
            <Input id="website" type="url" placeholder="https://example.com" />
          </FormField>

          <FormField label="Business Type" htmlFor="businessType">
            <NativeSelect id="businessType">
              <option value="">Select business type</option>
              <option value="sole-proprietorship">Sole Proprietorship</option>
              <option value="partnership">Partnership</option>
              <option value="limited-company">Limited Company</option>
              <option value="corporation">Corporation</option>
            </NativeSelect>
          </FormField>

          <FormField label="Physical Address" required htmlFor="address" className="md:col-span-2">
            <Input id="address" placeholder="Street address, City, Country" />
          </FormField>

          <FormField label="Description" htmlFor="description" className="md:col-span-2">
            <Textarea
              id="description"
              placeholder="Brief description of your business"
              rows={3}
            />
          </FormField>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={onNext}>
            Continue <ChevronRight className="ml-2 size-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

function AdminAccountStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Admin Account Setup</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Create the primary administrator account for this tenant
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <FormField label="First Name" required htmlFor="firstName">
            <Input id="firstName" placeholder="Enter first name" />
          </FormField>

          <FormField label="Last Name" required htmlFor="lastName">
            <Input id="lastName" placeholder="Enter last name" />
          </FormField>

          <FormField label="Email Address" required htmlFor="email" className="md:col-span-2">
            <Input id="email" type="email" placeholder="admin@company.com" />
          </FormField>

          <FormField label="Phone Number" required htmlFor="phone">
            <Input id="phone" type="tel" placeholder="+254 700 000 000" />
          </FormField>

          <FormField label="Role" htmlFor="role">
            <NativeSelect id="role">
              <option value="super-admin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
            </NativeSelect>
          </FormField>

          <FormField label="Password" required htmlFor="password" className="md:col-span-2">
            <Input id="password" type="password" placeholder="Create a strong password" />
          </FormField>

          <FormField label="Confirm Password" required htmlFor="confirmPassword" className="md:col-span-2">
            <Input id="confirmPassword" type="password" placeholder="Confirm password" />
          </FormField>
        </div>

        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
          <div className="flex gap-3">
            <Shield className="size-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">Security Requirements</p>
              <ul className="mt-2 space-y-1 text-sm text-blue-800">
                <li>• Minimum 8 characters</li>
                <li>• At least one uppercase letter</li>
                <li>• At least one number</li>
                <li>• At least one special character</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={onNext}>
            Continue <ChevronRight className="ml-2 size-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

function BusinessSetupStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [locations, setLocations] = useState([{ id: 1, name: "", address: "" }]);

  const addLocation = () => {
    setLocations([...locations, { id: Date.now(), name: "", address: "" }]);
  };

  const removeLocation = (id: number) => {
    setLocations(locations.filter((loc) => loc.id !== id));
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Business Configuration</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Set up your business locations and operational settings
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <FormField label="Business Name" required htmlFor="businessName">
            <Input id="businessName" placeholder="Your business name" />
          </FormField>

          <FormField label="Currency" required htmlFor="currency">
            <NativeSelect id="currency">
              <option value="KES">Kenyan Shilling (KES)</option>
              <option value="USD">US Dollar (USD)</option>
              <option value="EUR">Euro (EUR)</option>
              <option value="GBP">British Pound (GBP)</option>
            </NativeSelect>
          </FormField>

          <FormField label="Timezone" htmlFor="timezone">
            <NativeSelect id="timezone">
              <option value="Africa/Nairobi">Africa/Nairobi</option>
              <option value="Africa/Lagos">Africa/Lagos</option>
              <option value="Africa/Cairo">Africa/Cairo</option>
              <option value="Europe/London">Europe/London</option>
              <option value="America/New_York">America/New_York</option>
            </NativeSelect>
          </FormField>

          <FormField label="Date Format" htmlFor="dateFormat">
            <NativeSelect id="dateFormat">
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </NativeSelect>
          </FormField>

          <FormField label="Default Tax Rate (%)" htmlFor="taxRate">
            <Input id="taxRate" type="number" placeholder="16" />
          </FormField>

          <FormField label="Low Stock Threshold" htmlFor="lowStock">
            <Input id="lowStock" type="number" placeholder="10" />
          </FormField>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Business Locations</h3>
            <Button variant="outline" size="sm" onClick={addLocation}>
              <Plus className="size-4 mr-2" /> Add Location
            </Button>
          </div>

          <div className="space-y-3">
            {locations.map((location, index) => (
              <div key={location.id} className="grid gap-3 md:grid-cols-2 p-4 border rounded-lg">
                <FormField label={`Location ${index + 1} Name`} htmlFor={`location-name-${location.id}`}>
                  <Input
                    id={`location-name-${location.id}`}
                    placeholder="e.g., Main Store"
                    value={location.name}
                    onChange={(e) => {
                      const updated = [...locations];
                      updated[index].name = e.target.value;
                      setLocations(updated);
                    }}
                  />
                </FormField>

                <FormField label="Address" htmlFor={`location-address-${location.id}`}>
                  <Input
                    id={`location-address-${location.id}`}
                    placeholder="Physical address"
                    value={location.address}
                    onChange={(e) => {
                      const updated = [...locations];
                      updated[index].address = e.target.value;
                      setLocations(updated);
                    }}
                  />
                </FormField>

                {locations.length > 1 && (
                  <div className="md:col-span-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeLocation(location.id)}
                    >
                      Remove Location
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={onNext}>
            Continue <ChevronRight className="ml-2 size-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

function IntegrationsStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [integrations, setIntegrations] = useState({
    mpesa: false,
    cardPayments: false,
    whatsapp: false,
    email: false,
  });

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Integrations</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Connect third-party services to enhance your POS functionality
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <IntegrationCard
            icon={Smartphone}
            title="M-Pesa Integration"
            description="Accept mobile payments via M-Pesa"
            connected={integrations.mpesa}
            onToggle={() => setIntegrations({ ...integrations, mpesa: !integrations.mpesa })}
          />

          <IntegrationCard
            icon={CreditCard}
            title="Card Payments"
            description="Process credit and debit card payments"
            connected={integrations.cardPayments}
            onToggle={() => setIntegrations({ ...integrations, cardPayments: !integrations.cardPayments })}
          />

          <IntegrationCard
            icon={Mail}
            title="Email Notifications"
            description="Send receipts and reports via email"
            connected={integrations.email}
            onToggle={() => setIntegrations({ ...integrations, email: !integrations.email })}
          />

          <IntegrationCard
            icon={MessageCircle}
            title="WhatsApp Business"
            description="Send notifications via WhatsApp"
            connected={integrations.whatsapp}
            onToggle={() => setIntegrations({ ...integrations, whatsapp: !integrations.whatsapp })}
          />
        </div>

        <div className="rounded-lg bg-muted p-4">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> You can configure these integrations later in the Settings section. This step
            allows you to enable the ones you want to set up now.
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={onNext}>
            Continue <ChevronRight className="ml-2 size-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

function ReviewStep({ onNext, onBack, isSubmitting }: { onNext: () => void; onBack: () => void; isSubmitting: boolean }) {
  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Review & Launch</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Review your configuration before creating the tenant
          </p>
        </div>

        <div className="space-y-4">
          <ReviewSection
            icon={Building2}
            title="Company Information"
            items={[
              { label: "Company Name", value: "Demo Company Ltd" },
              { label: "Business Email", value: "info@democompany.com" },
              { label: "Industry", value: "Retail" },
            ]}
          />

          <ReviewSection
            icon={User}
            title="Admin Account"
            items={[
              { label: "Name", value: "John Doe" },
              { label: "Email", value: "john@democompany.com" },
              { label: "Role", value: "Super Admin" },
            ]}
          />

          <ReviewSection
            icon={Store}
            title="Business Configuration"
            items={[
              { label: "Business Name", value: "Demo Store" },
              { label: "Currency", value: "KES" },
              { label: "Locations", value: "1 location configured" },
            ]}
          />

          <ReviewSection
            icon={Globe}
            title="Integrations"
            items={[
              { label: "M-Pesa", value: "Enabled" },
              { label: "Email Notifications", value: "Enabled" },
            ]}
          />
        </div>

        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4">
          <div className="flex gap-3">
            <CheckCircle2 className="size-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-emerald-900">Ready to Launch</p>
              <p className="mt-1 text-sm text-emerald-800">
                Your tenant configuration is complete. Click "Create Tenant" to finalize the setup.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onBack} disabled={isSubmitting}>
            Back
          </Button>
          <Button onClick={onNext} disabled={isSubmitting}>
            {isSubmitting ? "Creating Tenant..." : "Create Tenant"} <ChevronRight className="ml-2 size-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <div className="flex gap-3 p-4 border rounded-lg hover:bg-muted/30 transition-colors">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="size-5 text-primary" />
      </div>
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
    </div>
  );
}

function IntegrationCard({
  icon: Icon,
  title,
  description,
  connected,
  onToggle,
}: {
  icon: any;
  title: string;
  description: string;
  connected: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-start justify-between mb-3">
        <div className="flex gap-3">
          <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${connected ? 'bg-primary/10' : 'bg-muted'}`}>
            <Icon className={`size-5 ${connected ? 'text-primary' : 'text-muted-foreground'}`} />
          </div>
          <div>
            <p className="font-medium">{title}</p>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
        </div>
        <button
          onClick={onToggle}
          className={cn(
            "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-ring",
            connected ? "bg-primary" : "bg-input"
          )}
        >
          <span
            className={cn(
              "pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
              connected ? "translate-x-5" : "translate-x-0"
            )}
          />
        </button>
      </div>
    </div>
  );
}

function ReviewSection({
  icon: Icon,
  title,
  items,
}: {
  icon: any;
  title: string;
  items: { label: string; value: string }[];
}) {
  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="size-4 text-primary" />
        <h3 className="font-semibold">{title}</h3>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {items.map((item, index) => (
          <div key={index} className="flex justify-between text-sm">
            <span className="text-muted-foreground">{item.label}</span>
            <span className="font-medium">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

