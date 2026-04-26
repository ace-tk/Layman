import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../services/supabase';

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
  const [error, setError] = useState(false);

  if (!uri || error) {
    return (
      <View style={[style, { backgroundColor: '#FFE0B2', justifyContent: 'center', alignItems: 'center' }]}>
        <Ionicons name="image-outline" size={32} color="#E65100" />
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
  const [savedArticles, setSavedArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSavedArticles = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('saved_articles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching bookmarks:', error);
      } else {
        setSavedArticles(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

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
        style={styles.verticalCard} 
        activeOpacity={0.7}
        onPress={() => navigation.navigate('ArticleDetail', { article: reconstructedArticle })}
      >
        <ImageWithFallback 
          uri={item.image_url} 
          style={styles.verticalImage} 
        />
        <View style={styles.verticalContent}>
          <Text style={styles.verticalTitle} numberOfLines={2}>
            {simplifyHeadline(item.title)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF8A65" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Saved</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* LIST */}
      {savedArticles.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="bookmark-outline" size={60} color="#D47545" />
          </View>
          <Text style={styles.emptyTitle}>Nothing here yet</Text>
          <Text style={styles.emptySubtitle}>Articles you save will show up here</Text>
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
    backgroundColor: '#FFF0E5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF0E5',
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
    color: '#000',
    letterSpacing: -1,
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.04)',
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
    backgroundColor: 'rgba(0,0,0,0.05)',
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
    color: '#000',
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
    backgroundColor: '#FFEAD6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#000',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  }
});
