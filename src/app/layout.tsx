import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: {
    template: "%s | LuminaStore",
    default: "LuminaStore - Premium Multi-Vendor E-Commerce",
  },
  description: "A luxury multi-vendor e-commerce platform.",
  openGraph: {
    type: "website",
    title: "LuminaStore - Premium Multi-Vendor E-Commerce",
    description: "A luxury multi-vendor e-commerce platform.",
    url: "https://luminastore.com",
    siteName: "LuminaStore",
  },
  twitter: {
    card: "summary_large_image",
    title: "LuminaStore - Premium Multi-Vendor E-Commerce",
    description: "A luxury multi-vendor e-commerce platform.",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "LuminaStore",
  "url": "https://luminastore.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://luminastore.com/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="antialiased min-h-screen bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            {children}
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
