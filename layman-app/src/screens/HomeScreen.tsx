import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  ActivityIndicator, 
  TouchableOpacity, 
  ScrollView,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { fetchNews } from '../services/newsService';

const { width } = Dimensions.get('window');

// Fallback image for articles without one
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&q=80';

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [featuredArticles, setFeaturedArticles] = useState<any[]>([]);
  
  // Carousel Page Indicator State
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const news = await fetchNews();
      
      // We will use the first 3 for the carousel, the rest for the vertical list
      if (news && news.length > 0) {
        setFeaturedArticles(news.slice(0, 3));
        setArticles(news.slice(3));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load news');
    } finally {
      setLoading(false);
    }
  };

  const renderFeaturedItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.featuredCard} activeOpacity={0.9}>
      <Image 
        source={{ uri: item.image_url || FALLBACK_IMAGE }} 
        style={styles.featuredImage} 
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.gradientOverlay}
      >
        <View style={styles.featuredContent}>
          <Text style={styles.featuredSource}>{item.source_id?.toUpperCase() || 'NEWS'}</Text>
          <Text style={styles.featuredTitle} numberOfLines={2}>{item.title}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderVerticalItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.verticalCard} activeOpacity={0.7}>
      <Image 
        source={{ uri: item.image_url || FALLBACK_IMAGE }} 
        style={styles.verticalImage} 
      />
      <View style={styles.verticalContent}>
        <Text style={styles.verticalSource}>{item.source_id?.toUpperCase() || 'NEWS'}</Text>
        <Text style={styles.verticalTitle} numberOfLines={2}>{item.title}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF8A65" />
        <Text style={styles.loadingText}>Fetching latest news...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#FF8A65" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadNews}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.logoText}>Layman</Text>
        <TouchableOpacity>
          <Ionicons name="search" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* CAROUSEL */}
        <View style={styles.carouselContainer}>
          <FlatList
            data={featuredArticles}
            keyExtractor={(item, index) => item.article_id || index.toString()}
            renderItem={renderFeaturedItem}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const slideSize = event.nativeEvent.layoutMeasurement.width;
              const index = event.nativeEvent.contentOffset.x / slideSize;
              setActiveIndex(Math.round(index));
            }}
          />
          <View style={styles.pagination}>
            {featuredArticles.map((_, index) => (
              <View 
                key={index} 
                style={[
                  styles.dot, 
                  activeIndex === index ? styles.activeDot : null
                ]} 
              />
            ))}
          </View>
        </View>

        {/* TODAY'S PICKS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Picks</Text>
        </View>
        
        <FlatList
          data={articles}
          keyExtractor={(item, index) => item.article_id || index.toString()}
          renderItem={renderVerticalItem}
          scrollEnabled={false} // Nested inside ScrollView
          contentContainerStyle={styles.listContent}
        />
      </ScrollView>
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
    backgroundColor: '#FFF0E5',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60, // Adjust for safe area
    paddingBottom: 15,
    backgroundColor: '#FFF0E5',
  },
  logoText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#E65100', // Deep warm orange
    letterSpacing: -0.5,
  },
  carouselContainer: {
    height: 250,
    marginBottom: 20,
  },
  featuredCard: {
    width: width,
    height: 250,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
    justifyContent: 'flex-end',
    padding: 20,
  },
  featuredContent: {
    marginBottom: 10,
  },
  featuredSource: {
    color: '#FF8A65', // Lighter peach/orange for contrast against dark gradient
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  featuredTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 26,
  },
  pagination: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#FFF',
    width: 14,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
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
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontWeight: '500',
  },
  errorText: {
    textAlign: 'center',
    marginVertical: 15,
    color: '#666',
  },
  retryButton: {
    backgroundColor: '#E65100',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});
