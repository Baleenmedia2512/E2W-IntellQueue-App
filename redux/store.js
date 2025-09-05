import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import { persistReducer } from "redux-persist";
import { authReducer } from "@/redux/features/auth-slice";
import { clientReducer } from "./features/client-slice";
import createWebStorage from "redux-persist/lib/storage/createWebStorage";
import { orderReducer } from "./features/order-slice";
import { queueReducer } from "./features/queue-slice";
import { queueDashboardReducer } from "./features/queue-dashboard-slice";

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
  whitelist: ["userName", "companyName", "appRights", "dbName"], // Update to correct slice name
};

const clientPersistConfig = {
  key: "client",
  storage: storage,
  whitelist: ["clientName", "clientContact", "clientEmail", "clientSource", "clientAge", "clientDOB", "clientTitle", "clientAddress", "clientGST", "clientPAN", "consultantId", "consultantName", "consultantNumber", "clientID", "clientContactPerson", "clientGender", "clientMonths", "displayClientNumber", "displayClientName", "displayClientID"] 
}

const orderPersistConfig = {
  key: "order",
  storage: storage,
  whitelist: ["clientName", "clientNumber", "maxOrderNumber", "marginAmount", "marginPercentage", "releaseDates", "remarks", "clientEmail", "clientSource", "receivable", "address", "consultantName", "clientContactPerson", "clientGST", "clientPAN", "isOrderExist", "clientID", "nextRateWiseOrderNumber", "orderNumber", "consultantId"]
}

const queuePersistConfig = {
  key: "queue",
  storage: storage,
  whitelist: ["phoneNumber", "language", "queueStatus"], // Add queueStatus to persist
};

const queueDashboardPersistConfig = {
  key: "queueDashboard",
  storage: storage,
  whitelist: ["historyId", "historyStack", "currentHistoryIndex"],
};

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);
const persistedClientReducer = persistReducer(clientPersistConfig, clientReducer);
const persistedOrderReducer = persistReducer(orderPersistConfig, orderReducer);
const persistedQueueReducer = persistReducer(queuePersistConfig, queueReducer);
const persistedQueueDashboardReducer = persistReducer(queueDashboardPersistConfig, queueDashboardReducer);

const rootReducer = combineReducers({
  authSlice: persistedAuthReducer,
  clientSlice: persistedClientReducer,
  orderSlice: persistedOrderReducer,
  queueSlice: persistedQueueReducer,
  queueDashboardSlice: persistedQueueDashboardReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;