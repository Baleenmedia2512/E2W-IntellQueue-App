import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  quoteClickCount: 0,
};

export const countSlice = createSlice({
  name: 'count',
  initialState,
  reducers: {
    quoteIncrementCount: (state) => {
      state.quoteClickCount += 1;
    },
    resetCount: (state) => {
      state.quoteClickCount = 0;
    },
    // Optional: setCount if you want to set a specific number
    setCount: (state, action) => {
      state.quoteClickCount = action.payload;
    },
  },
});

export const { quoteIncrementCount, resetCount, setCount } = countSlice.actions;
export const countReducer = countSlice.reducer;
