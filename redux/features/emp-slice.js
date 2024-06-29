import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  generalDetails: {
    firstName: "",
    lastName: "",
    dob: "",
    gender: "",
    email: "",
    phone: ""
  },
  proofDetails: {
    pan: "",
    aadhar: "",
    passport: ""
  },
  rolesGoals: {
    role: "",
    department: "",
    goals: ""
  },
  loginCredentials: {
    username: "",
    password: ""
  },
  currentPage: "generalDetails",
  isRegistered: false
};

export const employeeSlice = createSlice({
  name: "employee",
  initialState,
  reducers: {
    setGeneralDetails: (state, action) => {
      state.generalDetails = { ...state.generalDetails, ...action.payload };
    },
    setProofDetails: (state, action) => {
      state.proofDetails = { ...state.proofDetails, ...action.payload };
    },
    setRolesGoals: (state, action) => {
      state.rolesGoals = { ...state.rolesGoals, ...action.payload };
    },
    setLoginCredentials: (state, action) => {
      state.loginCredentials = { ...state.loginCredentials, ...action.payload };
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    resetEmployeeData: () => {
      return initialState;
    },
    setIsRegistered: (state, action) => {
      state.isRegistered = action.payload;
    }
  }
});

export const {
  setGeneralDetails,
  setProofDetails,
  setRolesGoals,
  setLoginCredentials,
  setCurrentPage,
  resetEmployeeData,
  setIsRegistered
} = employeeSlice.actions;

export const employeeReducer = employeeSlice.reducer;
