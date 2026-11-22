import { Link } from "react-router-dom";

const footerLinks = {
  Shop: ["All Products", "Categories", "Deals", "New Arrivals", "Bestsellers"],
  Help: ["Contact Us", "FAQ", "Shipping", "Returns", "Track Order"],
  Company: ["About Us", "Careers", "Press", "Blog", "Seller Hub"],
  Legal: ["Privacy Policy", "Terms of Service", "Cookie Policy", "Licensing"],
};

export function Footer() {
  return (
    <footer className="bg-foreground text-background mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-1.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">D</span>
              </div>
              <span className="text-lg font-bold font-[var(--font-heading)]">DesiCart</span>
            </div>
            <p className="text-sm opacity-70 leading-relaxed">
              India's most trusted marketplace for everything you need. Quality products, best
              prices.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold text-sm mb-3 font-[var(--font-heading)]">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <Link
                      to="/"
                      className="text-sm opacity-70 hover:opacity-100 transition-opacity"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-background/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs opacity-60">© 2026 DesiCart. All rights reserved.</p>
          <div className="flex items-center gap-3 text-xs opacity-60">
            <span>Visa</span>
            <span>•</span>
            <span>Mastercard</span>
            <span>•</span>
            <span>UPI</span>
            <span>•</span>
            <span>Net Banking</span>
            <span>•</span>
            <span>COD</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
