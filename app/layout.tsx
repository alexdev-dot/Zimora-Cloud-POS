import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { ThemeProvider } from "@/lib/contexts/ThemeContext";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Zimora Cloud POS — Point of Sale & Retail Management",
    template: "%s · Zimora Cloud POS",
  },
  description:
    "Zimora Cloud POS is a modern point-of-sale and retail management platform for supermarkets, shops and restaurants across Kenya. Sell faster, track stock and grow your business.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0F766E",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <noscript>
          <style>{`* { opacity: 1 !important; transform: none !important; }`}</style>
        </noscript>
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans`} suppressHydrationWarning>
        <ThemeProvider>
          <ScrollToTop />
          {children}
          <Toaster position="bottom-right" gap={8} toastOptions={{
            classNames: {
              toast:
                "!rounded-lg !border-border !bg-card !text-card-foreground !shadow-pop !text-[13px]",
              description: "!text-muted-foreground",
            },
          }} />
        </ThemeProvider>
      </body>
    </html>
  );
}
