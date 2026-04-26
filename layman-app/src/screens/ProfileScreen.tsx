import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Switch,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { supabase } from '../services/supabase';
import { useTheme } from '../context/ThemeContext';
import { triggerLightHaptic } from '../services/haptics';
import { getStreak } from '../services/streakService';


export default function ProfileScreen({ navigation }: any) {
  const { colors, toggleTheme, isDark } = useTheme();
  const [email, setEmail] = useState<string | null>(null);
  const [notifications, setNotifications] = useState(true);
  const [streak, setStreak] = useState(0);


  useEffect(() => {
    const getUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || null);
      }
      
      const currentStreak = await getStreak();
      setStreak(currentStreak);
    };
    getUserData();

  }, []);

  const handleLogout = async () => {
    triggerLightHaptic();
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Sign Out", 
          style: "destructive",
          onPress: async () => {
            triggerLightHaptic();
            await supabase.auth.signOut();
          } 
        }
      ]
    );
  };

  const getUserInitials = () => {
    if (!email) return "U";
    return email.charAt(0).toUpperCase();
  };

  const ProfileItem = ({ icon, title, value, type = 'arrow', onValueChange }: any) => (
    <TouchableOpacity 
      style={styles.itemRow} 
      onPress={() => {
        if (type === 'arrow') {
          triggerLightHaptic();
          navigation.navigate('Saved');
        }
      }}
      activeOpacity={type === 'arrow' ? 0.6 : 1}
    >
      <View style={styles.itemLeft}>
        <View style={[styles.itemIconBox, { backgroundColor: isDark ? '#2A2A2A' : '#F9F9F9' }]}>
          <Ionicons name={icon} size={20} color={isDark ? "#AAA" : "#666"} />
        </View>
        <Text style={[styles.itemTitle, { color: colors.text }]}>{title}</Text>
      </View>
      
      {type === 'arrow' ? (
        <Ionicons name="chevron-forward" size={20} color={isDark ? "#555" : "#AAA"} />
      ) : (
        <Switch 
          value={value} 
          onValueChange={(val) => {
            triggerLightHaptic();
            onValueChange(val);
          }}
          trackColor={{ false: "#333", true: "#FF8A65" }}
          thumbColor="#FFF"
        />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={[styles.headerText, { color: colors.text }]}>Profile</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* USER INFO CARD */}
        <View style={[styles.userCard, { backgroundColor: colors.card }]}>
          <View style={[styles.avatarCircle, { backgroundColor: isDark ? '#333' : '#FFEAD6' }]}>
            <Text style={[styles.avatarText, { color: isDark ? '#FF8A65' : '#D47545' }]}>{getUserInitials()}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: colors.text }]}>Reader</Text>
            <Text style={[styles.userEmail, { color: colors.subtext }]}>{email || 'user@example.com'}</Text>
          </View>
          <TouchableOpacity style={[styles.editBtn, { backgroundColor: isDark ? '#333' : '#F5F5F5' }]}>
            <Ionicons name="pencil-sharp" size={16} color={isDark ? "#AAA" : "#666"} />
          </TouchableOpacity>
        </View>

        {/* STREAK CARD */}
        <View style={[styles.streakCard, { backgroundColor: isDark ? '#1F1F1F' : '#FFF9F5', borderColor: isDark ? '#333' : '#FFEDD5' }]}>
          <View style={styles.streakInfo}>
            <View style={styles.streakIconWrapper}>
              <Text style={styles.streakEmoji}>🔥</Text>
            </View>
            <View>
              <Text style={[styles.streakCount, { color: colors.text }]}>{streak} Day Streak</Text>
              <Text style={[styles.streakSubtext, { color: colors.subtext }]}>Keep reading to grow your streak!</Text>
            </View>
          </View>
        </View>


        {/* SECTION: CONTENT */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>CONTENT</Text>
          <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
            <ProfileItem icon="bookmark-outline" title="Saved Articles" />
          </View>
        </View>

        {/* SECTION: PREFERENCES */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>PREFERENCES</Text>
          <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
            <ProfileItem 
              icon="moon-outline" 
              title="Dark Mode" 
              type="switch" 
              value={isDark}
              onValueChange={toggleTheme}
            />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <ProfileItem 
              icon="notifications-outline" 
              title="Notifications" 
              type="switch" 
              value={notifications}
              onValueChange={setNotifications}
            />
          </View>
        </View>

        {/* SECTION: SUPPORT */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SUPPORT</Text>
          <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
            <ProfileItem 
              icon="chatbubble-ellipses-outline" 
              title="Send Feedback" 
            />
          </View>
        </View>

        {/* SIGN OUT */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleLogout}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Layman v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerText: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  userCard: {
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
  },
  userEmail: {
    fontSize: 14,
    marginTop: 2,
  },
  editBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 25,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D47545',
    marginBottom: 10,
    marginLeft: 4,
    letterSpacing: 1,
  },
  sectionCard: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
  signOutBtn: {
    backgroundColor: '#000',
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  signOutText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#AAA',
    marginBottom: 20,
  },
  streakCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 25,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  streakInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFEDD5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  streakEmoji: {
    fontSize: 24,
  },
  streakCount: {
    fontSize: 20,
    fontWeight: '800',
  },
  streakSubtext: {
    fontSize: 13,
    marginTop: 2,
    fontWeight: '500',
  },
});

