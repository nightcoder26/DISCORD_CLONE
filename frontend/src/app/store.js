// src/store.js
import { configureStore } from "@reduxjs/toolkit";
import serverReducer from "../features/categorSlice";

const store = configureStore({
  reducer: {
    servers: serverReducer,
  },
});

export default store;
