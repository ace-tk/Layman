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
import { useTheme } from '../context/ThemeContext';
import { triggerLightHaptic } from '../services/haptics';


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

export default function HomeScreen({ navigation }: any) {
  const { colors, isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [featuredArticles, setFeaturedArticles] = useState<any[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      setLoading(true);
      setErrorStatus(null);
      const news = await fetchNews();
      if (news && news.length > 0) {
        setFeaturedArticles(news.slice(0, 4));
        setArticles(news.slice(4));
      }
    } catch (err: any) {
      setErrorStatus(err.message || 'Failed to load news');
    } finally {
      setLoading(false);
    }
  };

  const renderFeaturedItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.featuredCard} 
      activeOpacity={0.9}
      onPress={() => {
        triggerLightHaptic();
        navigation.navigate('ArticleDetail', { article: item });
      }}
    >

      <View style={styles.featuredWrapper}>
        <ImageWithFallback 
          uri={item.image_url} 
          style={styles.featuredImage} 
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.85)']}
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
      style={[styles.verticalCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }]} 
      activeOpacity={0.7}
      onPress={() => {
        triggerLightHaptic();
        navigation.navigate('ArticleDetail', { article: item });
      }}
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

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#FF8A65" />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={[styles.logoText, { color: colors.text }]}>Layman</Text>
        <TouchableOpacity 
          style={[styles.searchButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' }]}
          onPress={() => triggerLightHaptic()}
        >

          <Ionicons name="search" size={24} color={colors.text} />
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
                  { backgroundColor: isDark ? '#333' : 'rgba(0,0,0,0.1)' },
                  activeIndex === index ? styles.activeDot : null
                ]} 
              />
            ))}
          </View>
        </View>

        {/* TODAY'S PICKS */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Today's Picks</Text>
          <TouchableOpacity onPress={() => {
            triggerLightHaptic();
            navigation.navigate('Saved');
          }}>

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
  logoText: {
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
});
