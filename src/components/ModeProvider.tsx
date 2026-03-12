'use client';

import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface ModeContextType {
  isAdultMode: boolean;
  setIsAdultMode: (mode: boolean) => void;
}

const ModeContext = createContext<ModeContextType>({
  isAdultMode: false,
  setIsAdultMode: () => undefined,
});

export const useMode = () => useContext(ModeContext);

export function ModeProvider({ children }: { children: ReactNode }) {
  const [isAdultMode, setIsAdultModeState] = useState(false);

  useEffect(() => {
    // Component mounted, read from localStorage
    const stored = localStorage.getItem('isAdultMode');
    if (stored === 'true') {
      setIsAdultModeState(true);
    }
  }, []);

  const setIsAdultMode = (mode: boolean) => {
    setIsAdultModeState(mode);
    localStorage.setItem('isAdultMode', mode ? 'true' : 'false');
  };

  return (
    <ModeContext.Provider value={{ isAdultMode, setIsAdultMode }}>
      {children}
    </ModeContext.Provider>
  );
}
