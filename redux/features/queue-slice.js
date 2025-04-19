import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  phoneNumber: "",
};

export const queueSlice = createSlice({
  name: "queue",
  initialState,
  reducers: {
    setPhoneNumber: (state, action) => {
      state.phoneNumber = action.payload;
    },
    resetPhoneNumber: (state) => {
      state.phoneNumber = "";
    },
  },
});

export const { setPhoneNumber, resetPhoneNumber } = queueSlice.actions;
export const queueReducer = queueSlice.reducer;
