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
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Component mounted, read from localStorage
    const stored = localStorage.getItem('404tv_adult_mode');
    if (stored === 'true') {
      setIsAdultModeState(true);
    }
    setIsInitialized(true);
  }, []);

  const setIsAdultMode = (mode: boolean) => {
    setIsAdultModeState(mode);
    localStorage.setItem('404tv_adult_mode', mode ? 'true' : 'false');
  };

  // 确保水合阶段完成才渲染子组件，避免服务端和客户端渲染不一致，以及初始数据串台
  if (!isInitialized) {
    return null;
  }

  return (
    <ModeContext.Provider value={{ isAdultMode, setIsAdultMode }}>
      {children}
    </ModeContext.Provider>
  );
}
