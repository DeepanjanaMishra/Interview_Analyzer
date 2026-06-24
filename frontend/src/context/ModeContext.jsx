import { createContext, useContext, useState } from "react";

const ModeContext = createContext();

export function ModeProvider({ children }) {

  const [mode] = useState("practice"); // fixed mode

  return (
    <ModeContext.Provider value={{ mode }}>
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  return useContext(ModeContext);
}