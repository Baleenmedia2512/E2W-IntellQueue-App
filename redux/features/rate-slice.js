import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedValues: {
    rateName: "",
    typeOfAd: "",
    adType: "",
    Location: "",
    vendorName: "",
    Package: ""
  },
  selectedVendor: "",
  selectedSlab: "",
  qty: 1,
  unitPrice: 0,
  selectedUnit: "",
  rateId: "",
  validityDate: "",
  leadDays: "",
  minimumUnit: 0,
  campaignDuration: "",
  marginAmount: 0,
  extraDiscount: 0,
  remarks: "",
  currentPage: "",
  validRates: [],
  isDetails: false
};

export const rateSlice = createSlice({
  name: "rate",
  initialState,
  reducers: {
    setRatesData: (state, action) => {
      return { ...state, ...action.payload };
    },
    resetRatesData: () => {
        return initialState;
    },
    setSelectedValues: (state, action) => {
      state.selectedValues = { ...state.selectedValues, ...action.payload };
    },
    setRateId: (state, action) => {
      state.rateId = action.payload
    },
    setSelectedUnit: (state, action) => {
      state.selectedUnit = action.payload
    },
    setQty: (state, action) => {
      state.qty = action.payload
    },
    setUnitPrice: (state, action) => {
      state.unitPrice = action.payload
    }
  }
});

export const { setRatesData, resetRatesData, setSelectedValues, setRateId, setSelectedUnit, setQty, setUnitPrice } = rateSlice.actions;
export const rateReducer = rateSlice.reducer;