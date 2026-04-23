import React from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
  Extrapolation,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BUTTON_WIDTH = SCREEN_WIDTH - SIZES.padding * 4;
const BUTTON_HEIGHT = 64;
const BUTTON_PADDING = 4;
const SWIPE_RANGE = BUTTON_WIDTH - BUTTON_HEIGHT;

interface SwipeButtonProps {
  onSwipeSuccess: () => void;
  text?: string;
}

const SwipeButton: React.FC<SwipeButtonProps> = ({ onSwipeSuccess, text = 'Swipe to get started' }) => {
  const translateX = useSharedValue(0);

  const gestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent, { startX: number }>({
    onStart: (_, ctx) => {
      ctx.startX = translateX.value;
    },
    onActive: (event, ctx) => {
      let newValue = ctx.startX + event.translationX;
      if (newValue < 0) newValue = 0;
      if (newValue > SWIPE_RANGE) newValue = SWIPE_RANGE;
      translateX.value = newValue;
    },
    onEnd: () => {
      if (translateX.value > SWIPE_RANGE * 0.8) {
        translateX.value = withSpring(SWIPE_RANGE);
        runOnJS(onSwipeSuccess)();
      } else {
        translateX.value = withSpring(0);
      }
    },
  });

  const animatedHandleStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, SWIPE_RANGE * 0.5],
      [1, 0],
      Extrapolation.CLAMP
    );
    return {
      opacity,
    };
  });

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.text, animatedTextStyle]}>
        {text}
      </Animated.Text>
      
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[styles.handle, animatedHandleStyle]}>
          <Ionicons name="chevron-forward" size={32} color={COLORS.white} />
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: BUTTON_WIDTH,
    height: BUTTON_HEIGHT,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: BUTTON_HEIGHT / 2,
    padding: BUTTON_PADDING,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  text: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    position: 'absolute',
    left: BUTTON_HEIGHT + 10,
  },
  handle: {
    width: BUTTON_HEIGHT - BUTTON_PADDING * 2,
    height: BUTTON_HEIGHT - BUTTON_PADDING * 2,
    backgroundColor: COLORS.accentOrange,
    borderRadius: (BUTTON_HEIGHT - BUTTON_PADDING * 2) / 2,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    left: BUTTON_PADDING,
  },
});

export default SwipeButton;
