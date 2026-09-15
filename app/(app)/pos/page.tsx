"use client";

import * as React from "react";
import { ShoppingCart, X } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { toast } from "sonner";
import { ProductGrid } from "@/components/pos/ProductGrid";
import { CartPanel, type CartTotals } from "@/components/pos/CartPanel";
import { PaymentDialog, type PaymentResult } from "@/components/pos/PaymentDialog";
import { SuccessModal } from "@/components/pos/SuccessModal";
import { BarcodeDialog } from "@/components/pos/BarcodeDialog";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { getProducts as getSupabaseProducts, updateStock, subscribeToProducts, unsubscribeFromProducts } from "@/lib/api/products";
import { createSale } from "@/lib/api/sales";
import { applyStockChange } from "@/lib/api/inventory";
import { cn, formatKES } from "@/lib/utils";
import type { CartLine, Category, Product, Sale } from "@/types";

export default function PosPage() {
  const [catalog, setCatalog] = React.useState<Product[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [cart, setCart] = React.useState<CartLine[]>([]);
  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState<Category | "All">("All" as Category | "All");
  const [customerId, setCustomerId] = React.useState("walkin");
  const [discount, setDiscount] = React.useState("");
  const [paymentOpen, setPaymentOpen] = React.useState(false);
  const [scanOpen, setScanOpen] = React.useState(false);
  const [cartSheetOpen, setCartSheetOpen] = React.useState(false);
  const [lastSale, setLastSale] = React.useState<{ sale: Sale; payment: Partial<PaymentResult> } | null>(null);
  const [orderSeq, setOrderSeq] = React.useState(1);
  const searchRef = React.useRef<HTMLInputElement>(null);
  const subscriptionRef = React.useRef<any>(null);

  // Fetch products on mount
  React.useEffect(() => {
    async function fetchProducts() {
      try {
        const data = await getSupabaseProducts();
        setCatalog(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProducts();

    // Set up real-time subscription (separate from data fetch to avoid duplicate subscriptions)
    if (!subscriptionRef.current) {
      const channel = subscribeToProducts((updatedProducts) => {
        setCatalog(updatedProducts);
      });
      subscriptionRef.current = channel;
    }

    // Cleanup subscription on unmount
    return () => {
      if (subscriptionRef.current) {
        unsubscribeFromProducts(subscriptionRef.current);
        subscriptionRef.current = null;
      }
    };
  }, []);

  /* "/" focuses the product search */
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (
        e.key === "/" &&
        target.tagName !== "INPUT" &&
        target.tagName !== "TEXTAREA" &&
        target.tagName !== "SELECT"
      ) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return catalog.filter((p) => {
      if (p.status !== "active") return false;
      if (category !== "All" && p.category !== category) return false;
      if (!q) return true;
      return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.barcode.includes(q);
    });
  }, [catalog, search, category]);

  function addToCart(p: Product, silent = false) {
    if (p.stock <= 0) {
      toast.error("Out of stock", { description: `${p.name} is not available right now.` });
      return;
    }
    setCart((prev) => {
      const existing = prev.find((l) => l.product.id === p.id);
      if (existing) {
        if (existing.qty >= p.stock) {
          toast.warning("Stock limit reached", { description: `Only ${p.stock} units of ${p.name} available.` });
          return prev;
        }
        return prev.map((l) => (l.product.id === p.id ? { ...l, qty: l.qty + 1 } : l));
      }
      return [...prev, { product: p, qty: 1 }];
    });
    if (!silent) {
      toast.success(`Added ${p.name}`, { duration: 1200 });
      // Brief highlight handled by cart badge
    }
  }

  function changeQty(productId: string, delta: number) {
    setCart((prev) =>
      prev
        .map((l) => {
          if (l.product.id !== productId) return l;
          const next = l.qty + delta;
          if (next > l.product.stock) {
            toast.warning("Stock limit reached", { description: `Only ${l.product.stock} units available.` });
            return l;
          }
          return { ...l, qty: next };
        })
        .filter((l) => l.qty > 0)
    );
  }

  function removeLine(productId: string) {
    setCart((prev) => prev.filter((l) => l.product.id !== productId));
  }

  const totals: CartTotals = React.useMemo(() => {
    const subtotal = cart.reduce((a, l) => a + l.product.price * l.qty, 0);
    const discountAmount = Math.min(Math.max(0, Math.round(parseFloat(discount) || 0)), subtotal);
    const tax = Math.round((subtotal - discountAmount) * 0.16);
    return { subtotal, discount: discountAmount, tax, total: subtotal - discountAmount + tax };
  }, [cart, discount]);

  async function completeSale(payment: PaymentResult) {
    const customerName = customerId === "walkin" ? "Walk-in Customer" : "Customer";

    const orderNo = `ORD-${orderSeq}`;
    const subtotal = totals.subtotal;
    const sale: Sale = {
      id: `sale-${Date.now()}`,
      orderNo,
      date: new Date().toISOString(),
      customerId,
      customerName,
      cashier: "Cashier",
      branch: "Main Branch",
      items: cart.map((l) => ({
        productId: l.product.id,
        name: l.product.name,
        sku: l.product.sku,
        unitPrice: l.product.price,
        qty: l.qty,
      })),
      subtotal,
      discount: totals.discount,
      tax: totals.tax,
      total: totals.total,
      paymentMethod: payment.method,
      paymentRef: payment.paymentRef,
      status: "completed",
    };

    try {
      for (const line of cart) {
        await applyStockChange(
          line.product.id,
          -line.qty,
          'sale',
          orderNo,
          "Cashier",
          `Sale to ${customerName}`
        );
      }

      await createSale(sale);

      // Refresh catalog
      const updated = await getSupabaseProducts();
      setCatalog(updated);

      setLastSale({ sale, payment });
      setPaymentOpen(false);
      setCartSheetOpen(false);
      setCart([]);
      setDiscount("");
      setOrderSeq((n) => n + 1);
    } catch (error) {
      console.error('Failed to complete sale:', error);
      toast.error('Failed to complete sale');
    }
  }

  const cartCount = cart.reduce((a, l) => a + l.qty, 0);

  const cartPanel = (
    <CartPanel
      lines={cart}
      onQty={changeQty}
      onRemove={removeLine}
      customerId={customerId}
      onCustomer={setCustomerId}
      discount={discount}
      onDiscount={setDiscount}
      totals={totals}
      onCheckout={() => setPaymentOpen(true)}
      onHold={() => {
        toast.success("Sale held", { description: `${cartCount} items parked. Resume it from this till anytime.` });
      }}
      onClear={() => {
        setCart([]);
        setDiscount("");
        toast.info("Cart cleared");
      }}
    />
  );

  return (
    <div className="flex h-[calc(100dvh-60px)] min-h-0 overflow-hidden">
      {/* Products pane */}
      <div className="flex min-w-0 flex-1 flex-col">
        <ProductGrid
          products={filtered}
          search={search}
          onSearch={setSearch}
          category={category}
          onCategory={setCategory}
          onAdd={addToCart}
          onScan={() => setScanOpen(true)}
          searchRef={searchRef}
        />
      </div>

      {/* Cart pane (desktop/tablet) */}
      <aside className="hidden w-[330px] shrink-0 border-l border-border md:block xl:w-[400px]">
        {cartPanel}
      </aside>

      {/* Mobile cart bar */}
      <div className="fixed inset-x-3 bottom-0 z-40 pb-[max(env(safe-area-inset-bottom),0.75rem)] md:hidden">
        <button
          onClick={() => setCartSheetOpen(true)}
          className={cn(
            "focus-ring flex w-full items-center gap-3 rounded-xl bg-primary px-4 py-3 text-primary-foreground shadow-pop transition-transform active:scale-[.99]",
            cartCount === 0 && "opacity-90"
          )}
        >
          <span className="relative">
            <ShoppingCart className="size-5" />
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex size-[18px] min-w-[18px] items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-primary">
                {cartCount}
              </span>
            )}
          </span>
          <span className="flex-1 text-left text-[13px] font-medium">
            {cartCount === 0 ? "View current sale" : `${cartCount} ${cartCount === 1 ? "item" : "items"} in cart`}
          </span>
          <span className="text-[15px] font-semibold tabular-nums">{formatKES(totals.total)}</span>
        </button>
      </div>

      {/* Mobile cart sheet */}
      <Sheet open={cartSheetOpen} onOpenChange={setCartSheetOpen}>
        <SheetContent className="w-full sm:max-w-md [&>button:last-child]:hidden">
          <SheetTitle className="sr-only">Current sale</SheetTitle>
          <DialogPrimitive.Close
            aria-label="Close cart"
            className="focus-ring absolute right-3 top-3 z-10 rounded-lg bg-muted/80 p-2 text-muted-foreground backdrop-blur"
          >
            <X className="size-4" />
          </DialogPrimitive.Close>
          <div className="h-full pt-6 pb-[max(env(safe-area-inset-bottom),1rem)]">{cartPanel}</div>
        </SheetContent>
      </Sheet>

      {/* Payment + success + scanner */}
      <PaymentDialog
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        total={totals.total}
        onComplete={completeSale}
      />
      <SuccessModal
        open={Boolean(lastSale)}
        onOpenChange={(open) => {
          if (!open) setLastSale(null);
        }}
        sale={lastSale?.sale ?? null}
        payment={lastSale?.payment ?? null}
        onNewSale={() => {
          setLastSale(null);
          searchRef.current?.focus();
        }}
      />
      <BarcodeDialog
        open={scanOpen}
        onOpenChange={setScanOpen}
        onFound={(p) => addToCart(p, true)}
        products={catalog}
      />
    </div>
  );
}

/* Keep the Category import used for type-safety of tabs */
export type { Category };
