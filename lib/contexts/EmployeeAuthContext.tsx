"use client";

import * as React from "react";
import type { Employee } from "@/types";

interface EmployeeAuthContextType {
  currentEmployee: Employee | null;
  isAuthenticated: boolean;
  login: (employee: Employee) => void;
  logout: () => void;
}

const EmployeeAuthContext = React.createContext<EmployeeAuthContextType | undefined>(undefined);

export function EmployeeAuthProvider({ children }: { children: React.ReactNode }) {
  const [currentEmployee, setCurrentEmployee] = React.useState<Employee | null>(null);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  // Load from localStorage on mount
  React.useEffect(() => {
    const storedEmployee = localStorage.getItem("currentEmployee");
    if (storedEmployee) {
      try {
        const employee = JSON.parse(storedEmployee);
        setCurrentEmployee(employee);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Failed to parse stored employee:", error);
        localStorage.removeItem("currentEmployee");
      }
    }
  }, []);

  const login = React.useCallback((employee: Employee) => {
    setCurrentEmployee(employee);
    setIsAuthenticated(true);
    localStorage.setItem("currentEmployee", JSON.stringify(employee));
  }, []);

  const logout = React.useCallback(() => {
    setCurrentEmployee(null);
    setIsAuthenticated(false);
    localStorage.removeItem("currentEmployee");
  }, []);

  return (
    <EmployeeAuthContext.Provider value={{ currentEmployee, isAuthenticated, login, logout }}>
      {children}
    </EmployeeAuthContext.Provider>
  );
}

export function useEmployeeAuth() {
  const context = React.useContext(EmployeeAuthContext);
  if (context === undefined) {
    throw new Error("useEmployeeAuth must be used within an EmployeeAuthProvider");
  }
  return context;
}
