import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import { setTokenGetter } from "@/API/ApiClient";

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

setTokenGetter(() => store.getState().auth.token);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
