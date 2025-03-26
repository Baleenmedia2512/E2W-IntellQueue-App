"use client"; // Ensure this runs in client-side components
import { createContext, useContext, useState } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [isCleared, setIsCleared] = useState(false);

  return (
    <CartContext.Provider value={{ isCleared, setIsCleared }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
