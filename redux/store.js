import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import { persistReducer } from "redux-persist";
import { authReducer } from "@/redux/features/auth-slice";
import { clientReducer } from "./features/client-slice";
import { quoteReducer } from "./features/quote-slice";
import createWebStorage from "redux-persist/lib/storage/createWebStorage";
import { rateReducer } from "./features/rate-slice";

const createNoopStorage = () => {
  return {
    getItem() {
      return Promise.resolve(null);
    },
    setItem(_key, value) {
      return Promise.resolve(value);
    },
    removeItem() {
      return Promise.resolve();
    },
  };
};

const storage =
  typeof window !== "undefined"
    ? createWebStorage("local")
    : createNoopStorage();

const authPersistConfig = {
  key: "auth",
  storage: storage,
  whitelist: ["userName", "companyName"], // Update to correct slice name
};

const clientPersistConfig = {
  key: "client",
  storage: storage,
  whitelist: ["clientName", "clientContact", "clientEmail", "clientSource"]
}

const quotePersistConfig = {
  key: "quote",
  storage: storage,
  whitelist: ["selectedAdMedium", "selectedAdType", "selectedAdCategory", "selectedEdition", "selectedPosition", "currentPage", "quantity", "marginAmount", "campaignDuration", "ratePerUnit", "extraDiscount"]
}

const ratePersistConfig = {
  key: "rate",
  storage: storage,
  whitelist: ["selectedValues", "rateId", "slabData", "selectedUnit",, "startQty"]
}

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);
const persistedClientReducer = persistReducer(clientPersistConfig, clientReducer)
const persistedQuoteReducer = persistReducer(quotePersistConfig, quoteReducer)
const persistedRateReducer = persistReducer(ratePersistConfig, rateReducer)

const rootReducer = combineReducers({
  authSlice: persistedAuthReducer,
  clientSlice: persistedClientReducer,
  quoteSlice: persistedQuoteReducer,
  rateSlice: persistedRateReducer
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;