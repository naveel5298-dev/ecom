import { Link } from "react-router-dom";

import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag } from "lucide-react";

import { useDispatch, useSelector } from "react-redux";
import { removeFromCart, setCartItems, updateQuantity } from "@/redux/cartSlice";

import type { RootState, AppDispatch } from "@/redux/store";
import { mapApiProduct } from "@/lib/mock-data";
import { ProductCard } from "@/components/product-card";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getCartItemsApi, removeFromCartApi, updateCartQuantityApi } from "@/api/cartApi";
import { getProductsApi } from "@/api/productApi";
import { setProducts, setLoading } from "@/redux/productSlice";



export function CartPage() {

  const dispatch =
    useDispatch<AppDispatch>();

  const items = useSelector(
    (state: RootState) =>
      state.cart.items
  );

  console.log("Cart State:", items);

  useEffect(() => {
    const loadCart = async () => {
      const response = await getCartItemsApi();
      console.log(response.data[0]);
      const cartItems = response.data.map(

        (item: any) => ({
          cartItemId: String(item.id),
          productId: String(item.product.id),

          title:
            item.product.productName,

          image:
            item.product.productImage,

          price: Number(
            item.product.productPrice
          ),

          originalPrice: Number(
            item.product.originalPrice ??
            item.product.productPrice
          ),

          quantity: item.quantity,
        })
      );
      console.log("Mapped Cart Itemsssss:", cartItems);

      dispatch(
        setCartItems(cartItems)
      );

    };

    loadCart();
  }, [dispatch]);


  const handleRemoveFromCart = async (cartItemId: string) => {
    try {
      const item = await removeFromCartApi(cartItemId);

      dispatch(removeFromCart(cartItemId));
      console.log("Item removed from cart:", item);
      toast.success("Item removed");
    }
    catch (error) {
      console.error("Error removing item from cart:", error);
      toast.error("An error occurred while removing the item");
    }

  };

  const handleUpdateQuantity = async (cartItemId: string, action: string) => {


    try {
      const response = await updateCartQuantityApi(cartItemId, action);
      console.log("Response:", response);
      console.log("Cart Item ID and Action:", cartItemId, action);
      console.log("Success:", response.success);
      if (response.success) {

        // const cartResponse =
        //   await getCartItemsApi();
        // console.log("Refetched Cart:", cartResponse);
        // const cartItems =
        //   cartResponse.data.map(
        //     (item: any) => ({
        //       cartItemId: String(
        //         item.id
        //       ),
        //       productId: String(
        //         item.product.id
        //       ),
        //       title:
        //         item.product.productName,
        //       image:
        //         item.product.productImage,
        //       price: Number(
        //         item.product.productPrice
        //       ),
        //       originalPrice: Number(
        //         item.product.productPrice
        //       ),
        //       quantity: item.quantity,
        //     })
        //   );

        dispatch(updateQuantity({ cartItemId, action }));

        // dispatch(
        //   setCartItems(cartItems)
        // );
        toast.success("Quantity updated");



      } else {
        toast.error("Failed to update quantity");
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("An error occurred while updating quantity");
    }
  };



  const { products } = useSelector(
    (state: RootState) =>
      state.products
  );

  // Fetch products for recommendations if not loaded yet
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
          console.error("Failed to fetch products for recommendations:", err);
        }
      };
      fetchProducts();
    }
  }, [dispatch, products.length]);

  const recommended = products.slice(0, 4);

  const [coupon, setCoupon] = useState("");

  const totalItems =
    items.reduce(

      (total, item) =>
        total + item.quantity,

      0
    );

  const totalPrice =
    items.reduce(

      (total, item) =>

        total +
        item.price * item.quantity,

      0
    );

  const totalOriginalPrice = totalPrice + 1000; // Assuming a fixed original price for demonstration

  const totalSavings =
    items.reduce(

      (total, item) =>

        total +

        (
          (item.originalPrice
            - item.price)

          * item.quantity
        ),

      totalOriginalPrice - totalPrice
    );

  const deliveryFee =
    totalPrice >= 499 ? 0 : 49;

  const token =
    localStorage.getItem("token");

  if (items.length === 0) {

    return (

      <div className="max-w-7xl mx-auto px-4 py-16 text-center">

        <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground/40 mb-4" />

        <h2 className="text-xl font-bold mb-2">
          Your cart is empty
        </h2>

        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground"
        >

          Start Shopping

        </Link>

      </div>
    );
  }

  return (

    <div className="max-w-7xl mx-auto px-4 py-6">

      <h1 className="text-2xl font-bold mb-6">

        Shopping Cart
        ({totalItems} items)

      </h1>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* ITEMS */}
        <div className="lg:col-span-2 space-y-3">

          <AnimatePresence>

            {items.map((item) => (


              <motion.div
                key={item.productId}
                layout
                className="flex gap-4 p-4 rounded-2xl bg-card border"
              >

                <img
                  src={item.image}
                  alt={item.title}
                  className="w-24 h-24 rounded-xl object-cover"
                />

                <div className="flex-1">

                  <h3 className="font-semibold">

                    {item.title}

                  </h3>

                  <p className="font-bold mt-1">

                    {item.price}

                  </p>

                  {/* QUANTITY */}
                  <div className="flex items-center gap-3 mt-3">

                    <div className="flex items-center border rounded-lg">

                      <button
                        onClick={() =>
                          handleUpdateQuantity(
                            item.cartItemId,
                            "decrement"
                          )
                        }
                        className="w-8 h-8 flex items-center justify-center"
                      >

                        <Minus className="w-3 h-3" />

                      </button>

                      <span className="w-8 text-center">

                        {item.quantity}

                      </span>

                      <button
                        onClick={() =>
                          handleUpdateQuantity(
                            item.cartItemId,
                            "increment"
                          )
                        }
                        className="w-8 h-8 flex items-center justify-center"
                      >

                        <Plus className="w-3 h-3" />

                      </button>
                    </div>

                    {/* REMOVE */}
                    <button
                      onClick={() => handleRemoveFromCart(item.cartItemId)}
                    >

                      <Trash2 className="w-4 h-4 text-destructive" />

                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* SUMMARY */}
        <div>

          <div className="bg-card rounded-2xl border p-5 sticky top-24">

            <h3 className="font-bold mb-4">

              Price Details

            </h3>

            <div className="space-y-2">

              <div className="flex justify-between">

                <span>
                  Subtotal
                </span>

                <span>
                  {totalPrice}
                </span>

              </div>

              <div className="flex justify-between">

                <span>
                  Savings
                </span>

                <span className="text-green-600">

                  -{totalSavings}

                </span>

              </div>

              <div className="flex justify-between">

                <span>
                  Delivery
                </span>

                <span>

                  {
                    deliveryFee === 0
                      ? "FREE"
                      : deliveryFee
                  }

                </span>

              </div>

              <div className="border-t pt-3 flex justify-between font-bold text-lg">

                <span>Total</span>

                <span>

                  {
                    totalPrice + deliveryFee
                  }

                </span>
              </div>
            </div>

            {/* CHECKOUT */}
            <Link
              to={
                token
                  ? "/checkout"
                  : "/login"
              }
              className="mt-5 w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2"
            >

              Proceed to Checkout

              <ArrowRight className="w-4 h-4" />

            </Link>
          </div>
        </div>
      </div>

      {/* RECOMMENDED */}
      <div className="mt-12">

        <h2 className="text-lg font-bold mb-6">

          You may also like

        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">

          {recommended.map((p, i) => (

            <ProductCard
              key={p.id}
              Product={p}
              index={i}
            />
          ))}

        </div>
      </div>
    </div>
  );
}