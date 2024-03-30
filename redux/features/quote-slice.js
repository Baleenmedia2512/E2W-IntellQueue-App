import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedAdMedium: "",
  selectedAdType: "",
  selectedAdCategory: "",
  selectedEdition: "",
  selectedPosition: "",
  selectedVendor: "",
  selectedSlab: "",
  quantity: 1,
  campaignDuration: "",
  marginAmount: 0,
  marginPercentage: 15,
  extraDiscount: 0,
  Remarks: ""
};

export const quoteSlice = createSlice({
  name: "quote",
  initialState,
  reducers: {
    setQuotesData: (state, action) => {
      return { ...state, ...action.payload };
    },
    resetQuotesData: (state) => {
        return initialState;
    },
  }
});

export const { setQuotesData, resetQuotesData } = quoteSlice.actions;
export const quoteReducer = quoteSlice.reducer;