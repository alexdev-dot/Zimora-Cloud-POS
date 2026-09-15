import Link from "next/link";
import { BrandMark } from "@/components/layout/SidebarNav";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-background px-6 text-center">
      <BrandMark />
      <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
        404 — Page not found
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">
        This shelf is empty
      </h1>
      <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
        Head back to your dashboard to keep selling.
      </p>
      <div className="mt-6 flex gap-2">
        <Button asChild>
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/pos">Open Point of Sale</Link>
        </Button>
      </div>
    </main>
  );
}
