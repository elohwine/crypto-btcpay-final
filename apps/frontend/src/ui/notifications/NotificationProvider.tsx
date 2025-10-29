import React, { useState, useEffect } from 'react';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import mantineTheme from '../../lib/theme';
import AppColorSchemeContext from '../../lib/color-scheme';
import { getPrimaryForTheme, getContrastColor } from '../../lib/themeUtils';

interface UIRootProvidersProps {
  children: React.ReactNode;
}

export const UIRootProviders: React.FC<UIRootProvidersProps> = ({ children }) => {
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('mantine-color-scheme');
      if (stored === 'light' || stored === 'dark') setColorScheme(stored);
    } catch {
      // ignore
    }
  }, []);

  const toggleColorScheme = (value?: 'light' | 'dark') => {
    const next = value || (colorScheme === 'dark' ? 'light' : 'dark');
    setColorScheme(next);
    try {
      localStorage.setItem('mantine-color-scheme', next);
    } catch {
      // ignore
    }
  };

  const appliedTheme: any = { ...mantineTheme, colorScheme };

  // Keep CSS variable --primary in sync with Mantine theme primary color
  // Use useEffect so this runs client-side after hydration
  // Keep CSS variable --primary (and a contrast color) in sync with Mantine theme
  useEffect(() => {
    try {
      const primaryShade = getPrimaryForTheme(appliedTheme, colorScheme);
      const contrast = getContrastColor(primaryShade);
      document.documentElement.style.setProperty('--primary', primaryShade);
      document.documentElement.style.setProperty('--primary-contrast', contrast);
      // also set background / surface / text CSS variables so existing CSS can react to color-scheme
      try {
        const themeColors = require('../../lib/themeUtils').getThemeColors(appliedTheme, colorScheme);
        if (themeColors) {
          document.documentElement.style.setProperty('--bg', themeColors.bg);
          document.documentElement.style.setProperty('--surface', themeColors.surface);
          document.documentElement.style.setProperty('--text', themeColors.text);
          document.documentElement.style.setProperty('--muted', themeColors.muted);
        }
      } catch (e) {
        // ignore themeColors set failure
      }
    } catch (err) {
      // ignore; don't break rendering if theme reading fails
    }
  }, [colorScheme, appliedTheme.primaryColor]);

  return (
    <AppColorSchemeContext.Provider value={{ colorScheme, toggleColorScheme }}>
      <MantineProvider theme={appliedTheme}>
        <Notifications position="top-right" zIndex={3000} limit={4} autoClose={7000} />
        {children}
      </MantineProvider>
    </AppColorSchemeContext.Provider>
  );
};