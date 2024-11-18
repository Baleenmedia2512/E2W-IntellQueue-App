import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  cart: [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItemsToCart: (state, action) => {
      action.payload.forEach(newItem => {
        const existingIndex = state.cart.findIndex(item => item.index === newItem.index);
        if (existingIndex !== -1) {
          // Update the existing item
          state.cart[existingIndex] = { ...state.cart[existingIndex], ...newItem };
        } else {
          // Add as a new item if not found, and assign a unique index
          newItem.index = state.cart.length; // Set index to be unique
          state.cart.push(newItem);
        }
      });
    },
    removeEditItem: (state, action) => {
      const index = action.payload;

      const existingIndex = state.cart.findIndex(item => item.index === index);
      if (existingIndex !== -1) {
        // Mark the item as removed if it exists
        state.cart[existingIndex] = {
          ...state.cart[existingIndex],
          isCartRemoved: true,
        };
      }
    },
    removeItem: (state, action) => {
      const index = action.payload;
      state.cart = state.cart.filter(item => item.index !== index);
    },
    resetCartItem: (state) => {
      return initialState;
    }
  },
});

export const { addItemsToCart, removeItem, removeEditItem, resetCartItem } = cartSlice.actions;
export const cartReducer = cartSlice.reducer;
