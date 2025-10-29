import React, { createContext, useContext } from 'react';

export type AppColorScheme = 'light' | 'dark';

export interface AppColorSchemeContextValue {
  colorScheme: AppColorScheme;
  toggleColorScheme: (value?: AppColorScheme) => void;
}

export const AppColorSchemeContext = createContext<AppColorSchemeContextValue | undefined>(undefined);

export const useAppColorScheme = (): AppColorSchemeContextValue => {
  const ctx = useContext(AppColorSchemeContext);
  if (!ctx) {
    // Provide a safe default instead of throwing so consumers can call this
    // hook without requiring the provider in test or isolated environments.
    return {
      colorScheme: 'light',
      toggleColorScheme: (_?: AppColorScheme) => undefined,
    };
  }
  return ctx;
};

export default AppColorSchemeContext;
