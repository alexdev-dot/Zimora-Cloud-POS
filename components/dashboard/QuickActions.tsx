"use client";

import { useRouter } from "next/navigation";
import {
  BarChart3,
  PackagePlus,
  Plus,
  Store,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";

const ACTIONS: { label: string; icon: LucideIcon; href?: string; toast?: string }[] = [
  { label: "New Sale", icon: Store, href: "/pos" },
  { label: "Add Product", icon: Plus, href: "/products?new=1" },
  { label: "Receive Stock", icon: PackagePlus, href: "/inventory?action=receive" },
  { label: "Add Expense", icon: Wallet, href: "/expenses?new=1" },
  { label: "View Reports", icon: BarChart3, href: "/reports" },
];

export function QuickActions() {
  const router = useRouter();
  return (
    <Card className="p-5">
      <h3 className="text-[15px] font-semibold tracking-tight">Quick actions</h3>
      <p className="mt-0.5 text-xs text-muted-foreground">Jump straight into common tasks</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {ACTIONS.map((a) => (
          <button
            key={a.label}
            onClick={() =>
              a.href ? router.push(a.href) : toast.info(a.label, { description: "Coming soon" })
            }
            className="focus-ring group flex flex-1 min-w-[120px] flex-col items-center gap-2 rounded-lg border border-border bg-card px-2 py-3.5 text-center transition-colors hover:border-primary/30 hover:bg-accent/60"
          >
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <a.icon className="size-4" />
            </span>
            <span className="text-xs font-medium">{a.label}</span>
          </button>
        ))}
      </div>
    </Card>
  );
}
