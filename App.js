import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeCtx } from './src/components/ui';
import { T } from './src/constants/theme';
import { AppProvider } from './src/context/AppContext';
import AppNavigator from './src/navigation';

const KEY_DARK = '@coachfood/dark';

export default function App() {
  const [isDark, setIsDark] = useState(false);
  const theme = isDark ? T.dark : T.light;

  useEffect(() => {
    AsyncStorage.getItem(KEY_DARK).then(v => { if (v === 'true') setIsDark(true); });
  }, []);

  const toggleTheme = () => {
    setIsDark(d => {
      AsyncStorage.setItem(KEY_DARK, String(!d));
      return !d;
    });
  };

  return (
    <SafeAreaProvider>
      <AppProvider>
        <ThemeCtx.Provider value={{ ...theme, isDark, toggleTheme }}>
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <AppNavigator />
        </ThemeCtx.Provider>
      </AppProvider>
    </SafeAreaProvider>
  );
}
