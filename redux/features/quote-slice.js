import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedAdMedium: "",
  selectedAdType: "",
  selectedAdCategory: "",
  selectedEdition: null,
  selectedPosition: "",
  selectedVendor: "",
  selectedSlab: "",
  quantity: 1,
  campaignDuration: "",
  marginAmount: 0,
  marginPercentage: 15,
  extraDiscount: 0,
  Remarks: "",
  currentPage: "",
  validRates: []
};

export const quoteSlice = createSlice({
  name: "quote",
  initialState,
  reducers: {
    setQuotesData: (state, action) => {
      return { ...state, ...action.payload };
    },
    resetQuotesData: () => {
        return initialState;
    },
    addValidRates: (state, action) => {
      state.validRates = [...state.validRates, action.payload];
    }
  }
});

export const { setQuotesData, resetQuotesData } = quoteSlice.actions;
export const quoteReducer = quoteSlice.reducer;