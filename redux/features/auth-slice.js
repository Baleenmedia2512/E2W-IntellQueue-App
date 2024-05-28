import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userName: "",
  companyName: ""
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      state.userName = action.payload;
    },
    setCompanyName: (state, action) => {
      state.companyName = action.payload;
    },
    logout: (state) => {
      state.userName = ""; // Reset userName to an empty string
    }
  }
});

export const { login, logout, setCompanyName } = authSlice.actions;
export const authReducer = authSlice.reducer;