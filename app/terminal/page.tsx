"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { Lock, Store, ArrowRight, LogOut, User, Delete, X } from "lucide-react";
import { toast } from "sonner";
import { BrandMark } from "@/components/layout/SidebarNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { employees, branches } from "@/lib/constants";
import type { Employee } from "@/types";

export default function TerminalLoginPage() {
  const router = useRouter();
  const [pin, setPin] = React.useState("");
  const [selectedBranch, setSelectedBranch] = React.useState(branches[0] || { id: "", name: "No branches", area: "", city: "", address: "", isMain: false, status: "open" });
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [currentEmployee, setCurrentEmployee] = React.useState<Employee | null>(null);

  const handleNumberPadClick = useCallback((value: string) => {
    setPin(prev => prev.length < 4 ? prev + value : prev);
  }, []);

  const handleClear = useCallback(() => {
    setPin("");
  }, []);

  const handleDelete = useCallback(() => {
    setPin(prev => prev.slice(0, -1));
  }, []);

  const authenticate = useCallback(() => {
    if (pin.length !== 4) {
      toast.error("Invalid PIN", { description: "PIN must be 4 digits" });
      return;
    }

    // Find employee by PIN
    const employee = employees.find(emp => emp.pin === pin);
    
    if (employee) {
      if (employee.status !== "active" && employee.status !== "on_shift") {
        toast.error("Account inactive", { description: "Your account has been deactivated. Please contact your manager." });
        return;
      }
      
      setCurrentEmployee(employee);
      setIsAuthenticated(true);
      toast.success("Welcome back!", { description: `Logged in as ${employee.name}` });
      setPin("");
    } else {
      toast.error("Invalid PIN", { description: "Please check your PIN and try again" });
      setPin("");
    }
  }, [pin]);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    authenticate();
  };

  // Handle keyboard input
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAuthenticated) return;
      
      if (e.key >= '0' && e.key <= '9') {
        handleNumberPadClick(e.key);
      } else if (e.key === 'Backspace') {
        handleDelete();
      } else if (e.key === 'Escape') {
        handleClear();
      } else if (e.key === 'Enter' && pin.length === 4) {
        e.preventDefault();
        authenticate();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin, isAuthenticated, handleNumberPadClick, handleDelete, handleClear, authenticate]);

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentEmployee(null);
    setPin("");
    toast.success("Logged out successfully");
  };

  const handleTerminalAction = (action: string) => {
    toast.info(`${action} clicked`, { description: "This feature is coming soon" });
  };

  if (isAuthenticated && currentEmployee) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl shadow-xl">
          <CardHeader className="border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BrandMark className="size-10" />
                <div>
                  <CardTitle className="text-xl">Terminal Mode</CardTitle>
                  <CardDescription>
                    {selectedBranch.name} · {currentEmployee.name}
                  </CardDescription>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="size-4 mr-2" />
                Logout
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Button
                size="lg"
                className="h-24 text-lg"
                onClick={() => router.push("/pos")}
              >
                <Store className="size-6 mr-3" />
                Start Sale
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-24 text-lg"
                onClick={() => handleTerminalAction("Quick Sale")}
              >
                <ArrowRight className="size-6 mr-3" />
                Quick Sale
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-24 text-lg"
                onClick={() => handleTerminalAction("Cash Drawer")}
              >
                <Lock className="size-6 mr-3" />
                Cash Drawer
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-24 text-lg"
                onClick={() => handleTerminalAction("Reports")}
              >
                <User className="size-6 mr-3" />
                My Shift
              </Button>
            </div>
            
            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Role:</span>
                  <span className="bg-primary/10 text-primary px-2 py-1 rounded-md text-xs font-semibold">
                    {currentEmployee.role}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Employee ID:</span>
                  <span className="font-mono">{currentEmployee.employeeNo}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <BrandMark className="size-16" />
          </div>
          <CardTitle className="text-2xl">Employee Terminal</CardTitle>
          <CardDescription>
            Enter your 4-digit PIN to access the terminal
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="branch" className="text-sm font-medium">
                Branch Location
              </label>
              <select
                id="branch"
                value={selectedBranch.id}
                onChange={(e) => {
                  const branch = branches.find(b => b.id === e.target.value);
                  if (branch) setSelectedBranch(branch);
                }}
                className="w-full h-9 rounded-lg border border-input bg-card px-3 text-sm shadow-sm focus-ring"
              >
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name} {branch.isMain && "(Main)"}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="pin" className="text-sm font-medium">
                PIN Code
              </label>
              <div className="flex gap-2">
                {[0, 1, 2, 3].map((index) => (
                  <div
                    key={index}
                    className={`flex-1 h-14 rounded-lg border-2 flex items-center justify-center text-2xl font-mono tracking-widest transition-colors ${
                      pin[index] 
                        ? "border-primary bg-primary/10 text-primary" 
                        : "border-input bg-card"
                    }`}
                  >
                    {pin[index] ? "•" : ""}
                  </div>
                ))}
              </div>
            </div>

            {/* Number Pad */}
            <div className="grid grid-cols-3 gap-2">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
                <Button
                  key={num}
                  type="button"
                  variant="outline"
                  size="lg"
                  className="h-16 text-2xl font-semibold hover:bg-primary/10 hover:border-primary/50 active:scale-95 transition-all"
                  onClick={() => handleNumberPadClick(num)}
                >
                  {num}
                </Button>
              ))}
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="h-16 hover:bg-destructive/10 hover:border-destructive/50 hover:text-destructive active:scale-95 transition-all"
                onClick={handleClear}
              >
                <X className="size-5" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="h-16 text-2xl font-semibold hover:bg-primary/10 hover:border-primary/50 active:scale-95 transition-all"
                onClick={() => handleNumberPadClick("0")}
              >
                0
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="h-16 hover:bg-destructive/10 hover:border-destructive/50 hover:text-destructive active:scale-95 transition-all"
                onClick={handleDelete}
              >
                <Delete className="size-5" />
              </Button>
            </div>

            <Button type="submit" className="w-full h-12 text-base" size="lg" disabled={pin.length !== 4}>
              <Lock className="size-5 mr-2" />
              Access Terminal
            </Button>
          </form>

          <div className="pt-4 border-t border-slate-200 text-center">
            <p className="text-xs text-muted-foreground">
              Demo PINs: 1234 (Owner), 2345 (Manager), 4567 (Cashier)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}