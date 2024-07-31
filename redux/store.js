import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import { persistReducer } from "redux-persist";
import { authReducer } from "@/redux/features/auth-slice";
import { clientReducer } from "./features/client-slice";
import { quoteReducer } from "./features/quote-slice";
import createWebStorage from "redux-persist/lib/storage/createWebStorage";
import { rateReducer } from "./features/rate-slice";
import { orderReducer } from "./features/order-slice";
import { employeeReducer } from "./features/emp-slice"; 
import { cartReducer } from "./features/cart-slice";

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
  whitelist: ["userName", "companyName", "appRights"], // Update to correct slice name
};

const clientPersistConfig = {
  key: "client",
  storage: storage,
  whitelist: ["clientName", "clientContact", "clientEmail", "clientSource"]
}

const quotePersistConfig = {
  key: "quote",
  storage: storage,
  whitelist: ["selectedAdMedium", "selectedAdType", "selectedAdCategory", "selectedEdition", "selectedPosition", "currentPage", "quantity", "marginAmount", "campaignDuration", "ratePerUnit", "extraDiscount", "rateId"]
}

const cartPersistConfig = {
  key: "cart",
  storage: storage,
  whitelist: ["cart"]
}

const ratePersistConfig = {
  key: "rate",
  storage: storage,
  whitelist: ["selectedValues", "rateId", "slabData", "selectedUnit", "startQty"]
}

const orderPersistConfig = {
  key: "order",
  storage: storage,
  whitelist: ["clientName", "clientNumber", "maxOrderNumber", "receivable", "remarks", "isOrderExist"]
}

const employeePersistConfig = {
  key: "employee",
  storage: storage,
  whitelist: ["generalDetails", "proofDetails", "rolesGoals", "loginCredentials", "currentPage", "isRegistered"], // Define the fields you want to persist
};

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);
const persistedClientReducer = persistReducer(clientPersistConfig, clientReducer);
const persistedQuoteReducer = persistReducer(quotePersistConfig, quoteReducer);
const persistedCartReducer = persistReducer(cartPersistConfig, cartReducer);
const persistedRateReducer = persistReducer(ratePersistConfig, rateReducer);
const persistedOrderReducer = persistReducer(orderPersistConfig, orderReducer);
const persistedEmployeeReducer = persistReducer(employeePersistConfig, employeeReducer);

const rootReducer = combineReducers({
  authSlice: persistedAuthReducer,
  clientSlice: persistedClientReducer,
  quoteSlice: persistedQuoteReducer,
  cartSlice: persistedCartReducer,
  rateSlice: persistedRateReducer,
  orderSlice: persistedOrderReducer,
  employeeSlice: persistedEmployeeReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;