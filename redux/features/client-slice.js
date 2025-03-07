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
  consultantId: "",
  consultantName: "",
  consultantNumber: "",
  clientID: "",
  clientContactPerson: "",
  clientGender: "",
  clientMonths: "",
  displayClientNumber: "",
  displayClientName: "",
  displayClientID: "",
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