import React, { createContext, useContext } from 'react';

export type AppColorScheme = 'light' | 'dark';

export interface AppColorSchemeContextValue {
  colorScheme: AppColorScheme;
  toggleColorScheme: (value?: AppColorScheme) => void;
}

export const AppColorSchemeContext = createContext<AppColorSchemeContextValue | undefined>(undefined);

export const useAppColorScheme = (): AppColorSchemeContextValue => {
  const ctx = useContext(AppColorSchemeContext);
  if (!ctx) throw new Error('useAppColorScheme must be used within AppColorSchemeContext provider');
  return ctx;
};

export default AppColorSchemeContext;
