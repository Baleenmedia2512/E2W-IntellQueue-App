import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  clientName: "",
  clientContact: "",
  clientEmail: "",
  clientSource: "",
  clientAge: "",
  clientDOB: new Date(),
  clientTitle: "",
  clientAddress: "",
  clientGST: "",
  clientPAN: "",
  consultantName: "",
  consultantNumber: ""

};

export const clientSlice = createSlice({
  name: "client",
  initialState,
  reducers: {
    setClientData: (state, action) => {
      return { ...state, ...action.payload };
    },
    resetClientData: (state) => {
        return initialState;
    }
  }
});

export const { setClientData, resetClientData } = clientSlice.actions;
export const clientReducer = clientSlice.reducer;