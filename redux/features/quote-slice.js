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
  ratePerUnit: 0,
  unit: "",
  rateId: 0,
  validityDate: "",
  minimumUnit: 0,
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
      state.validRates.push(action.payload);
    },
    removeValidRates: (state, action) => {
      state.validRates = []
    }
  }
});

export const { setQuotesData, resetQuotesData, addValidRates, removeValidRates } = quoteSlice.actions;
export const quoteReducer = quoteSlice.reducer;