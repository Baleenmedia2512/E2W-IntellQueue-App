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
  },
});

export const { addItemsToCart } = cartSlice.actions;
export default cartReducer = cartSlice.reducer;