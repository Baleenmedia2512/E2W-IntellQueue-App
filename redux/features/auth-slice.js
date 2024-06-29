import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userName: "",
  companyName: "",
  appRights: ""
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
    setAppRights: (state, action) => {
      state.appRights = action.payload;
    },
    logout: (state) => {
      state.userName = ""; // Reset userName to an empty string
      state.appRights = "";
    }
  }
});

export const { login, logout, setCompanyName, setAppRights  } = authSlice.actions;
export const authReducer = authSlice.reducer;