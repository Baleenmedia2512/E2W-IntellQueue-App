import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  phoneNumber: "",
  language: "en", // Default language
  queueStatus: "", // Add queueStatus to state
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
    setQueueStatus: (state, action) => {
      state.queueStatus = action.payload;
    },
    resetQueueStatus: (state) => {
      state.queueStatus = "";
    },
  },
});

export const { setPhoneNumber, resetPhoneNumber, setLanguage, resetLanguage, setQueueStatus, resetQueueStatus } = queueSlice.actions;
export const queueReducer = queueSlice.reducer;
