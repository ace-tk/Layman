import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  StyleSheet, 
  TextInputProps, 
  ViewStyle, 
  TouchableOpacity,
  StyleProp
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SPACING } from '../../constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  iconName?: keyof typeof Ionicons.glyphMap;
  secureTextEntry?: boolean;
}

const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  containerStyle, 
  iconName, 
  secureTextEntry,
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[
        styles.inputContainer,
        isFocused && styles.focusedInput,
        error ? styles.errorInput : null
      ]}>
        {iconName && (
          <Ionicons 
            name={iconName} 
            size={20} 
            color={isFocused ? COLORS.primary : COLORS.textSecondary} 
            style={styles.icon} 
          />
        )}
        <TextInput
          style={styles.input}
          placeholderTextColor={COLORS.textSecondary}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          {...props}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon}>
            <Ionicons 
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'} 
              size={20} 
              color={COLORS.textSecondary} 
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius,
    paddingHorizontal: SPACING.md,
    height: 56,
  },
  focusedInput: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
  },
  errorInput: {
    borderColor: COLORS.error,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: SIZES.font,
    color: COLORS.text,
    height: '100%',
  },
  eyeIcon: {
    padding: 10,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default Input;
