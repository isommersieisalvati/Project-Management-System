import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./slices/authSlice";
import productSlice from "./slices/productSlice";
import auditSlice from "./slices/auditSlice";

export const store = configureStore({
  reducer: {
    auth: authSlice,
    products: productSlice,
    audit: auditSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
