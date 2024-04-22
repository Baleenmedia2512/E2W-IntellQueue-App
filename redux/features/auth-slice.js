import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userName: ""
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      state.userName = action.payload;
    },
    logout: (state) => {
      state.userName = ""; // Reset userName to an empty string
    }
  }
});

export const { login, logout } = authSlice.actions;
export const authReducer = authSlice.reducer;