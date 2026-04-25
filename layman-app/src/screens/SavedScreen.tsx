import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { supabase } from '../services/supabase';

const ImageWithFallback = ({ uri, style }: any) => {
  const [error, setError] = useState(false);

  if (!uri || error) {
    return (
      <View style={[style, { backgroundColor: '#FFE0B2', justifyContent: 'center', alignItems: 'center', padding: 8 }]}>
        <Ionicons name="image-outline" size={24} color="#E65100" style={{ marginBottom: 4 }} />
        <Text style={{ color: '#E65100', fontSize: 10, fontWeight: 'bold', textAlign: 'center' }}>
          No Image
        </Text>
      </View>
    );
  }

  return (
    <Image 
      source={{ uri }} 
      style={style} 
      onError={() => {
        console.log('SavedScreen Image Load Error URI:', uri);
        setError(true);
      }}
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

  // Allows it to refresh every time the user clicks on the "Saved" tab
  useFocusEffect(
    useCallback(() => {
      fetchSavedArticles();
    }, [])
  );

  const renderVerticalItem = ({ item }: { item: any }) => {
    // Reconstruct the article structure expected by ArticleDetailScreen
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
          <Text style={styles.verticalSource}>{item.source?.toUpperCase() || 'NEWS'}</Text>
          <Text style={styles.verticalTitle} numberOfLines={2}>{item.title}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Saved</Text>
        <TouchableOpacity>
          <Ionicons name="search" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* LIST */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#FF8A65" />
        </View>
      ) : savedArticles.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="bookmark-outline" size={64} color="#CCC" />
          <Text style={styles.emptyText}>No saved articles yet</Text>
        </View>
      ) : (
        <FlatList
          data={savedArticles}
          keyExtractor={(item) => item.id}
          renderItem={renderVerticalItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF0E5', // Warm peach background
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
    paddingTop: 60, // Adjust for safe area
    paddingBottom: 20,
    backgroundColor: '#FFF0E5',
  },
  headerText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#333',
    letterSpacing: -0.5,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  verticalCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  verticalImage: {
    width: 100,
    height: 100,
  },
  verticalContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  verticalSource: {
    fontSize: 11,
    color: '#FF8A65',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  verticalTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
    fontWeight: '500',
  }
});
