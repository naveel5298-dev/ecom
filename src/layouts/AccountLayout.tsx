import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { User, MapPin, Package, Heart, LogOut, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { log } from "console";


const navItems = [
  { to: "/account/profile", label: "Profile", icon: User },
  { to: "/account/addresses", label: "Addresses", icon: MapPin },
  { to: "/account/orders", label: "Orders", icon: Package },
  { to: "/account/wishlist", label: "Wishlist & Returns", icon: Heart },
];

export function AccountLayout() {
  const location = useLocation();
  const pathname = location.pathname;
  const navigate = useNavigate();


   const { user,logout }: any = useAuth();
    // console.log("user:", user?.name);
  const [form, setForm] = useState({
     name: "",
     email: ""
    
  });
  
  useEffect(() => {
     if (user) {
        setForm({
           name: user?.name || "",
           email: user?.email || "",
           
        });
     }
  }, [user]);
  


  const handleSignOut = () => {
    logout();
    // Clear any stored auth data if needed
    // localStorage.removeItem("token");
    // localStorage.removeItem("user");
    // Navigate to login page
    // navigate("/login");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-10">
      <h1 className="text-2xl font-bold font-[var(--font-heading)] mb-6">My Account</h1>
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar - desktop */}
        <aside className="hidden md:block w-56 shrink-0">
          <div className="bg-card rounded-2xl border p-4 space-y-1 sticky top-24">
            <div className="flex items-center gap-3 p-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-sm font-semibold">{form.name}</div>
                <div className="text-xs text-muted-foreground">{form.email}</div>
              </div>
            </div>
            {navItems.map((item) => {
              const active = pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
            <div className="border-t my-2" />
            <button 
              onClick={handleSignOut}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground w-full transition-colors"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </aside>

        {/* Mobile tabs */}
        <div className="md:hidden flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap border transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border text-muted-foreground"
                }`}
              >
                <item.icon className="w-3.5 h-3.5" />
                {item.label}
              </Link>
            );
          })}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap border bg-card border-border text-muted-foreground hover:bg-muted transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0"
          > 
          <Link 
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
          >
            Start Shopping <ArrowRight className="w-4 h-4" />
          </Link>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
