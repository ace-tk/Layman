import React, { useState, useCallback, useEffect } from 'react';

import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  TouchableOpacity,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../services/supabase';
import { useTheme } from '../context/ThemeContext';
import { getCachedSavedArticles, cacheSavedArticles } from '../services/offlineService';


const { width } = Dimensions.get('window');

// Conversational Headline Helper
const simplifyHeadline = (text: string) => {
  if (!text) return "";
  let simple = text;
  simple = simple.replace(/announces/i, "says");
  simple = simple.replace(/launches/i, "just started");
  simple = simple.replace(/merger/i, "joining together");
  if (simple.length > 50) {
    simple = simple.substring(0, 47) + "...";
  }
  return simple;
};

const ImageWithFallback = ({ uri, style }: any) => {
  const { colors, isDark } = useTheme();
  const [error, setError] = useState(false);

  if (!uri || error) {
    return (
      <View style={[style, { backgroundColor: isDark ? '#2A2A2A' : '#FFE0B2', justifyContent: 'center', alignItems: 'center' }]}>
        <Ionicons name="image-outline" size={32} color="#FF8A65" />
      </View>
    );
  }

  return (
    <Image 
      source={{ uri }} 
      style={style} 
      onError={() => setError(true)}
    />
  );
};

export default function SavedScreen({ navigation }: any) {
  const { colors, isDark } = useTheme();
  const [savedArticles, setSavedArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);


  const fetchSavedArticles = async () => {
    try {
      // 1. Load from cache first for instant UI
      const cached = await getCachedSavedArticles();
      if (cached.length > 0 && loading) {
        setSavedArticles(cached);
        setLoading(false);
      }

      // 2. Attempt to fetch from Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('saved_articles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      } else {
        setSavedArticles(data || []);
        setIsOffline(false);
        // 3. Update cache
        await cacheSavedArticles(data || []);
      }
    } catch (error) {
      console.log('Sync failed, using offline data', error);
      setIsOffline(true);
      // Fallback to cache if we haven't already
      const cached = await getCachedSavedArticles();
      setSavedArticles(cached);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let subscription: any;

    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      subscription = supabase
        .channel('saved_articles_realtime')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'saved_articles',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setSavedArticles((prev) => {
                const alreadyExists = prev.some(a => a.id === payload.new.id);
                if (alreadyExists) return prev;
                const updated = [payload.new, ...prev];
                cacheSavedArticles(updated);
                return updated;
              });
            } else if (payload.eventType === 'DELETE') {
              setSavedArticles((prev) => {
                const updated = prev.filter((a) => a.id !== payload.old.id);
                cacheSavedArticles(updated);
                return updated;
              });
            }
          }
        )
        .subscribe();
    };

    setupSubscription();

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchSavedArticles();
    }, [])
  );

  const renderVerticalItem = ({ item }: { item: any }) => {
    const reconstructedArticle = {
      article_id: item.article_id,
      title: item.title,
      source_id: item.source,
      image_url: item.image_url,
      link: item.link
    };

    return (
      <TouchableOpacity 
        style={[styles.verticalCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }]} 
        activeOpacity={0.7}
        onPress={() => navigation.navigate('ArticleDetail', { article: reconstructedArticle })}
      >
        <ImageWithFallback 
          uri={item.image_url} 
          style={styles.verticalImage} 
        />
        <View style={styles.verticalContent}>
          <Text style={[styles.verticalTitle, { color: colors.text }]} numberOfLines={2}>
            {simplifyHeadline(item.title)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#FF8A65" />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={[styles.headerText, { color: colors.text }]}>Saved</Text>
        <TouchableOpacity style={[styles.searchButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' }]}>
          <Ionicons name="search" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* OFFLINE INDICATOR */}
      {isOffline && (
        <View style={styles.offlineBanner}>
          <Ionicons name="cloud-offline-outline" size={16} color="#FFF" style={{ marginRight: 8 }} />
          <Text style={styles.offlineText}>Offline Mode • Showing cached articles</Text>
        </View>
      )}


      {/* LIST */}
      {savedArticles.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={[styles.emptyIconCircle, { backgroundColor: isDark ? '#1F1F1F' : '#FFEAD6' }]}>
            <Ionicons name="bookmark-outline" size={60} color="#D47545" />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Nothing here yet</Text>
          <Text style={[styles.emptySubtitle, { color: colors.subtext }]}>Articles you save will show up here</Text>
        </View>
      ) : (
        <FlatList
          data={savedArticles}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderVerticalItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerText: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1,
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 40,
  },
  verticalCard: {
    flexDirection: 'row',
    borderRadius: 24,
    marginBottom: 12,
    padding: 10,
    alignItems: 'center',
  },
  verticalImage: {
    width: 90,
    height: 90,
    borderRadius: 20,
    marginRight: 15,
  },
  verticalContent: {
    flex: 1,
    justifyContent: 'center',
  },
  verticalTitle: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  offlineBanner: {
    backgroundColor: '#D47545',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 20,
  },
  offlineText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
});

