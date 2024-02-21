import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    value:{
        isAuth: false,
        userName: "",
        uid: "",
        idModerator: false,
    }
}

 export const auth = createSlice({
    name: "auth",
    initialState,
    reducers: {
        logOut: () => {
            return initialState 
        },
        logIn: (state, action) => {
            state.value.userName = action.payload;
            state.value.isAuth = !!action.payload;
        }
    }
 });

 export default auth.reducer;
 export const {logOut, logIn} = auth.actions;