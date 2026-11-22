import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { SlidersHorizontal, Grid3X3, List, Star, X } from "lucide-react";
import {  useDispatch,  useSelector} from "react-redux";
import {  ProductCard} from "@/components/product-card";
import { categories, mapApiProduct } from "@/lib/mock-data";
import { setError, setLoading, setProducts} from "@/redux/productSlice";
import type { RootState, AppDispatch } from "@/redux/store";
import { getProductsApi } from "@/api/productApi";



export function ProductsPage() {

  const dispatch =
    useDispatch<AppDispatch>();

  const { products, loading, error} = useSelector(
    (state: RootState) =>
      state.products
  );
  console.log(products);

useEffect(() => {
  const fetchProducts = async () => {
    try {
      dispatch(setLoading(true));

      const response = await getProductsApi();
  console.log("ressss",response);

      const apiProducts = (response.data?.items || response.data || []).map(
        (item: any) => mapApiProduct(item)
      );

      // Merge seller-listed products from localStorage
      const sellerProducts = JSON.parse(localStorage.getItem("sellerProducts") || "[]");
      dispatch(setProducts([...apiProducts, ...sellerProducts]));
    } catch (error) {
      // Even if API fails, still show seller products
      const sellerProducts = JSON.parse(localStorage.getItem("sellerProducts") || "[]");
      if (sellerProducts.length > 0) {
        dispatch(setProducts(sellerProducts));
      } else {
        dispatch(setError("Failed to fetch products"));
      }
    }
  };

  fetchProducts();
}, [dispatch]);



  // useEffect(() => {

  //   dispatch(setProducts([]));

  // }, [dispatch]);

  const [searchParams] =
    useSearchParams();

  const category =
    searchParams.get("category")
    || undefined;

  const sort =
    searchParams.get("sort")
    || undefined;

  const [gridView,
    setGridView] =
    useState(true);

  const [showFilters,
    setShowFilters] =
    useState(false);

  const [selectedRating,
    setSelectedRating] =
    useState(0);

  const [selectedCategory,
    setSelectedCategory] =
    useState(category || "");

  // FILTER PRODUCTS
  let filtered = [...products];

  if (selectedCategory) {

    filtered =
      filtered.filter(

        (p: any) =>
          p.category ===
          selectedCategory
      );
  }

  if (selectedRating) {

    filtered =
      filtered.filter(

        (p: any) =>
          p.rating >=
          selectedRating
      );
  }

  // SORT PRODUCTS
  if (sort === "price-low") {

    filtered.sort(
      (a: any, b: any) =>
        a.price - b.price
    );

  } else if (
    sort === "price-high"
  ) {

    filtered.sort(
      (a: any, b: any) =>
        b.price - a.price
    );

  } else if (
    sort === "rating"
  ) {

    filtered.sort(
      (a: any, b: any) =>
        b.rating - a.rating
    );
  }

  // LOADING
  if (loading) {

    return (

      <div className="text-center py-20">

        Loading products...

      </div>
    );
  }

  // ERROR
  if (error) {

    return (

      <div className="text-center py-20 text-red-500">

        {error}

      </div>
    );
  }

  return (

    <div className="max-w-7xl mx-auto px-4 py-6">

      {/* TOOLBAR */}
      <div className="flex items-center justify-between mb-6">

        <h1 className="text-2xl font-bold">

          Products

        </h1>

        <div className="flex items-center gap-2">

          <button
            onClick={() =>
              setGridView(true)
            }
          >

            <Grid3X3 />

          </button>

          <button
            onClick={() =>
              setGridView(false)
            }
          >

            <List />

          </button>
        </div>
      </div>

      {/* PRODUCTS */}
      <div

        className={

          gridView

            ? "grid grid-cols-2 lg:grid-cols-4 gap-4"

            : "space-y-4"
        }
      >

        {filtered.map(

          (product: any,
           index: number) => (

            <ProductCard

              key={product.id}

              Product={product}

              index={index}
            />
          )
        )}
      </div>
    </div>
  );
}