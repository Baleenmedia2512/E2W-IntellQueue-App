import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  statusFilter: "All",
  prospectTypeFilter: "All",
  quoteSentFilter: "All",
  CSEFilter: "All",
  searchQuery: "",
  filtersVisible: false,
  fromDate: null,
  toDate: null,
};

const filterSlice = createSlice({
  name: "filter",
  initialState,
  reducers: {
    setStatusFilter: (state, action) => {
      state.statusFilter = action.payload;
    },
    setProspectTypeFilter: (state, action) => {
      state.prospectTypeFilter = action.payload;
    },
    setSearchQuery: (state, action) => {
        state.searchQuery = action.payload;
    },
    setQuoteSentFilter: (state, action) => {
      state.quoteSentFilter = action.payload;
    },
    setCSEFilter: (state, action) => {
      state.CSEFilter = action.payload;
    },
    setFromDate: (state, action) => {
      state.fromDate = action.payload;
    },
    setToDate: (state, action) => {
      state.toDate = action.payload;
    },
    toggleFiltersVisible: (state, action) => {
        state.filtersVisible = !state.filtersVisible
    },
    resetFilters: () => initialState,
  },
});

export const {
  setStatusFilter,
  setProspectTypeFilter,
  setQuoteSentFilter,
  setCSEFilter,
  setSearchQuery,
  toggleFiltersVisible,
  setFromDate,
  setToDate,
  resetFilters,
} = filterSlice.actions;

export const filterReducer = filterSlice.reducer;