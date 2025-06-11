import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  historyId: null,
  historyStack: [],
  currentHistoryIndex: -1,
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
    setHistoryStack: (state, action) => {
      state.historyStack = action.payload;
    },
    setCurrentHistoryIndex: (state, action) => {
      state.currentHistoryIndex = action.payload;
    },
    updateHistoryStack: (state, action) => {
      const newId = action.payload;
      // Remove any future history after current position
      state.historyStack = state.historyStack.slice(0, state.currentHistoryIndex + 1);
      state.historyStack.push(newId);
      state.currentHistoryIndex = state.historyStack.length - 1;
    },
    resetHistory: (state) => {
      state.historyStack = [];
      state.currentHistoryIndex = -1;
      state.historyId = null;
    },
  },
});

export const { 
  setHistoryId, 
  resetHistoryId, 
  setHistoryStack, 
  setCurrentHistoryIndex,
  updateHistoryStack,
  resetHistory 
} = queueDashboardSlice.actions;

export const queueDashboardReducer = queueDashboardSlice.reducer;
