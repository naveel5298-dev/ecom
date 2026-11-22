import { Link } from "react-router-dom";
import {  Heart,  ShoppingCart, Star} from "lucide-react";
import { useWishlist } from "@/hooks/use-wishlist";
import {formatPrice, mapApiProduct, type Product} from "@/lib/mock-data";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "@/redux/cartSlice";
import type { AppDispatch, RootState } from "@/redux/store";
import { addtoCartApi} from "@/api/cartApi";


interface Props {
  Product: Product;
  index?: number;
}

export function ProductCard({
 Product,
  index = 0
}: Props) {

  const dispatch = useDispatch<AppDispatch>();

  // const {products} = useSelector((state: RootState) => state.products);
   const products:Product[] = useSelector((state: RootState) => state.products.products);

//    const data = products.map((p:any) => {
//   // return something for each product
//   return {
//     mapApiProduct(p),
//     id: p.id,
//     q:1,
    
  
//   };
// });

  console.log("settttt",products);

  const { toggle, isWishlisted } = useWishlist();

  const wishlisted =
    isWishlisted(Product.id);

  const handleAddToCart = async (
    e: React.MouseEvent
  ) => {

    e.preventDefault();
    e.stopPropagation();
 
    try{
 const cartItems = await addtoCartApi({
  productId: Product.id,
  quantity: 1,});
  console.log("Cart API response:", cartItems);
  console.log("Cart items after API call:", cartItems);
  // dispatch(addToCart(cartItems.data));

 const cartItem = {
  cartItemId: String(cartItems.data.id), // Assuming the API returns the cart item ID
  productId: String(cartItems.data.product.id),

  title: cartItems.data.product.productName,

  image: cartItems.data.product.productImage,

  price: Number(
    cartItems.data.product.productPrice
  ),

  originalPrice: Number(
    cartItems.data.product.productPrice
  ),

  quantity: cartItems.data.quantity,
};

console.log("API Response:", cartItems.data);
console.log("Mapped Cart Item:", cartItem);

dispatch(addToCart(cartItem));  


  // dispatch(
  //     addToCart({
  //       productId: product.id,
  //       title: product.title,
  //       image: product.image,
  //       price: product.price,
  //       originalPrice:
  //         product.originalPrice,
  //       quantity: 1,
  //     })
  //   );
    toast.success(
      "Added to cart!"
    );
    }
    catch(error){
      console.error("Failed to add to cart:", error);
      toast.error("Failed to add to cart. Please try again.");
    }
  };

  const handleWishlist = (
    e: React.MouseEvent
  ) => {

    e.preventDefault();
    e.stopPropagation();

    toggle(Product.id);

    toast(
      wishlisted
        ? "Removed from wishlist"
        : "Added to wishlist ❤️"
    );
  };

  return (

    <motion.div
      initial={{
        opacity: 0,
        y: 16
      }}
      animate={{
        opacity: 1,
        y: 0
      }}
      transition={{
        duration: 0.3,
        delay: index * 0.05
      }}
    >

      <Link
        to={`/products/${Product.id}`}
        className="group block bg-card rounded-2xl border overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
      >

        {/* IMAGE */}
        <div className="relative aspect-square overflow-hidden bg-muted">

          <img
            src={Product.image} 
            alt={Product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* BADGE */}
          {Product.badge && (

            <span className="absolute top-2.5 left-2.5 px-2.5 py-1 text-[10px] font-bold uppercase rounded-lg bg-primary text-primary-foreground shadow-sm">

              {Product.badge}

            </span>
          )}

          {/* DISCOUNT */}
          {Product.discount > 0 && (

            <span className="absolute top-2.5 right-2.5 px-2 py-1 text-[10px] font-bold rounded-lg bg-success text-success-foreground">

              -{Product.discount}%

            </span>
          )}

          {/* WISHLIST */}
          <button
            onClick={handleWishlist}
            className="absolute bottom-2.5 right-2.5 w-9 h-9 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
          >

            <Heart
              className={`w-4 h-4 ${
                wishlisted
                  ? "fill-red-500 text-red-500"
                  : "text-foreground"
              }`}
            />

          </button>
        </div>

        {/* INFO */}
        <div className="p-3.5">

          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1">
            {Product.brand}
          </p>

          <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-snug mb-2 group-hover:text-primary transition-colors">
            {Product.title}
          </h3>

          {/* RATING */}
          <div className="flex items-center gap-1.5 mb-2">

            <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-success/10 text-success">

              <Star className="w-3 h-3 fill-current" />

              <span className="text-xs font-bold">
                {Product.rating}
              </span>

            </div>

            <span className="text-[11px] text-muted-foreground">

              ({Product.reviewCount?.toLocaleString() || 0})

            </span>
          </div>

          {/* PRICE */}
          <div className="flex items-baseline gap-2 mb-3">

            <span className="text-base font-bold text-foreground">

              {formatPrice(Product.productPrice)}

            </span>

          </div>

          {/* CART BUTTON */}
          <button
            onClick={handleAddToCart}
            className="w-full flex items-center justify-center gap-2 h-9 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 active:scale-[0.97] transition-all"
          >

            <ShoppingCart className="w-3.5 h-3.5" />

            Add to Cart

          </button>
        </div>
      </Link>
    </motion.div>
  );
}