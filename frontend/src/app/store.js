// src/store.js
import { configureStore } from "@reduxjs/toolkit";
import serverReducer from "../features/categorSlice";
import { apiSlice } from "../features/api/apiSlice";
const store = configureStore({
  reducer: {
    servers: serverReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

export default store;
