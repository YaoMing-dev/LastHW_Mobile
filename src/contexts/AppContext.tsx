// Global app context for shared state
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AppContextType {
  speechLanguage: 'vi-VN' | 'en-US';  // Language for speech recognition
  uiLanguage: 'vi' | 'en';             // Language for UI display
  setSpeechLanguage: (lang: 'vi-VN' | 'en-US') => void;
  setUILanguage: (lang: 'vi' | 'en') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [speechLanguage, setSpeechLanguage] = useState<'vi-VN' | 'en-US'>('vi-VN');
  const [uiLanguage, setUILanguage] = useState<'vi' | 'en'>('vi');

  return (
    <AppContext.Provider value={{ 
      speechLanguage, 
      uiLanguage, 
      setSpeechLanguage, 
      setUILanguage 
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}
