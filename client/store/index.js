import { configureStore } from "@reduxjs/toolkit";
import webSettingReducer from "./webSetting";
import modalReducer from "./modalSlice";

const store = configureStore({
  reducer: { webSetting: webSettingReducer, modal: modalReducer },
});

export default store;
