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
  Dimensions,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { fetchNews } from '../services/newsService';

const { width } = Dimensions.get('window');

// Conversational Headline Helper
const simplifyHeadline = (text: string) => {
  if (!text) return "";
  
  // Basic truncation & conversational tone logic
  let simple = text;
  
  // Example simplistic transformations
  simple = simple.replace(/announces/i, "says");
  simple = simple.replace(/launches/i, "just started");
  simple = simple.replace(/merger/i, "joining together");
  
  // Truncate to ~50 characters
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

export default function HomeScreen({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [featuredArticles, setFeaturedArticles] = useState<any[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      setLoading(true);
      setError(null);
      const news = await fetchNews();
      if (news && news.length > 0) {
        setFeaturedArticles(news.slice(0, 4));
        setArticles(news.slice(4));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load news');
    } finally {
      setLoading(false);
    }
  };

  const renderFeaturedItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.featuredCard} 
      activeOpacity={0.9}
      onPress={() => navigation.navigate('ArticleDetail', { article: item })}
    >
      <View style={styles.featuredWrapper}>
        <ImageWithFallback 
          uri={item.image_url} 
          style={styles.featuredImage} 
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.gradientOverlay}
        >
          <Text style={styles.featuredTitle} numberOfLines={2}>
            {simplifyHeadline(item.title)}
          </Text>
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );

  const renderVerticalItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.verticalCard} 
      activeOpacity={0.7}
      onPress={() => navigation.navigate('ArticleDetail', { article: item })}
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
        <Text style={styles.logoText}>Layman</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* CAROUSEL */}
        <View style={styles.carouselSection}>
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
          {/* Pagination Indicators below carousel */}
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
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.picksContainer}>
          {articles.map((item, index) => (
            <View key={item.article_id || index.toString()}>
              {renderVerticalItem({ item })}
            </View>
          ))}
        </View>
      </ScrollView>
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
  logoText: {
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
  carouselSection: {
    marginBottom: 20,
  },
  featuredCard: {
    width: width,
    paddingHorizontal: 20,
    height: 300,
  },
  featuredWrapper: {
    flex: 1,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: '#FF8A65',
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
    height: '60%',
    justifyContent: 'flex-end',
    padding: 24,
  },
  featuredTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: '#FF8A65',
    width: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#000',
  },
  viewAllText: {
    color: '#FF8A65',
    fontSize: 14,
    fontWeight: '700',
  },
  picksContainer: {
    paddingHorizontal: 15,
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
});
