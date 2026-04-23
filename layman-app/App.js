import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import AuthNavigator from './src/navigation/AuthNavigator';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  useEffect(() => {
    async function prepare() {
      try {
        // Pre-loading logic can go here
        await new Promise(resolve => setTimeout(resolve, 500)); 
      } finally {
        await SplashScreen.hideAsync();
      }
    }
    prepare();
  }, []);

  return (
    <NavigationContainer>
      <AuthNavigator />
    </NavigationContainer>
  );
}
