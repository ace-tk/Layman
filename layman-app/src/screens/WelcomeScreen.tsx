import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions, 
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  FadeInUp,
} from 'react-native-reanimated';
import { triggerLightHaptic } from '../services/haptics';


const { width } = Dimensions.get('window');
const BUTTON_HEIGHT = 70;
const HANDLE_SIZE = 54;

export default function WelcomeScreen({ navigation }: any) {
  const onNavigate = () => {
    triggerLightHaptic();
    navigation.navigate('Login');
  };


  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={['#FFF5EC', '#FFEBD7', '#FFD8B1']}
        style={styles.background}
      />

      <SafeAreaView style={[styles.content, { flex: 1 }]} edges={['top']}>

        {/* Title */}
        <Animated.View entering={FadeInUp.delay(200).duration(800)} style={styles.header}>
          <Text style={styles.title}>Layman</Text>
        </Animated.View>

        {/* Content Section */}
        <Animated.View entering={FadeInUp.delay(400).duration(800)} style={styles.centerContent}>
          <Text style={styles.sloganLine1}>Business,</Text>
          <Text style={styles.sloganLine1}>tech & startups</Text>
          <Text style={styles.sloganAccent}>made simple</Text>
        </Animated.View>

        {/* Static "Swipe" Button (now a tap action to avoid crashes) */}
        <Animated.View entering={FadeInUp.delay(600).duration(800)} style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.swipeTrack} 
            activeOpacity={0.9}
            onPress={onNavigate}
          >
            <Text style={styles.swipeText}>
              Swipe to get started
            </Text>
            
            <View style={styles.swipeHandle}>
              <Ionicons name="chevron-forward-outline" size={24} color="#D47545" style={{ marginLeft: 2 }} />
              <Ionicons name="chevron-forward-outline" size={24} color="#D47545" style={{ marginLeft: -12 }} />
            </View>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 50,
  },
  header: {
    marginTop: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: '#2D2D2D',
    letterSpacing: -0.5,
  },
  centerContent: {
    alignItems: 'center',
    marginBottom: 100,
  },
  sloganLine1: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2D2D2D',
    textAlign: 'center',
    lineHeight: 40,
  },
  sloganAccent: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FF8A65',
    textAlign: 'center',
    lineHeight: 40,
    marginTop: 4,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  swipeTrack: {
    width: '100%',
    height: BUTTON_HEIGHT,
    backgroundColor: '#D47545',
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    flexDirection: 'row',
  },
  swipeText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 20, // Offset to account for handle on left
  },
  swipeHandle: {
    position: 'absolute',
    left: 8,
    width: HANDLE_SIZE,
    height: HANDLE_SIZE,
    borderRadius: HANDLE_SIZE / 2,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
});
