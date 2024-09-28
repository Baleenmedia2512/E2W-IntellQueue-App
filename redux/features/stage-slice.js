import { createSlice } from "@reduxjs/toolkit";

// Initial state for stages
const initialState = {
  stages: [], // Array to store stage objects
  successMessage: "",
  errorMessage: "",
};

export const stageSlice = createSlice({
  name: "stages",
  initialState,
  reducers: {
    // Action to add a new stage to the array
    addStage: (state, action) => {
      state.stages.push(action.payload);
    },
    // Action to reset all stages
    resetStages: (state) => {
      state.stages = [];
    },
    // Action to set success message
    setSuccessMessage: (state, action) => {
      state.successMessage = action.payload;
    },
    // Action to set error message
    setErrorMessage: (state, action) => {
      state.errorMessage = action.payload;
    },
    // Action to update a specific stage
    updateStage: (state, action) => {
      const { index, stageData } = action.payload;
      state.stages[index] = stageData;
    },
    // Action to remove a stage by index
    removeStage: (state, action) => {
      state.stages.splice(action.payload, 1); // Remove stage at the specified index
    },
  },
});

// Export actions
export const { addStage, resetStages, setSuccessMessage, setErrorMessage, updateStage, removeStage } = stageSlice.actions;

// Export the reducer
export const stageReducer = stageSlice.reducer;
