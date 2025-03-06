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
import { reportReducer } from "./features/report-slice";
import { stageReducer } from "./features/stage-slice";
import { filterReducer } from "./features/lead-filter-slice";
import { countReducer } from "./features/count-slice";
import { timeReducer } from './features/time-slice';


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
  whitelist: ["clientName", "clientContact", "clientEmail", "clientSource", "clientAge", "clientDOB", "clientTitle", "clientAddress", "clientGST", "clientPAN", "consultantId", "consultantName", "consultantNumber", "clientID", "consultantId", "clientContactPerson", "clientGender", "clientMonths", "displayClientNumber", "displayClientName", "displayClientID"] 
}

const quotePersistConfig = {
  key: "quote",
  storage: storage,
  whitelist: ["selectedAdMedium", "selectedAdType", "selectedAdCategory", "selectedEdition", "selectedPosition", "currentPage", "quantity", "marginAmount", "marginPercentage", "campaignDuration", "ratePerUnit", "extraDiscount", "rateId", "previousPage", "history", "width", "qtySlab", "isEditMode", "editIndex", "editQuoteNumber", "isNewCartOnEdit", "checked"]
}

const cartPersistConfig = {
  key: "cart",
  storage: storage,
  whitelist: ["cart"]
}

const stagePersistConfig = {
  key: "stages",
  storage: storage,
  whitelist: ["stages", "editMode"]
}

const ratePersistConfig = {
  key: "rate",
  storage: storage,
  whitelist: ["selectedValues", "rateId", "slabData", "selectedUnit", "startQty"]
}

const orderPersistConfig = {
  key: "order",
  storage: storage,
  whitelist: ["clientName", "clientNumber", "maxOrderNumber", "marginAmount", "marginPercentage", "releaseDates", "remarks", "clientEmail", "clientSource", "receivable", "address", "consultantName", "clientContactPerson", "clientGST", "clientPAN", "isOrderExist", "clientID", "nextRateWiseOrderNumber", "orderNumber", "consultantId"]
}

const employeePersistConfig = {
  key: "employee",
  storage: storage,
  whitelist: ["generalDetails", "proofDetails", "rolesGoals", "loginCredentials", "currentPage", "isRegistered"], // Define the fields you want to persist
};

const reportPersistConfig = {
  key: "report",
  storage: storage,
  whitelist: ["dateRange"],
}

const filterPersistConfig = {
  key: "filter",
  storage: storage,
  whitelist: ["statusFilter", "prospectTypeFilter", "quoteSentFilter", "CSEFilter", "fromDate", "toDate", "searchQuery", "filtersVisible"]
}

const countPersistConfig = {
  key: "count",
  storage: storage,
  whitelist: ["quoteClickCount"],
}

const timePersistConfig = {
  key: "time",
  storage: storage,
  whitelist: ["timeElapsed"],
}

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);
const persistedClientReducer = persistReducer(clientPersistConfig, clientReducer);
const persistedQuoteReducer = persistReducer(quotePersistConfig, quoteReducer);
const persistedCartReducer = persistReducer(cartPersistConfig, cartReducer);
const persistedRateReducer = persistReducer(ratePersistConfig, rateReducer);
const persistedOrderReducer = persistReducer(orderPersistConfig, orderReducer);
const persistedEmployeeReducer = persistReducer(employeePersistConfig, employeeReducer);
const persistedReportReducer = persistReducer(reportPersistConfig, reportReducer);
const persistedStageReducer = persistReducer(stagePersistConfig, stageReducer);
const persistedFilterReducer = persistReducer(filterPersistConfig, filterReducer);
const persistedCountReducer = persistReducer(countPersistConfig, countReducer);
const persistedTimeReducer = persistReducer(timePersistConfig, timeReducer);


const rootReducer = combineReducers({
  authSlice: persistedAuthReducer,
  clientSlice: persistedClientReducer,
  quoteSlice: persistedQuoteReducer,
  cartSlice: persistedCartReducer,
  rateSlice: persistedRateReducer,
  orderSlice: persistedOrderReducer,
  employeeSlice: persistedEmployeeReducer,
  reportSlice: persistedReportReducer,
  stageSlice: persistedStageReducer,
  filterSlice: persistedFilterReducer,
  countSlice: persistedCountReducer,
  timeSlice: persistedTimeReducer,

});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;