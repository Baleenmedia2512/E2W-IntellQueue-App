import { createSlice } from "@reduxjs/toolkit";
// MP-100
const initialState = {
  clientName: "",
  clientNumber: "",
  maxOrderNumber: "",
  marginAmount: "",
  marginPercentage: "",
  releaseDates: [],
  remarks: "",
  clientEmail: "",
  clientSource: "",
  receivable: "",
  address: '',
  consultantName: '',
  clientContactPerson: "",
  clientGST: "",
  clientPAN: ""
};

export const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    setOrderData: (state, action) => {
      return { ...state, ...action.payload };
    },
    resetOrderData: (state) => {
        return initialState;
    }
  }
});

export const { setOrderData, resetOrderData} = orderSlice.actions;
export const orderReducer = orderSlice.reducer;
