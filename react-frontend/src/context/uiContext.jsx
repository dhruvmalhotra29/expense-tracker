import { createContext, useContext, useState } from "react";

const UIContext = createContext(null);

export function UIProvider({ children }) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <UIContext.Provider value={{ modalOpen, setModalOpen }}>
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) throw new Error("useUI must be inside UIProvider");
  return context;
}