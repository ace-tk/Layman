import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
  StyleProp
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

const Button: React.FC<ButtonProps> = ({ 
  title, 
  loading, 
  variant = 'primary', 
  style, 
  textStyle, 
  disabled,
  ...props 
}) => {
  const isOutline = variant === 'outline';
  const isSecondary = variant === 'secondary';

  const renderContent = () => (
    <>
      {loading ? (
        <ActivityIndicator color={isOutline ? COLORS.primary : COLORS.white} />
      ) : (
        <Text style={[
          styles.text, 
          isOutline ? styles.outlineText : null, 
          isSecondary ? styles.secondaryText : null,
          textStyle
        ]}>
          {title}
        </Text>
      )}
    </>
  );

  const isDisabled = !!(loading || disabled);

  if (variant === 'primary' && !isDisabled) {
    return (
      <TouchableOpacity 
        activeOpacity={0.8} 
        disabled={isDisabled}
        style={[styles.container, style]}
        {...props}
      >
        <LinearGradient
          colors={COLORS.warmOrangeGradient as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      activeOpacity={0.8} 
      disabled={isDisabled}
      style={[
        styles.container, 
        isOutline ? styles.outlineContainer : null,
        isSecondary ? styles.secondaryContainer : null,
        isDisabled ? styles.disabledContainer : null,
        style
      ]}
      {...props}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    borderRadius: SIZES.radius,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  gradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outlineContainer: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
    elevation: 0,
    shadowOpacity: 0,
  },
  secondaryContainer: {
    backgroundColor: COLORS.background,
    elevation: 0,
    shadowOpacity: 0,
  },
  disabledContainer: {
    backgroundColor: COLORS.border,
    borderColor: COLORS.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  text: {
    fontSize: SIZES.font,
    fontWeight: '700',
    color: COLORS.white,
  },
  outlineText: {
    color: COLORS.primary,
  },
  secondaryText: {
    color: COLORS.primary,
  },
});

export default Button;
