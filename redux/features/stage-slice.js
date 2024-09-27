import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  stages: [],
};

const stageSlice = createSlice({
  name: 'stage',
  initialState,
  reducers: {
    addItemsToStage: (state, action) => {
      state.stages = [...state.stages, ...action.payload];
    },
    removeItem: (state, action) => {
      const index = action.payload;
      state.stages = state.stages.filter(item => item.index !== index);
    },
    resetStageItem: (state) => {
      return initialState
    }
  },
});

export const { addItemsToStage, removeItem, resetStageItem } = stageSlice.actions;
export const stageReducer = stageSlice.reducer;