import React from 'react';
import { StyleSheet, View, Text, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SPACING } from '../../constants/theme';
import SwipeButton from '../../components/common/SwipeButton';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Signup: undefined;
};

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  const handleGetStarted = () => {
    navigation.navigate('Login');
  };

  return (
    <LinearGradient
      colors={COLORS.peachOrangeGradient as [string, string, ...string[]]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>Layman</Text>
          </View>

          <View style={styles.sloganContainer}>
            <Text style={styles.sloganText}>
              Business, {'\n'}
              tech & startups {'\n'}
              <Text style={styles.accentText}>made simple</Text>
            </Text>
          </View>

          <View style={styles.footer}>
            <SwipeButton onSwipeSuccess={handleGetStarted} />
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: SIZES.padding * 2,
    justifyContent: 'space-between',
    paddingVertical: SPACING.xxl * 2,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  logoText: {
    fontSize: 48,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -1,
  },
  sloganContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sloganText: {
    fontSize: SIZES.h1 * 1.2,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 42,
  },
  accentText: {
    color: COLORS.accentOrange,
  },
  footer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
});

export default WelcomeScreen;
