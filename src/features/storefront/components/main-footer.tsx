import Link from "next/link"

export function MainFooter() {
  return (
    <footer className="border-t border-border/40 bg-muted/20 mt-20">
      <div className="container mx-auto px-4 py-12 flex flex-col md:flex-row justify-between gap-8">
        <div className="max-w-sm">
          <h3 className="font-heading font-bold text-xl mb-4">LuminaStore</h3>
          <p className="text-muted-foreground text-sm">
            The premium multi-vendor marketplace for luxury goods. Experience elegance in every purchase.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          <div className="flex flex-col gap-2">
            <h4 className="font-semibold mb-2">Shop</h4>
            <Link href="/categories/clothing" className="text-sm text-muted-foreground hover:text-foreground">Clothing</Link>
            <Link href="/categories/accessories" className="text-sm text-muted-foreground hover:text-foreground">Accessories</Link>
            <Link href="/categories/jewelry" className="text-sm text-muted-foreground hover:text-foreground">Jewelry</Link>
          </div>
          <div className="flex flex-col gap-2">
            <h4 className="font-semibold mb-2">Company</h4>
            <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground">About</Link>
            <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">Contact</Link>
            <Link href="/careers" className="text-sm text-muted-foreground hover:text-foreground">Careers</Link>
          </div>
          <div className="flex flex-col gap-2">
            <h4 className="font-semibold mb-2">Legal</h4>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">Privacy</Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">Terms</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-border/40 py-6 text-center">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} LuminaStore. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
