import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  cart: [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItemsToCart: (state, action) => {
      state.cart = [...state.cart, ...action.payload];
    },
    removeItem: (state, action) => {
      const index = action.payload;
      state.cart = state.cart.filter(item => item.index !== index);
    },
    resetCartItem: (state) => {
      return initialState
    }
  },
});

export const { addItemsToCart, removeItem, resetCartItem } = cartSlice.actions;
export const cartReducer = cartSlice.reducer;