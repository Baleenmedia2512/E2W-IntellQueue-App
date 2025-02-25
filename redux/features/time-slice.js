import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  timeElapsed: 0,
};

export const timeSlice = createSlice({
  name: 'time',
  initialState,
  reducers: {
    setTimeElapsed: (state, action) => {
      state.timeElapsed = action.payload;
    },
    resetTime: (state) => {
      state.timeElapsed = 0;
    },
  },
});

export const { setTimeElapsed, resetTime } = timeSlice.actions;
export const timeReducer = timeSlice.reducer;
