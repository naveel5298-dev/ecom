import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import { mapApiProduct } from "@/lib/mock-data";
import { ProductCard } from "@/components/product-card";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/redux/store";
import { setProducts, setLoading } from "@/redux/productSlice";
import { getProductsApi } from "@/api/productApi";

export function SearchPage() {
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

  const [query, setQuery] = useState("");
  const results =
    query.length >= 2
      ? products.filter(
          (p: any) =>
            (p.title || "").toLowerCase().includes(query.toLowerCase()) ||
            (p.brand || "").toLowerCase().includes(query.toLowerCase()),
        )
      : [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="max-w-xl mx-auto mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search for products, brands..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full h-12 pl-12 pr-4 rounded-2xl border bg-card text-base focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>
      {query.length < 2 ? (
        <div className="text-center py-12">
          <Search className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">Start typing to search products</p>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {["Headphones", "Shirts", "Smartwatch", "Shoes"].map((t) => (
              <button
                key={t}
                onClick={() => setQuery(t)}
                className="px-4 py-1.5 rounded-full bg-muted text-sm hover:bg-primary/10 hover:text-primary transition-colors"
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">🔍</div>
          <p className="font-semibold">No results for "{query}"</p>
          <p className="text-sm text-muted-foreground mt-1">Try different keywords</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            {results.length} results for "{query}"
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {results.map((p: any, i: number) => (
              <ProductCard key={p.id} Product={p} index={i} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
