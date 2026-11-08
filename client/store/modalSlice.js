import { createSlice } from "@reduxjs/toolkit";

const modalSlice = createSlice({
  name: "modal",
  initialState: {
    isOpenLoginForm: false,
    isOpenVerifyForm: false,
    isOpenEmailForm: false,
  },
  reducers: {
    openLoginForm: (state) => {
      state.isOpenLoginForm = true;
    },
    closeLoginForm: (state) => {
      state.isOpenLoginForm = false;
    },
    openVerifyForm: (state) => {
      state.isOpenVerifyForm = true;
    },
    closeVerifyForm: (state) => {
      state.isOpenVerifyForm = false;
    },
    openEmailForm: (state) => {
      state.isOpenEmailForm = true;
    },
    closeEmailForm: (state) => {
      state.isOpenEmailForm = false;
    },
  },
});

export const {
  openLoginForm,
  closeLoginForm,
  openVerifyForm,
  closeVerifyForm,
  openEmailForm,
  closeEmailForm,
} = modalSlice.actions;
export default modalSlice.reducer;
