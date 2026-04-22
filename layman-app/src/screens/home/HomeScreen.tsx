import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SIZES, SPACING } from '../../constants/theme';
import Button from '../../components/common/Button';

const HomeScreen = () => {
  const { user, signOut } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.emailText}>{user?.email}</Text>
        </View>

        <View style={styles.body}>
          <Text style={styles.bodyText}>
            You have successfully logged in using Supabase Auth.
          </Text>
        </View>

        <Button 
          title="Sign Out" 
          variant="outline" 
          onPress={signOut}
          style={styles.signOutButton}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  content: {
    flex: 1,
    padding: SIZES.padding,
    justifyContent: 'center',
  },
  header: {
    marginBottom: SPACING.xl,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 18,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  emailText: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  body: {
    backgroundColor: COLORS.background,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    marginBottom: SPACING.xxl,
  },
  bodyText: {
    fontSize: SIZES.font,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 24,
  },
  signOutButton: {
    marginTop: 'auto',
  },
});

export default HomeScreen;
