import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView,
  Switch,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../services/supabase';

export default function ProfileScreen({ navigation }: any) {
  const [email, setEmail] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || null);
      }
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Sign Out", 
          style: "destructive",
          onPress: async () => {
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
      onPress={() => type === 'arrow' && navigation.navigate('Saved')}
      activeOpacity={type === 'arrow' ? 0.6 : 1}
    >
      <View style={styles.itemLeft}>
        <View style={styles.itemIconBox}>
          <Ionicons name={icon} size={20} color="#666" />
        </View>
        <Text style={styles.itemTitle}>{title}</Text>
      </View>
      
      {type === 'arrow' ? (
        <Ionicons name="chevron-forward" size={20} color="#AAA" />
      ) : (
        <Switch 
          value={value} 
          onValueChange={onValueChange}
          trackColor={{ false: "#DDD", true: "#FF8A65" }}
          thumbColor="#FFF"
        />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Profile</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* USER INFO CARD */}
        <View style={styles.userCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{getUserInitials()}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>Reader</Text>
            <Text style={styles.userEmail}>{email || 'user@example.com'}</Text>
          </View>
          <TouchableOpacity style={styles.editBtn}>
            <Ionicons name="pencil-sharp" size={16} color="#666" />
          </TouchableOpacity>
        </View>

        {/* SECTION: CONTENT */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>CONTENT</Text>
          <View style={styles.sectionCard}>
            <ProfileItem icon="bookmark-outline" title="Saved Articles" />
          </View>
        </View>

        {/* SECTION: PREFERENCES */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>PREFERENCES</Text>
          <View style={styles.sectionCard}>
            <ProfileItem 
              icon="moon-outline" 
              title="Dark Mode" 
              type="switch" 
              value={darkMode}
              onValueChange={setDarkMode}
            />
            <View style={styles.divider} />
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
          <View style={styles.sectionCard}>
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
    backgroundColor: '#FFF0E5',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#000',
    letterSpacing: -1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  userCard: {
    backgroundColor: '#FFF',
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
    backgroundColor: '#FFEAD6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D47545',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  editBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
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
    backgroundColor: '#FFF',
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
    backgroundColor: '#F9F9F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#F5F5F5',
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
  }
});
