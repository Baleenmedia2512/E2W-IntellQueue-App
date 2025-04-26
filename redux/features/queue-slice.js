import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  phoneNumber: "",
  language: "en", // Default language
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
    setLanguage: (state, action) => {
      state.language = action.payload;
    },
    resetLanguage: (state) => {
      state.language = "en"; // Reset to default language
    },
  },
});

export const { setPhoneNumber, resetPhoneNumber, setLanguage, resetLanguage } = queueSlice.actions;
export const queueReducer = queueSlice.reducer;
