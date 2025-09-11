'use client'

import { Provider } from "react-redux";
import { store } from "./store";
import { persistStore } from "redux-persist";
import { PersistGate } from 'redux-persist/integration/react';

const persistor = persistStore(store);

export default function ReduxProvider({ children }) {
  console.log('🔍 ReduxProvider mounting');
  
  return (
    <Provider store={store}>
      <PersistGate 
        loading={
          <section className='flex justify-center items-center h-screen'>
            <div className='ld-ripple'>
              <div></div>
              <div></div>
            </div>
          </section>
        } 
        persistor={persistor}
        onBeforeLift={() => {
          console.log('🔍 Redux persistence restored');
        }}
      >
        {children}
      </PersistGate>
    </Provider>
  );
};