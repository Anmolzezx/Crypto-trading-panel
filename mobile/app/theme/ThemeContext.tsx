import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'react-native';

type ThemeContextType = {
  isDark: boolean;
  setIsDark: (val: boolean) => void;
  isLoading: boolean;
};

const ThemeContext = createContext<ThemeContextType>({
  isDark: true,
  setIsDark: () => {},
  isLoading: true,
});

const THEME_STORAGE_KEY = '@revibe_theme_preference';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isDark, setIsDarkState] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme !== null) {
          const parsedTheme = JSON.parse(savedTheme);
          setIsDarkState(parsedTheme);
        }

        await new Promise<void>(resolve => setTimeout(resolve, 300));
      } catch (error) {
        console.error('Error loading theme preference:', error);
        await new Promise<void>(resolve => setTimeout(resolve, 300));
      } finally {
        setIsLoading(false);
      }
    };

    loadThemePreference();
  }, []);

  const setIsDark = async (value: boolean) => {
    try {
      setIsDarkState(value);

      StatusBar.setBarStyle(value ? 'light-content' : 'dark-content', true);
      StatusBar.setBackgroundColor(value ? '#1a1a1a' : '#ffffff', true);

      await AsyncStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  useEffect(() => {
    StatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content', true);
    StatusBar.setBackgroundColor(isDark ? '#1a1a1a' : '#ffffff', true);
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ isDark, setIsDark, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
