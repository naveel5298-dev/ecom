import { createSlice, PayloadAction } from "@reduxjs/toolkit";

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

export interface CartItem {
  cartItemId: string; // Required cart item ID from backend
  productId: string;
  title: string;
  image: string;
  price: number;
  originalPrice: number;
  quantity: number;
  size?: string;
  color?: string;
}


interface CartState {
  items: CartItem[];
  loading: boolean;
  error: string | null;
}

const initialState: CartState = {
  items: [],
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: "cart",

  initialState,

  reducers: {

    setCartItems: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
      state.loading = false;
      state.error = null;
    },


    addToCart: (state, action: PayloadAction<CartItem>) => {
      //console.log("Adding to cart:", action.payload);

      const existingItem = state.items.find(
        item => item.productId === action.payload.productId
        
      );

      if (existingItem) {

        existingItem.quantity += 1;

      } else {

        // state.items.push({
        //   ...action.payload,
        //   quantity: 1,
        // });
        state.items.push({
          ...action.payload,
        });
      }
    },

    removeFromCart: (state, action: PayloadAction<string>) => {

      state.items = state.items.filter(
        item => item.cartItemId !== action.payload
      );
    },

    updateQuantity: (state, action: PayloadAction<{ cartItemId: string; action: string }>) => {
      const item = state.items.find(
        item => item.cartItemId === action.payload.cartItemId
      );
      if (item) {
        if (action.payload.action === "increment") {
          item.quantity += 1;
        } else {
          item.quantity -= 1;
        }
      }
    },


    // incrementQuantity: (state, action: PayloadAction<string>) => {

    //   const item = state.items.find(
    //     item => item.productId === action.payload
    //   );

    //   if (item) {
    //     item.quantity += 1;
    //   }
    // },

    // decrementQuantity: (state, action: PayloadAction<string>) => {

    //   const item = state.items.find(
    //     item => item.productId === action.payload
    //   );

    //   if (item && item.quantity > 1) {
    //     item.quantity -= 1;
    //   }
    // },
  },






});

export const {
  setCartItems,
  addToCart,
  removeFromCart,
  updateQuantity,
  // incrementQuantity,
  // decrementQuantity,
} = cartSlice.actions;

export default cartSlice.reducer;