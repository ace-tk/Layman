import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

/**
 * Sets up notification handler and requests permissions.
 */
export const setupNotifications = async () => {
  // Configure how notifications are handled when the app is foregrounded
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  // Skip token/permission checks if we are in Expo Go on Android to avoid the SDK 53+ error
  // Local notifications still work without these checks in Expo Go.
  const isExpoGo = Constants.appOwnership === 'expo';
  
  if (Device.isDevice && !isExpoGo) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      return false;
    }
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF8A65',
    });
  }

  return true;
};

/**
 * Triggers a local "Breaking News" notification.
 */
export const sendBreakingNewsNotification = async (title: string, body: string) => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `🚀 ${title}`,
        body: body,
        data: { type: 'breaking_news' },
        sound: true,
      },
      trigger: null, // immediate
    });
  } catch (error) {
    console.error('Error sending local notification:', error);
  }
};
