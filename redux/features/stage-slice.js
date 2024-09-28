import { createSlice } from '@reduxjs/toolkit';

const getCurrentDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed, so we add 1
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const initialState = {
  stages: [{ title: "", description: "", dueDate: getCurrentDate(), stageAmount: "" }],
};

const stageSlice = createSlice({
  name: 'stages',
  initialState,
  reducers: {
    addItemsToStage: (state, action) => {
      state.stages = [...state.stages, ...action.payload];
    },
    updateStage: (state, action) => {
      const { index, field, value } = action.payload;
      state.stages[index][field] = value;
    },
    removeItem: (state) => {
      if (state.stages.length > 0) {
        // Remove the last stage in the array
        state.stages.pop();
      }
    },
    
    resetStageItem: (state) => {
      return initialState
    },
    addStage: (state) => {
      state.stages.push({ 
        title: "", 
        description: "", 
        dueDate: getCurrentDate(), 
        stageAmount: "" 
      });
    }
  },
});

export const { addItemsToStage, removeItem, resetStageItem, updateStage, addStage } = stageSlice.actions;
export const stageReducer = stageSlice.reducer;