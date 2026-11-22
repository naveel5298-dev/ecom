import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { ChevronRight, Zap, TrendingUp, ArrowRight, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { ProductCard } from "@/components/product-card";
import {
  categories,
  bannerSlides,
  formatPrice,
  mapApiProduct,
} from "@/lib/mock-data";
import { RootState, AppDispatch } from "@/redux/store";
import { useSelector, useDispatch } from "react-redux";
import { setProducts, setLoading } from "@/redux/productSlice";
import { getProductsApi } from "@/api/productApi";

export function HomePage() {
  const dispatch = useDispatch<AppDispatch>();
  const { products } = useSelector((state: RootState) => state.products);
  console.log("Products from Redux store:", products);

  // Fetch products if not already loaded
  useEffect(() => {
    if (products.length === 0) {
      const fetchProducts = async () => {
        try {
          dispatch(setLoading(true));
          const response = await getProductsApi();
          console.log("Fetched products from API:", response.data);
          const apiProducts = (response.data?.items || response.data || []).map(
            (item: any) => mapApiProduct(item)
          );
          dispatch(setProducts(apiProducts));
        } catch (err) {
          console.error("Failed to fetch products:", err);
        }
      };
      fetchProducts();
    }
  }, [dispatch, products.length]);

  return (
    <div className="space-y-10 md:space-y-16">
      <HeroBanner />
      <FlashDeals products={products} />
      <TopCategories />
      <TrendingProducts products={products} />
      <DealsOfTheDay products={products} />
      <Newsletter />
    </div>
  );
}

// ── Hero Banner Carousel ──
function HeroBanner() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrent((i) => (i + 1) % bannerSlides.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const slide = bannerSlides[current];

  return (
    <section className="relative overflow-hidden">
      <div className="relative h-[320px] sm:h-[400px] lg:h-[480px]">
        <div className="absolute inset-0">
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover transition-all duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />
        </div>

        <div className="relative h-full max-w-7xl mx-auto px-4 flex items-center">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-lg"
          >
            <span className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold mb-4 backdrop-blur-sm border border-primary/20">
              🔥 Limited Time Offer
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white font-[var(--font-heading)] leading-tight mb-3">
              {slide.title}
            </h1>
            <p className="text-base sm:text-lg text-white/80 mb-6">{slide.subtitle}</p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 active:scale-[0.97] transition-all shadow-lg shadow-primary/25"
            >
              {slide.cta} <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {bannerSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all ${i === current ? "w-8 bg-primary" : "w-2 bg-white/50"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Flash Deals ──
function FlashDeals({ products }: { products: any[] }) {
  const flashDeals = products.filter((p) => p.discount >= 50).slice(0, 6);
  const [timeLeft, setTimeLeft] = useState({ h: 5, m: 32, s: 14 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { h, m, s } = prev;
        s -= 1;
        if (s < 0) {
          s = 59;
          m -= 1;
        }
        if (m < 0) {
          m = 59;
          h -= 1;
        }
        if (h < 0) return { h: 0, m: 0, s: 0 };
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (flashDeals.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-destructive/10">
            <Zap className="w-4 h-4 text-destructive" />
            <h2 className="text-lg sm:text-xl font-bold font-[var(--font-heading)]">Flash Deals</h2>
          </div>
          <div className="flex items-center gap-1.5 text-sm font-mono">
            <TimeBox value={timeLeft.h} />
            <span className="text-muted-foreground font-bold">:</span>
            <TimeBox value={timeLeft.m} />
            <span className="text-muted-foreground font-bold">:</span>
            <TimeBox value={timeLeft.s} />
          </div>
        </div>
        <Link
          to="/products"
          className="text-sm font-medium text-primary flex items-center gap-1 hover:underline"
        >
          View All <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {flashDeals.map((p, i) => (
          <ProductCard key={p.id} Product={p} index={i} />
        ))}
      </div>
    </section>
  );
}

function TimeBox({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-foreground text-background text-sm font-bold">
      {String(value).padStart(2, "0")}
    </span>
  );
}

// ── Top Categories ──
function TopCategories() {
  return (
    <section className="max-w-7xl mx-auto px-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg sm:text-xl font-bold font-[var(--font-heading)]">
          Shop by Category
        </h2>
        <Link
          to="/products"
          className="text-sm font-medium text-primary flex items-center gap-1 hover:underline"
        >
          All Categories <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
          >
            <Link
              to={`/products?category=${cat.id}`}
              className="group flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-muted transition-all"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-muted shadow-sm group-hover:shadow-md transition-shadow">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              <span className="text-xs sm:text-sm font-medium text-center leading-tight">
                {cat.name}
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ── Trending Products ──
function TrendingProducts({ products }: { products: any[] }) {
  const trending = products.filter((p) => p.rating >= 4.4).slice(0, 8);
  // If no products have high enough rating, just show first 8
  const displayProducts = trending.length > 0 ? trending : products.slice(0, 8);

  if (displayProducts.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h2 className="text-lg sm:text-xl font-bold font-[var(--font-heading)]">Trending Now</h2>
        </div>
        <Link
          to="/products"
          className="text-sm font-medium text-primary flex items-center gap-1 hover:underline"
        >
          View All <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
        {displayProducts.map((p, i) => (
          <ProductCard key={p.id} Product={p} index={i} />
        ))}
      </div>
    </section>
  );
}

// ── Deals of the Day ──
function DealsOfTheDay({ products }: { products: any[] }) {
  const deals = products.filter((p) => p.discount >= 45).slice(0, 3);

  if (deals.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4">
      <h2 className="text-lg sm:text-xl font-bold font-[var(--font-heading)] mb-6">
        Deals of the Day
      </h2>
      <div className="grid md:grid-cols-3 gap-4">
        {deals.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Link
              to={`/products/${p.id}`}
              className="group block bg-card rounded-2xl border overflow-hidden hover:shadow-lg transition-all"
            >
              <div className="flex gap-4 p-4">
                <div className="w-28 h-28 rounded-xl overflow-hidden bg-muted shrink-0">
                  <img
                    src={p.image}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase text-primary">{p.brand}</span>
                  <h3 className="text-sm font-semibold line-clamp-2 mt-1 group-hover:text-primary transition-colors">
                    {p.title}
                  </h3>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-lg font-bold">{formatPrice(p.productPrice || p.price)}</span>
                    <span className="text-xs text-muted-foreground line-through">
                      {formatPrice(p.originalPrice)}
                    </span>
                  </div>
                  <span className="inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-success/10 text-success">
                    {p.discount}% OFF
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ── Newsletter ──
function Newsletter() {
  return (
    <section className="max-w-7xl mx-auto px-4">
      <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 sm:p-12 text-center">
        <Mail className="w-10 h-10 mx-auto mb-4 text-primary-foreground/80" />
        <h2 className="text-xl sm:text-2xl font-bold text-primary-foreground font-[var(--font-heading)] mb-2">
          Get Exclusive Deals
        </h2>
        <p className="text-sm text-primary-foreground/80 mb-6 max-w-md mx-auto">
          Subscribe to our newsletter and get 10% off your first order. Plus, be the first to know
          about new arrivals and sales.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 w-full sm:w-auto h-11 px-4 rounded-xl bg-white/20 backdrop-blur-sm border border-white/20 text-primary-foreground placeholder:text-primary-foreground/50 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
          />
          <button className="w-full sm:w-auto h-11 px-6 rounded-xl bg-white text-foreground font-semibold text-sm hover:bg-white/90 transition-colors">
            Subscribe
          </button>
        </div>
      </div>
    </section>
  );
}
