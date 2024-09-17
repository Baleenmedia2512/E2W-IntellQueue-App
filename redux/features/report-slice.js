import { createSlice } from "@reduxjs/toolkit";
import { format, startOfMonth, endOfMonth } from "date-fns";

const initialStartDate = startOfMonth(new Date());
const initialEndDate = endOfMonth(new Date());


const initialState = {
  selectedRange: {
    startDate: initialStartDate,
    endDate: initialEndDate,
  },
  dateRange: {
    startDate: format(initialStartDate, 'yyyy-MM-dd'),
    endDate: format(initialEndDate, 'yyyy-MM-dd'),
  },
  
};

export const reportSlice = createSlice({
  name: "report",
  initialState,
  reducers: {
    setDateRange: (state, action) => {
      const { startDate, endDate } = action.payload;

      // Update selectedRange
      state.selectedRange = { startDate, endDate };

      // Update dateRange in 'yyyy-MM-dd' format
      state.dateRange = {
        startDate: format(new Date(startDate), 'yyyy-MM-dd'),
        endDate: format(new Date(endDate), 'yyyy-MM-dd'),
      };
      
    },
    resetDateRange: (state) => initialState,
  }
});

export const { setDateRange, resetDateRange } = reportSlice.actions;
export const reportReducer = reportSlice.reducer;
