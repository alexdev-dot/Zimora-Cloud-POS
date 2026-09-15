"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopHeader } from "@/components/layout/TopHeader";
import { GlobalSearch } from "@/components/layout/GlobalSearch";
import { BrandMark, SidebarNav } from "@/components/layout/SidebarNav";
import { TooltipProvider } from "@/components/ui/misc";


export function AppShell({ children }: { children: React.ReactNode }) {
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [navOpen, setNavOpen] = React.useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  // ⌘K / Ctrl+K opens global search
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="min-h-dvh">
          <a
            href="#main-content"
            className="focus-ring sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:rounded-lg focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:text-primary-foreground"
          >
            Skip to content
          </a>

          <Sidebar collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />

          {/* Mobile navigation drawer */}
          <DialogPrimitive.Root open={navOpen} onOpenChange={setNavOpen}>
            <DialogPrimitive.Portal>
              <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-slate-950/40 data-[state=open]:animate-fade-in lg:hidden" />
              <DialogPrimitive.Content
                className="fixed inset-y-0 left-0 z-50 flex w-[272px] flex-col border-r border-slate-200 bg-white shadow-pop outline-none data-[state=open]:animate-slide-in-right [animation-direction:reverse] lg:hidden"
                aria-describedby={undefined}
              >
                <DialogPrimitive.Title className="sr-only">Navigation</DialogPrimitive.Title>
                <DialogPrimitive.Close
                  aria-label="Close navigation"
                  className="focus-ring absolute right-3 top-3.5 rounded-md p-1 text-muted-foreground hover:bg-muted"
                >
                  <X className="size-4" />
                </DialogPrimitive.Close>
                <div className="flex h-[60px] shrink-0 items-center gap-2.5 border-b border-slate-100 px-4">
                  <BrandMark />
                  <span className="text-[15px] font-semibold tracking-tight">Zimora Cloud POS</span>
                </div>
                <SidebarNav onNavigate={() => setNavOpen(false)} />
              </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
          </DialogPrimitive.Root>

          <div className={`flex min-h-dvh flex-col transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-60'}`}>
            <TopHeader
              onMenuClick={() => setNavOpen(true)}
              onSearchClick={() => setSearchOpen(true)}
              onSidebarToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
            <main id="main-content" className="flex min-w-0 flex-1 flex-col">
              {children}
            </main>
          </div>

          <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
        </div>
      </TooltipProvider>
  );
}
