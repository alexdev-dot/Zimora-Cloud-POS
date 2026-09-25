import { AppShell } from "@/components/layout/AppShell";
import { EmployeeAuthProvider } from "@/lib/contexts/EmployeeAuthContext";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <EmployeeAuthProvider>
      <AppShell>{children}</AppShell>
    </EmployeeAuthProvider>
  );
}
