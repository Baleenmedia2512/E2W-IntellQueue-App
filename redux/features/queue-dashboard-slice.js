import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  historyId: null,
};

export const queueDashboardSlice = createSlice({
  name: "queueDashboard",
  initialState,
  reducers: {
    setHistoryId: (state, action) => {
      state.historyId = action.payload;
    },
    resetHistoryId: (state) => {
      state.historyId = null;
    },
  },
});

export const { setHistoryId, resetHistoryId } = queueDashboardSlice.actions;
export const queueDashboardReducer = queueDashboardSlice.reducer;
