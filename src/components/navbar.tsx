import { Link } from "react-router-dom";
import { Search, ShoppingCart, Heart, User, Menu, X, Moon, Sun, ChevronDown, Store } from "lucide-react";
import { useState } from "react";
// import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { useTheme } from "@/hooks/use-theme";
import { categories } from "@/lib/mock-data";
import { useAuth } from "@/context/AuthContext";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  // const { totalItems } = useCart();
const totalItems = useSelector(
  (state: RootState) =>
    state.cart.items.reduce((total, item) => total + item.quantity, 0)
);

  const { count: wishCount } = useWishlist();
  const { dark, toggle: toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const items = useSelector((state: RootState) => state.cart.items);
  // const totalItems = items.reduce((total, item) => total + item.quantity, 0);


  return (
    <>
      {/* Top bar */}
      <div className="hidden md:block bg-foreground text-background text-xs">
        <div className="max-w-7xl mx-auto px-4 py-1.5 flex items-center justify-between">
          <span>Free delivery on orders over ₹499 🚚</span>
          <div className="flex items-center gap-4">
            <span>Download App</span>
            <span>Sell on DesiCart</span>
            <span>Help Center</span>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-3">
          {/* Mobile menu toggle */}
          <button className="md:hidden p-2 -ml-2" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-1.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm font-[var(--font-heading)]">D</span>
            </div>
            <span className="hidden sm:block text-xl font-bold font-[var(--font-heading)] text-foreground">
              Desi<span className="text-primary">Cart</span>
            </span>
          </Link>

          {/* Categories dropdown - desktop */}
          <div className="hidden lg:block relative" onMouseEnter={() => setMegaMenuOpen(true)} onMouseLeave={() => setMegaMenuOpen(false)}>
            <button className="flex items-center gap-1 text-sm font-medium px-3 py-2 rounded-lg hover:bg-muted transition-colors">
              Categories <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {megaMenuOpen && (
              <div className="absolute top-full left-0 w-[600px] bg-card rounded-xl shadow-xl border p-4 grid grid-cols-2 gap-2" style={{ animation: "fade-in-up 0.15s ease-out" }}>
                {categories.map(c => (
                  <Link key={c.id} to={`/products?category=${c.id}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors group">
                    <span className="text-2xl">{c.icon}</span>
                    <div>
                      <div className="text-sm font-medium group-hover:text-primary transition-colors">{c.name}</div>
                      <div className="text-xs text-muted-foreground">{c.count.toLocaleString()} products</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-xl relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products, brands..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-muted/60 border-0 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button onClick={toggleTheme} className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg hover:bg-muted transition-colors min-w-[60px]" aria-label="Toggle theme">
              {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              <span className="text-[10px] font-medium hidden sm:block">Theme</span>
            </button>

            <Link to="/seller" className="hidden sm:flex flex-col items-center justify-center gap-1 p-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors min-w-[60px]" aria-label="Seller Dashboard">
              <Store className="w-5 h-5" />
              <span className="text-[10px] font-medium whitespace-nowrap">Sell</span>
            </Link>

            {user ? (
              <div className="relative group hidden sm:block" onMouseEnter={() => setProfileDropdownOpen(true)} onMouseLeave={() => setProfileDropdownOpen(false)}>
                <Link to="/account/profile" className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg hover:bg-muted transition-colors min-w-[60px]">
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-[10px] font-bold overflow-hidden">
                    {(user?.name || user?.email || "U").charAt(0).toUpperCase()}
                  </div>
                  <span className="text-[10px] font-medium whitespace-nowrap truncate max-w-[60px]">
                    {user?.name || "Profile"}
                  </span>
                </Link>
                {profileDropdownOpen && (
                  <div className="absolute top-full right-0 mt-0 pt-2 w-48 z-50">
                    <div className="bg-card border rounded-lg shadow-lg overflow-hidden flex flex-col p-1 animate-in fade-in slide-in-from-top-2">
                      <div className="px-3 py-2 border-b mb-1">
                        <p className="text-sm font-medium truncate">{user?.name || "User"}</p>
                        {user?.email && <p className="text-xs text-muted-foreground truncate">{user.email}</p>}
                      </div>
                      <Link to="/account/profile" className="px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors" onClick={() => setProfileDropdownOpen(false)}>My Account</Link>
                      <Link to="/account/orders" className="px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors" onClick={() => setProfileDropdownOpen(false)}>Orders</Link>
                      <button onClick={() => { logout(); setProfileDropdownOpen(false); }} className="w-full text-left px-3 py-2 text-sm text-red-500 rounded-md hover:bg-red-500/10 transition-colors mt-1 border-t">Logout</button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="hidden sm:flex flex-col items-center justify-center gap-1 p-2 rounded-lg hover:bg-muted transition-colors min-w-[60px]" aria-label="Login / Sign Up">
                <User className="w-5 h-5" />
                <span className="text-[10px] font-medium whitespace-nowrap">Login/Signup</span>
              </Link>
            )}

            <Link to="/products" className="relative flex flex-col items-center justify-center gap-1 p-2 rounded-lg hover:bg-muted transition-colors min-w-[60px]" aria-label="Wishlist">
              <div className="relative">
                <Heart className="w-5 h-5" />
                {wishCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-secondary text-secondary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                    {wishCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium hidden sm:block">Wishlist</span>
            </Link>

            <Link to="/cart" className="relative flex flex-col items-center justify-center gap-1 p-2 rounded-lg hover:bg-muted transition-colors min-w-[60px]" aria-label="Cart">
              <div className="relative">
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium hidden sm:block">Cart ({totalItems})</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile menu drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMenuOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 bg-card shadow-2xl p-4 overflow-y-auto" style={{ animation: "slide-in-left 0.2s ease-out" }}>
            <div className="text-lg font-bold font-[var(--font-heading)] mb-4">Categories</div>
            {categories.map(c => (
              <Link key={c.id} to={`/products?category=${c.id}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted" onClick={() => setMenuOpen(false)}>
                <span className="text-xl">{c.icon}</span>
                <span className="text-sm font-medium">{c.name}</span>
              </Link>
            ))}
            <div className="border-t my-4" />
            <Link to="/seller" className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 text-primary" onClick={() => setMenuOpen(false)}>
              <Store className="w-4 h-4" /> <span className="text-sm font-medium">Sell on DesiCart</span>
            </Link>
            <Link to="/account/profile" className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted" onClick={() => setMenuOpen(false)}>
              <User className="w-4 h-4" /> <span className="text-sm font-medium">My Account</span>
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
