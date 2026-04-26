import AsyncStorage from '@react-native-async-storage/async-storage';

const STREAK_KEY = 'user_streak_count';
const LAST_OPENED_KEY = 'user_last_opened_date';

/**
 * Updates the reading streak based on the last time the app was opened.
 * Logic:
 * - Same day: No change
 * - Consecutive day: Increment streak
 * - Missed 1+ days: Reset streak to 1
 */
export const updateStreak = async () => {
  try {
    const now = new Date();
    // Use local date string to avoid timezone issues for "daily" streaks
    const today = now.toLocaleDateString('en-CA'); // YYYY-MM-DD
    
    const lastOpenedDate = await AsyncStorage.getItem(LAST_OPENED_KEY);
    const currentStreakStr = await AsyncStorage.getItem(STREAK_KEY);
    let streak = currentStreakStr ? parseInt(currentStreakStr, 10) : 0;

    if (!lastOpenedDate) {
      // First time opening the app or data cleared
      streak = 1;
    } else {
      const lastDate = new Date(lastOpenedDate);
      const todayDate = new Date(today);
      
      // Calculate difference in days
      const diffTime = todayDate.getTime() - lastDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Consecutive day
        streak += 1;
      } else if (diffDays > 1) {
        // Missed at least one day
        streak = 1;
      }
      // If diffDays is 0, user already opened app today - keep current streak
    }

    await AsyncStorage.setItem(STREAK_KEY, streak.toString());
    await AsyncStorage.setItem(LAST_OPENED_KEY, today);
    return streak;
  } catch (error) {
    console.error('Error updating streak:', error);
    return 0;
  }
};

/**
 * Retrieves the current streak count.
 */
export const getStreak = async () => {
  try {
    const streak = await AsyncStorage.getItem(STREAK_KEY);
    return streak ? parseInt(streak, 10) : 0;
  } catch (error) {
    console.error('Error getting streak:', error);
    return 0;
  }
};
