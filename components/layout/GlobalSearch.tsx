"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CornerDownLeft,
  Package,
  Plus,
  Search,
  Store,
  BarChart3,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { FLAT_NAV } from "@/lib/constants";

import { formatKES } from "@/lib/utils";
import { cn } from "@/lib/utils";

const QUICK_ACTIONS = [
  { label: "New sale", hint: "Open the till", href: "/pos", icon: Store },
  { label: "Add product", hint: "Create a new product", href: "/products?new=1", icon: Plus },
  { label: "View reports", hint: "Sales analytics", href: "/reports", icon: BarChart3 },
];

export function GlobalSearch({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open) setQuery("");
  }, [open]);

  const q = query.trim().toLowerCase();

  const pages = React.useMemo(
    () =>
      FLAT_NAV.filter((n) =>
        q ? n.label.toLowerCase().includes(q) || n.href.includes(q) : true
      ).slice(0, q ? 5 : 6),
    [q]
  );

  const matchedProducts = React.useMemo(() => [], [q]);

  const actions = React.useMemo(
    () => (q ? QUICK_ACTIONS.filter((a) => a.label.toLowerCase().includes(q)) : QUICK_ACTIONS),
    [q]
  );

  const firstHref =
    actions[0]?.href ?? pages[0]?.href ?? (matchedProducts[0] ? "/products" : null);

  function go(href: string) {
    onOpenChange(false);
    router.push(href);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg" className="top-[15%] translate-y-0 p-0 [&>button:last-child]:hidden">
        <DialogTitle className="sr-only">Global search</DialogTitle>
        {/* Sentence-safe: label covers the input */}
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages, products, actions…"
            aria-label="Search pages, products and actions"
            className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/70"
            onKeyDown={(e) => {
              if (e.key === "Enter" && firstHref) go(firstHref);
            }}
          />
          <kbd className="kbd">Esc</kbd>
        </div>

        <div className="max-h-[52vh] overflow-y-auto p-2">
          {actions.length > 0 && (
            <Section title="Quick actions">
              {actions.map((a) => (
                <Row key={a.href} onClick={() => go(a.href)} icon={<a.icon className="size-4" />}>
                  <span className="flex-1">{a.label}</span>
                  <span className="text-xs text-muted-foreground">{a.hint}</span>
                </Row>
              ))}
            </Section>
          )}

          {pages.length > 0 && (
            <Section title="Pages">
              {pages.map((p) => (
                <Row key={p.href} onClick={() => go(p.href)} icon={<p.icon className="size-4" />}>
                  <span className="flex-1">{p.label}</span>
                  <ArrowRight className="size-3.5 text-muted-foreground" />
                </Row>
              ))}
            </Section>
          )}



          {actions.length === 0 && pages.length === 0 && (
            <p className="px-3 py-10 text-center text-[13px] text-muted-foreground">
              No results for “{query}”
            </p>
          )}
        </div>

        <div className="flex items-center gap-4 border-t border-border bg-muted/30 px-4 py-2 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <kbd className="kbd"><CornerDownLeft className="size-2.5" /></kbd> open
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="kbd">Esc</kbd> close
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-1">
      <p className="px-3 pb-1 pt-2.5 text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground/80">
        {title}
      </p>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function Row({
  icon,
  children,
  onClick,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-[13.5px] outline-none transition-colors hover:bg-muted focus-visible:bg-muted focus-ring"
      )}
    >
      <span className="text-muted-foreground">{icon}</span>
      {children}
    </button>
  );
}
