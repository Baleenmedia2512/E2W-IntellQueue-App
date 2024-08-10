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
  ratePerUnit: 0,
  unit: "",
  rateId: 0,
  validityDate: "",
  leadDays: "",
  minimumUnit: 0,
  campaignDuration: "",
  marginAmount: 0,
  extraDiscount: 0,
  remarks: "",
  currentPage: "adMedium",
  validRates: [],
  isDetails: false,
  previousPage: '',
  history: []
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
    },
    updateCurrentPage: (state, action) => {
      state.history.push(state.currentPage); // Add current page to history before updating
      state.currentPage = action.payload; // Update to the new page
    },
    goBack: (state) => {
      if (state.history.length > 0) {
        const previousPage = state.history.pop(); // Get the last entry in history
        state.currentPage = previousPage; // Update the current page
        state.previousPage = state.history.length > 0 ? state.history[state.history.length - 1] : ""
      } else {
        state = initialState; // Default to adMedium if no history is available
      }
      // Do not return anything here. Just modify the state directly.
    },
}
});

export const { setQuotesData, resetQuotesData, addValidRates, removeValidRates, goBack, updateCurrentPage } = quoteSlice.actions;
export const quoteReducer = quoteSlice.reducer;