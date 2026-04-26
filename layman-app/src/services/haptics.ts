import * as Haptics from 'expo-haptics';

let lastTriggerTime = 0;
const DEBOUNCE_MS = 100;

/**
 * Triggers a light haptic impact with debounce and error handling.
 * Designed for subtle, premium feedback on buttons, tabs, and bookmarks.
 */
export const triggerLightHaptic = async () => {
  const now = Date.now();
  if (now - lastTriggerTime < DEBOUNCE_MS) return;
  
  lastTriggerTime = now;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch (error) {
    // Gracefully ignore on unsupported devices or platforms (e.g. web, older Android)
  }
};
