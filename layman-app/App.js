import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from './src/context/ThemeContext';
import { supabase } from './src/services/supabase';
import AuthNavigator from './src/navigation/AuthNavigator';
import MainNavigator from './src/navigation/MainNavigator';
import ArticleDetailScreen from './src/screens/ArticleDetailScreen';
import ChatScreen from './src/screens/ChatScreen';
import { updateStreak } from './src/services/streakService';
import { setupNotifications } from './src/services/notificationService';



const Stack = createNativeStackNavigator();

// Keep the splash screen visible while we fetch session
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    // 1. Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      // Initialize services
      updateStreak();
      setupNotifications();
      SplashScreen.hideAsync();

    });


    // 2. Listen for auth changes (login, logout, signup)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <ThemeProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {session ? (
              // Main App
              <Stack.Group>
                <Stack.Screen name="Main" component={MainNavigator} />
                <Stack.Screen name="ArticleDetail" component={ArticleDetailScreen} />
                <Stack.Screen 
                  name="Chat" 
                  component={ChatScreen} 
                  options={{ presentation: 'modal' }} 
                />
              </Stack.Group>
            ) : (
              // Auth Flow
              <Stack.Screen name="Auth" component={AuthNavigator} />
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}
