import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  clickCount: 0,
};

export const countSlice = createSlice({
  name: 'count',
  initialState,
  reducers: {
    incrementCount: (state) => {
      state.clickCount += 1;
    },
    resetCount: (state) => {
      state.clickCount = 0;
    },
    // Optional: setCount if you want to set a specific number
    setCount: (state, action) => {
      state.clickCount = action.payload;
    },
  },
});

export const { incrementCount, resetCount, setCount } = countSlice.actions;
export const countReducer = countSlice.reducer;
