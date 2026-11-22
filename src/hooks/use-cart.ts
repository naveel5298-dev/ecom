// import { useState, useCallback, useEffect } from "react";

// export interface CartItem {
//   productId: string;
//   title: string;
//   image: string;
//   price: number;
//   originalPrice: number;
//   quantity: number;
//   size?: string;
//   color?: string;
// }

// // Simple in-memory cart store with event emitter pattern
// let cartItems: CartItem[] = [];
// const listeners = new Set<() => void>();

// function emit() {
//   listeners.forEach((l) => l());
// }

// export function useCart() {
//   const [, rerender] = useState(0);

//   useEffect(() => {
//     const cb = () => rerender((n) => n + 1);
//     listeners.add(cb);
//     return () => {
//       listeners.delete(cb);
//     };
//   }, []);

//   const addToCart = useCallback((item: Omit<CartItem, "quantity">) => {
//     const existing = cartItems.find(
//       (i) => i.productId === item.productId && i.size === item.size && i.color === item.color,
//     );
//     if (existing) {
//       existing.quantity += 1;
//     } else {
//       cartItems.push({ ...item, quantity: 1 });
//     }
//     cartItems = [...cartItems];
//     emit();
//   }, []);

//   const removeFromCart = useCallback((productId: string) => {
//     cartItems = cartItems.filter((i) => i.productId !== productId);
//     emit();
//   }, []);

//   const updateQuantity = useCallback(
//     (productId: string, quantity: number) => {
//       if (quantity <= 0) {
//         removeFromCart(productId);
//         return;
//       }
//       cartItems = cartItems.map((i) => (i.productId === productId ? { ...i, quantity } : i));
//       emit();
//     },
//     [removeFromCart],
//   );

//   const clearCart = useCallback(() => {
//     cartItems = [];
//     emit();
//   }, []);

//   const totalItems = cartItems.reduce((sum, i) => sum + i.quantity, 0);
//   const totalPrice = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
//   const totalSavings = cartItems.reduce(
//     (sum, i) => sum + (i.originalPrice - i.price) * i.quantity,
//     0,
//   );

//   return {
//     items: cartItems,
//     addToCart,
//     removeFromCart,
//     updateQuantity,
//     clearCart,
//     totalItems,
//     totalPrice,
//     totalSavings,
//   };
// }
