import { Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Star,
  Heart,
  ShoppingCart,
  Truck,
  Shield,
  RotateCcw,
  ChevronRight,
  Minus,
  Plus,
  Check,
  MapPin,
} from "lucide-react";
import { motion } from "framer-motion";
import { reviews, formatPrice, mapApiProduct, type Product } from "@/lib/mock-data";
import { useWishlist } from "@/hooks/use-wishlist";
import { ProductCard } from "@/components/product-card";
import { toast } from "sonner";
import { addtoCartApi } from "@/api/cartApi";
import { RootState, AppDispatch } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../redux/cartSlice";
import { getProductsApi } from "@/api/productApi";
import { setProducts, setLoading, setError } from "@/redux/productSlice";

export function ProductDetailsPage() {
  const { productId } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const { toggle, isWishlisted } = useWishlist();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"desc" | "specs" | "reviews">("desc");
  const [pincode, setPincode] = useState("");

  // Get products from Redux store
  const { products, loading } = useSelector(
    (state: RootState) => state.products
  );

  // Fetch products if not already loaded
  useEffect(() => {
    if (products.length === 0) {
      const fetchProducts = async () => {
        try {
          dispatch(setLoading(true));
          const response = await getProductsApi();
          const apiProducts = (response.data?.items || response.data || []).map(
            (item: any) => mapApiProduct(item)
          );
          console.log("prodct detls fetch prod",apiProducts);
          dispatch(setProducts(apiProducts));
        } catch (err) {
          console.error("Failed to fetch products:", err);
          dispatch(setError("Failed to fetch products"));
        }
      };
      fetchProducts();
    }
  }, [dispatch, products.length]);

  // Find the current product from Redux state
  const product = products.find((p: Product) => String(p.id) === String(productId));

  if (loading && products.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="text-xl">Loading product...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">📦</div>
        <h2 className="text-xl font-bold font-[var(--font-heading)] mb-2">Product not found</h2>
        <Link to="/products" className="text-primary text-sm hover:underline">
          Browse products
        </Link>
      </div>
    );
  }

  const wishlisted = isWishlisted(product.id);
  const relatedProducts = products
    .filter((p: Product) => p.category === product.category && String(p.id) !== String(product.id))
    .slice(0, 4);

  const handleAddToCart = async () => {
    try {
      const AddData = {
        productId: product.id,
        quantity: quantity,
      };
      const response = await addtoCartApi(AddData);

      if (response?.status === "success" || response?.data) {
        // Build the cart item from the API response or fallback to our local knowledge
        const cartItem = {
          cartItemId: String(response.data?.id || product.id),
          productId: String(product.id),
          title: product.title,
          image: product.image,
          price: product.price,
          originalPrice: product.originalPrice,
          quantity: quantity,
          size: selectedSize || undefined,
          color: selectedColor || undefined,
        };
        dispatch(addToCart(cartItem));
        toast.success("Added to cart!");
      } else {
        toast.error("Failed to add to carttt");
        console.error("Response:", response);
      }
    } catch (err) {
      console.error("Failed to add to cart:", err);
      toast.error("Failed to add to cart. Please try again.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6 flex-wrap">
        <Link to="/" className="hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="w-3 h-3" />
        <Link to="/products" className="hover:text-foreground">
          Products
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground font-medium line-clamp-1">{product.title}</span>
      </nav>

      {/* Main content */}
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image gallery */}
        <div className="space-y-3">
          <motion.div
            key={selectedImage}
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 1 }}
            className="aspect-square rounded-2xl overflow-hidden bg-muted"
          >
            <img
              src={product.images?.[selectedImage] || product.image}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </motion.div>
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${i === selectedImage ? "border-primary" : "border-transparent hover:border-muted-foreground/30"}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div>
          <span className="text-xs font-bold uppercase text-primary tracking-wider">
            {product.brand}
          </span>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold font-[var(--font-heading)] mt-1 mb-3 leading-tight">
            {product.title}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-success/10">
              <Star className="w-4 h-4 fill-success text-success" />
              <span className="text-sm font-bold text-success">{product.rating}</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {(product.reviewCount || 0).toLocaleString()} ratings
            </span>
            {product.badge && (
              <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-bold">
                {product.badge}
              </span>
            )}
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-1">
            <span className="text-3xl font-bold">{formatPrice(product.price)}</span>
            {product.originalPrice > product.price && (
              <>
                <span className="text-lg text-muted-foreground line-through">
                  {formatPrice(product.originalPrice)}
                </span>
                <span className="text-sm font-bold text-success">{product.discount}% off</span>
              </>
            )}
          </div>
          <p className="text-xs text-muted-foreground mb-6">Inclusive of all taxes</p>

          {/* Offers */}
          <div className="bg-muted/50 rounded-xl p-4 mb-6 space-y-2">
            <p className="text-sm font-semibold font-[var(--font-heading)]">Available Offers</p>
            <p className="text-xs text-muted-foreground flex items-start gap-2">
              <span className="text-success">✓</span> Bank Offer: 10% off on HDFC Cards
            </p>
            <p className="text-xs text-muted-foreground flex items-start gap-2">
              <span className="text-success">✓</span> No Cost EMI from ₹
              {Math.round(product.price / 6)}/month
            </p>
            <p className="text-xs text-muted-foreground flex items-start gap-2">
              <span className="text-success">✓</span> Extra 5% cashback with DesiCart Pay
            </p>
          </div>

          {/* Color selector */}
          {product.colors && (
            <div className="mb-5">
              <p className="text-sm font-semibold mb-2">Color</p>
              <div className="flex gap-2">
                {product.colors.map((color: string) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-9 h-9 rounded-full border-2 transition-all ${selectedColor === color ? "border-primary scale-110" : "border-transparent"}`}
                    style={{ backgroundColor: color }}
                  >
                    {selectedColor === color && (
                      <Check className="w-4 h-4 mx-auto text-white drop-shadow" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size selector */}
          {product.sizes && (
            <div className="mb-5">
              <p className="text-sm font-semibold mb-2">Size</p>
              <div className="flex gap-2 flex-wrap">
                {product.sizes.map((size: string) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[40px] h-10 px-3 rounded-xl border text-sm font-medium transition-all ${
                      selectedSize === size
                        ? "border-primary bg-primary/10 text-primary"
                        : "hover:border-muted-foreground/40"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mb-5">
            <p className="text-sm font-semibold mb-2">Quantity</p>
            <div className="flex items-center gap-1 border rounded-xl w-fit">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 flex items-center justify-center hover:bg-muted rounded-l-xl transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-10 text-center text-sm font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 flex items-center justify-center hover:bg-muted rounded-r-xl transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Delivery check */}
          <div className="flex items-center gap-2 mb-6">
            <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Enter pincode for delivery info"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              className="h-9 px-3 rounded-lg border bg-transparent text-sm flex-1 max-w-48 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <button className="text-sm text-primary font-medium hover:underline">Check</button>
          </div>

          {/* CTA */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={handleAddToCart}
              className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
            >
              <ShoppingCart className="w-4.5 h-4.5" />
              Add to Cart
            </button>
            <button
              onClick={() => {
                toggle(product.id);
                toast(wishlisted ? "Removed from wishlist" : "Added to wishlist ❤️");
              }}
              className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-all hover:bg-muted ${wishlisted ? "border-red-300 bg-red-50 dark:bg-red-950/20" : ""}`}
            >
              <Heart className={`w-5 h-5 ${wishlisted ? "fill-red-500 text-red-500" : ""}`} />
            </button>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Truck, label: "Free Delivery", sub: "Orders over ₹499" },
              { icon: Shield, label: "Genuine Product", sub: "100% authentic" },
              { icon: RotateCcw, label: "Easy Returns", sub: "7-day returns" },
            ].map((b) => (
              <div
                key={b.label}
                className="flex flex-col items-center text-center p-3 rounded-xl bg-muted/50"
              >
                <b.icon className="w-5 h-5 text-primary mb-1.5" />
                <span className="text-xs font-semibold">{b.label}</span>
                <span className="text-[10px] text-muted-foreground">{b.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-12">
        <div className="flex gap-1 border-b mb-6">
          {(["desc", "specs", "reviews"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px ${
                activeTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "desc"
                ? "Description"
                : tab === "specs"
                  ? "Specifications"
                  : `Reviews (${(product.reviewCount || 0).toLocaleString()})`}
            </button>
          ))}
        </div>

        {activeTab === "desc" && (
          <div className="prose prose-sm max-w-none text-muted-foreground">
            <p>{product.description || "No description available."}</p>
          </div>
        )}

        {activeTab === "specs" && (
          <div className="max-w-lg">
            {product.specifications && Object.keys(product.specifications).length > 0 ? (
              Object.entries(product.specifications).map(([key, val]) => (
                <div key={key} className="flex justify-between py-2.5 border-b last:border-0 text-sm">
                  <span className="text-muted-foreground">{key}</span>
                  <span className="font-medium">{val}</span>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">No specifications available.</p>
            )}
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="space-y-4 max-w-2xl">
            {/* Rating overview */}
            <div className="flex items-center gap-6 p-4 rounded-xl bg-muted/50 mb-6">
              <div className="text-center">
                <div className="text-4xl font-bold font-[var(--font-heading)]">
                  {product.rating}
                </div>
                <div className="flex items-center gap-0.5 mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${i < Math.floor(product.rating) ? "fill-warning text-warning" : "text-muted-foreground/30"}`}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {(product.reviewCount || 0).toLocaleString()} ratings
                </p>
              </div>
              <div className="flex-1 space-y-1.5">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const pct =
                    stars === 5 ? 62 : stars === 4 ? 23 : stars === 3 ? 9 : stars === 2 ? 4 : 2;
                  return (
                    <div key={stars} className="flex items-center gap-2">
                      <span className="text-xs w-4 text-right">{stars}</span>
                      <Star className="w-3 h-3 fill-warning text-warning" />
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-warning"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-8">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {reviews.map((r) => (
              <div key={r.id} className="p-4 rounded-xl border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-0.5 px-2 py-0.5 rounded bg-success/10">
                    <Star className="w-3 h-3 fill-success text-success" />
                    <span className="text-xs font-bold text-success">{r.rating}</span>
                  </div>
                  <span className="text-sm font-semibold">{r.title}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{r.comment}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{r.userName}</span>
                  {r.verified && <span className="text-success">✓ Verified</span>}
                  <span>{r.date}</span>
                  <span>👍 {r.helpful}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-lg font-bold font-[var(--font-heading)] mb-6">Related Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {relatedProducts.map((p: Product, i: number) => (
              <ProductCard key={p.id} Product={p} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
