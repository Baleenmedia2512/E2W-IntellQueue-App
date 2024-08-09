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
  clientPAN: "",
  isOrderExist: false,
  clientID: "",
  nextRateWiseOrderNumber: "",
  orderNumber: "",
  isOrderUpdate: false
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
    },
    setIsOrderExist: (state, action) => {
      state.isOrderExist = action.payload;
    },
    setIsOrderUpdate: (state, action) => {
      state.isOrderUpdate = action.payload;
    },
  }
});

export const { setOrderData, resetOrderData, setIsOrderExist, setIsOrderUpdate} = orderSlice.actions;
export const orderReducer = orderSlice.reducer;
