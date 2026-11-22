import type { Product } from "@/lib/mock-data";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";





interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;
}

const initialState: ProductState = {
  products: [],
  loading: false,
  error: null,
};

const productSlice = createSlice({
  name: "products",

  initialState,

  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.products = action.payload;
      state.loading = false;
      state.error = null;
    },

    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },

    clearProducts: (state) => {
      state.products = [];
    },
  },
});

export const {
  setLoading,
  setProducts,
  setError,
  clearProducts,
} = productSlice.actions;

export default productSlice.reducer;