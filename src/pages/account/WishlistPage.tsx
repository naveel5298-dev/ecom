import { useState, useEffect } from "react";
import { Heart, ShoppingCart, Trash2, RotateCcw, Package } from "lucide-react";
import { useWishlist } from "@/hooks/use-wishlist";
import { mockReturns, formatPrice, mapApiProduct } from "@/lib/mock-data";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "@/redux/cartSlice";
import type { RootState, AppDispatch } from "@/redux/store";
import { addtoCartApi } from "@/api/cartApi";
import { setProducts, setLoading } from "@/redux/productSlice";
import { getProductsApi } from "@/api/productApi";

const returnStatusColor = {
  Initiated: "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20",
  "Picked Up": "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
  "Refund Processing": "text-orange-600 bg-orange-50 dark:bg-orange-900/20",
  Refunded: "text-green-600 bg-green-50 dark:bg-green-900/20",
} as const;

export function WishlistPage() {
  const [tab, setTab] = useState<"wishlist" | "returns">("wishlist");
  const { wishlistIds, toggle } = useWishlist();
  const dispatch = useDispatch<AppDispatch>();
  const { products } = useSelector((state: RootState) => state.products);

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
          dispatch(setProducts(apiProducts));
        } catch (err) {
          console.error("Failed to fetch products:", err);
        }
      };
      fetchProducts();
    }
  }, [dispatch, products.length]);

  const wishlistProducts = products.filter((p: any) => wishlistIds.has(p.id));

  const handleMoveToCart = async (p: any) => {
    try {
      const response = await addtoCartApi({
        productId: p.id,
        quantity: 1,
      });

      const cartItem = {
        cartItemId: String(response.data?.id || p.id),
        productId: String(p.id),
        title: p.title,
        image: p.image,
        price: p.price || p.productPrice,
        originalPrice: p.originalPrice,
        quantity: 1,
      };
      dispatch(addToCart(cartItem));
      toast.success("Moved to cart");
    } catch (err) {
      console.error("Failed to move to cart:", err);
      toast.error("Failed to move to cart");
    }
  };

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab("wishlist")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border transition-colors ${tab === "wishlist" ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground"}`}
        >
          <Heart className="w-3.5 h-3.5" /> Wishlist ({wishlistIds.size})
        </button>
        <button
          onClick={() => setTab("returns")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border transition-colors ${tab === "returns" ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground"}`}
        >
          <RotateCcw className="w-3.5 h-3.5" /> Returns ({mockReturns.length})
        </button>
      </div>

      {tab === "wishlist" ? (
        wishlistProducts.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Heart className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Your wishlist is empty</p>
            <p className="text-xs mt-1">Browse products and tap the heart icon to save them here</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {wishlistProducts.map((p: any) => (
              <div key={p.id} className="bg-card rounded-2xl border p-4 flex gap-4">
                <img
                  src={p.image}
                  alt={p.title}
                  className="w-20 h-20 rounded-xl object-cover bg-muted shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{p.title}</div>
                  <div className="text-xs text-muted-foreground">{p.brand}</div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-sm font-bold">{formatPrice(p.price || p.productPrice)}</span>
                    <span className="text-xs text-muted-foreground line-through">
                      {formatPrice(p.originalPrice)}
                    </span>
                    <span className="text-xs font-semibold text-green-600">{p.discount}% off</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleMoveToCart(p)}
                      className="flex items-center gap-1 h-7 px-3 rounded-lg bg-primary text-primary-foreground text-[11px] font-semibold hover:bg-primary/90 transition-colors"
                    >
                      <ShoppingCart className="w-3 h-3" /> Move to Cart
                    </button>
                    <button
                      onClick={() => {
                        toggle(p.id);
                        toast.success("Removed from wishlist");
                      }}
                      className="flex items-center gap-1 h-7 px-3 rounded-lg border text-[11px] font-medium text-muted-foreground hover:text-destructive hover:border-destructive transition-colors"
                    >
                      <Trash2 className="w-3 h-3" /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : mockReturns.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No return requests</p>
        </div>
      ) : (
        <div className="space-y-4">
          {mockReturns.map((ret) => (
            <div key={ret.id} className="bg-card rounded-2xl border p-5">
              <div className="flex items-start gap-4">
                <img
                  src={ret.image}
                  alt={ret.productTitle}
                  className="w-16 h-16 rounded-xl object-cover bg-muted shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-medium">{ret.productTitle}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Order: {ret.orderId}
                      </div>
                    </div>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${returnStatusColor[ret.status]}`}
                    >
                      {ret.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>Reason: {ret.reason}</span>
                    <span>•</span>
                    <span>
                      {new Date(ret.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="mt-2 text-sm font-semibold">
                    Refund: {formatPrice(ret.refundAmount)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
