import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedAdMedium: "",
  selectedAdType: "",
  selectedAdCategory: "",
  selectedEdition: "",
  selectedPosition: "",
  selectedVendor: {label: "", value: ""},
  selectedSlab: "",
  quantity: 1,
  width: 1,
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
  currentPage: "adDetails",
  validRates: [],
  isDetails: false,
  previousPage: '',
  history: [],
  rateGST: "",
  qtySlab: {
    Qty: 1,
    Width: 1
  },
  isEditMode: false,
  editIndex: '',
  editQuoteNumber: 0,
  isNewCartOnEdit: false,
  checked: {
    bold: false,
    semibold: false,
    color: false,
    tick: false,
    boldPercentage: -1,
    semiboldPercentage: -1,
    colorPercentage: -1,
    tickPercentage: -1
  }
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
    setQtySlab: (state, action) => {
      state.qtySlab.Qty = action.payload.Qty;
      state.qtySlab.Width = action.payload.Width;
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
      } else if(state.history.length === 0)
      {
        state.currentPage = "adMedium";
      }else {
        state = initialState; // Default to adMedium if no history is available
      }
      // Do not return anything here. Just modify the state directly.
    },
    updateCheckedItem: (state, action) => {
      const { key, value } = action.payload; // Destructure key and value from the action payload
      if (state.checked.hasOwnProperty(key)) {
        state.checked[key] = value; // Update the checked property
      }
    },
}
});

export const { setQuotesData, resetQuotesData, addValidRates, removeValidRates, goBack, updateCurrentPage, setQtySlab } = quoteSlice.actions;
export const quoteReducer = quoteSlice.reducer;