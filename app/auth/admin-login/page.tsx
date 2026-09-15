"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Shield, Lock, Mail, Eye, EyeOff, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, FormField, Label } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(false);
  const [errors, setErrors] = React.useState<{ email?: string; password?: string }>({});
  
  const [formData, setFormData] = React.useState({
    email: "",
    password: "",
  });

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    // Simulate API call - replace with actual authentication logic
    try {
      // TODO: Replace with actual super admin authentication API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo purposes, show success and redirect
      toast.success("Login successful", {
        description: "Welcome back, Super Admin",
      });
      
      // Redirect to admin dashboard
      router.push("/admin/dashboard");
    } catch (error) {
      toast.error("Login failed", {
        description: "Invalid email or password. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: "email" | "password", value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4 safe-top safe-bottom">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-amber-500/5 rounded-full blur-2xl" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Login Card */}
        <div className="card-surface p-6 md:p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" />
                <div className="relative bg-gradient-to-br from-primary to-emerald-600 rounded-full p-4 shadow-lg">
                  <Shield className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Super Admin Login
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your credentials to access the admin panel
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <FormField
              label="Email Address"
              htmlFor="email"
              required
              error={errors.email}
            >
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@zimora.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="pl-10"
                  aria-invalid={!!errors.email}
                  disabled={isLoading}
                />
              </div>
            </FormField>

            {/* Password Field */}
            <FormField
              label="Password"
              htmlFor="password"
              required
              error={errors.password}
            >
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className="pl-10 pr-10"
                  aria-invalid={!!errors.password}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus-ring rounded p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </FormField>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className={cn(
                    "w-4 h-4 rounded border border-input transition-colors peer-focus:ring-2 peer-focus:ring-ring/40 peer-focus:ring-offset-2 peer-focus:ring-offset-background",
                    rememberMe ? "bg-primary border-primary" : "bg-card peer-hover:border-slate-400"
                  )}>
                    {rememberMe && (
                      <svg className="w-3 h-3 text-white absolute top-0.5 left-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                  Remember me
                </span>
              </label>
              
              <a
                href="/auth/admin-forgot-password"
                className="text-primary hover:text-primary/80 transition-colors font-medium"
              >
                Forgot password?
              </a>
            </div>

            {/* Error Message */}
            {(errors.email || errors.password) && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>Please fix the errors above and try again.</span>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-11 text-base font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Testing Credentials */}
          <div className="pt-4 border-t border-border">
            <div className="flex items-start gap-3 text-xs text-muted-foreground">
              <Shield className="w-4 h-4 flex-shrink-0 mt-0.5 text-primary" />
              <div className="flex-1">
                <p className="font-medium text-foreground mb-1">Testing Credentials</p>
                <p className="mb-2">This is a secure admin access point. All login attempts are monitored and logged.</p>
                <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-mono text-foreground">admin@zimora.com</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Password:</span>
                    <span className="font-mono text-foreground">admin123456</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ email: "admin@zimora.com", password: "admin123456" });
                    setErrors({});
                  }}
                  className="mt-2 text-primary hover:text-primary/80 transition-colors font-medium underline"
                >
                  Auto-fill testing credentials
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>
            Need help? Contact{" "}
            <a href="mailto:support@zimora.com" className="text-primary hover:text-primary/80 transition-colors">
              support@zimora.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
