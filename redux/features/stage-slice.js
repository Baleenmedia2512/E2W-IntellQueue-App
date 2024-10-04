import { createSlice } from '@reduxjs/toolkit';

const getCurrentDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed, so we add 1
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const initialState = {
  stages: [{ title: "", description: "", dueDate: getCurrentDate(), stageAmount: "" , id: "", index: ""}],
  orderNumber: 0,
  editMode: false
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
      state.stages[index]["index"] = index + 1;
    },
    removeItem: (state, action) => {
      const { index } = action.payload;

      // Remove the stage at the specific index and shift the remaining stages up
      if (state.stages.length > 1) {
        state.stages.splice(index, 1);
      } else {
        // If there's only one stage left, reset its values instead of removing it
        return initialState
      }
    },
    resetStageItem: (state) => {
      return initialState
    },
    addStage: (state, action) => {
      const { index } = action.payload;

      // Create a new stage with empty fields
      const newStage = {
        title: "", 
        description: "", 
        dueDate: getCurrentDate(), 
        stageAmount: "" 
      };

      // Insert the new stage at the specific index and shift existing stages
      state.stages.splice(index, 0, newStage);
    },
    setStagesFromServer: (state, action) => {
      // Replace the entire stages array with the incoming data
      state.stages = action.payload.map(item => ({
        title: `Stage ${item.Stage}`, // You can modify this according to your requirements
        description: item.Description,
        dueDate: item.DueDate,
        stageAmount: item.StageAmount,
        id: item.ID
      }));
    },
    setStageEdit: (state, action) => {
      state.editMode = action.payload
    },
    setOrderNumber: (state, action) => {
      state.orderNumber = action.payload
    }
  },
});

export const { addItemsToStage, removeItem, resetStageItem, updateStage, addStage, setStagesFromServer, setStageEdit, setOrderNumber } = stageSlice.actions;
export const stageReducer = stageSlice.reducer;