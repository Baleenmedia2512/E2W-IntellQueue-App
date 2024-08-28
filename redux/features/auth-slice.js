import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userName: "",
  companyName: "",
  appRights: "",
  dbName: ""
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
    },
    setDBName: (state, action) => {
      state.dbName = action.payload;
    }
  }
});

export const { login, logout, setCompanyName, setAppRights, setDBName  } = authSlice.actions;
export const authReducer = authSlice.reducer;