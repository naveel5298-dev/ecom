import { Link } from "react-router-dom";
import { Home, Search, ShoppingCart, User, Grid3X3 } from "lucide-react";
// import { useCart } from "@/hooks/use-cart";
import { useLocation } from "react-router-dom";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";

export function BottomNav() {
  // const { totalItems } = useCart();
  const totalItems = useSelector(
    (state: RootState) =>
      state.cart.items.reduce((total, item) => total + item.quantity, 0)
  );
  const location = useLocation();
  const pathname = location.pathname;

  const items = [
    { to: "/" as const, label: "Home", icon: Home },
    { to: "/products" as const, label: "Categories", icon: Grid3X3 },
    { to: "/search" as const, label: "Search", icon: Search },
    { to: "/cart" as const, label: "Cart", icon: ShoppingCart, badge: totalItems },
    { to: "/account/profile" as const, label: "Account", icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-xl border-t safe-area-pb">
      <div className="flex items-center justify-around h-16">
        {items.map((item) => {
          const isActive =
            pathname === item.to || (item.to !== "/" && pathname.startsWith(item.to));
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors relative ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span className="absolute -top-0.5 right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[9px] font-bold rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
