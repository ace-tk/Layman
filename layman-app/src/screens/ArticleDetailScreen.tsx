import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  Share, 
  Dimensions,
  SafeAreaView
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '../services/supabase';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

// Mock summaries in layman's terms
// 2 sentences, ~30 words, designed to fill 6 lines
const MOCK_SUMMARIES = [
  "Elon Musk's new AI company, xAI, is building a super-smart chatbot to compete with ChatGPT. They recently raised a huge $6 billion to make it happen and become a top player.",
  "Initial reactions from leading analysts indicate a cautious but optimistic outlook regarding the long-term financial implications. Investors are closely monitoring the regulatory landscape to see how quickly these changes will be officially adopted.",
  "As companies rush to adapt, consumers can expect to see rapid innovations hitting the shelves within the next quarter. The ultimate success of this initiative will depend largely on shifting global supply chains."
];

export default function ArticleDetailScreen({ route, navigation }: any) {
  const { colors, isDark } = useTheme();
  const { article } = route.params || { article: null };
  const [activeIndex, setActiveIndex] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  // Fallback data
  const articleId = article?.article_id || 'mock-id';
  const articleTitle = article?.title || "Elon Musk's xAI Builds a Smarter Chatbot Than ChatGPT";
  const articleImage = article?.image_url;
  const articleLink = article?.link || "https://newsdata.io";

  useEffect(() => {
    checkBookmarkStatus();
  }, [articleId]);

  const checkBookmarkStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data } = await supabase
        .from('saved_articles')
        .select('id')
        .eq('user_id', user.id)
        .eq('article_id', articleId)
        .single();

      if (data) setIsBookmarked(true);
    } catch (error) {}
  };

  const handleBookmarkToggle = async () => {
    if (!userId || isProcessing || !article) return;
    setIsProcessing(true);
    try {
      if (isBookmarked) {
        await supabase.from('saved_articles').delete().eq('user_id', userId).eq('article_id', articleId);
        setIsBookmarked(false);
      } else {
        await supabase.from('saved_articles').insert({
          user_id: userId,
          article_id: articleId,
          title: articleTitle,
          source: article?.source_id || 'NEWS',
          image_url: articleImage,
          link: articleLink
        });
        setIsBookmarked(true);
      }
    } catch (error) {
      console.log('Error toggling bookmark', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({ message: `Read this on Layman: ${articleTitle}\n\n${articleLink}` });
    } catch (error) {
      console.log('Error sharing', error);
    }
  };

  const openOriginalArticle = async () => {
    try {
      await WebBrowser.openBrowserAsync(articleLink);
    } catch (error) {
      console.log('Error opening browser', error);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        
        {/* TOP BAR */}
        <View style={styles.topBar}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={[styles.backButton, { backgroundColor: isDark ? '#1F1F1F' : '#F5E6D3' }]}
          >
            <Ionicons name="chevron-back" size={24} color={isDark ? "#AAA" : "#555"} />
          </TouchableOpacity>
          
          <View style={styles.rightIcons}>
            <TouchableOpacity onPress={openOriginalArticle} style={styles.actionIconButton}>
              <Ionicons name="link-outline" size={24} color={isDark ? "#AAA" : "#555"} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleBookmarkToggle} disabled={isProcessing} style={styles.actionIconButton}>
              <Ionicons name={isBookmarked ? "bookmark" : "bookmark-outline"} size={22} color={isBookmarked ? "#D47545" : (isDark ? "#AAA" : "#555")} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShare} style={styles.actionIconButton}>
              <Ionicons name="share-outline" size={24} color={isDark ? "#AAA" : "#555"} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* HEADLINE */}
          <Text style={[styles.headline, { color: colors.text }]} numberOfLines={3}>
            {articleTitle}
          </Text>

          {/* ARTICLE IMAGE */}
          <View style={styles.imageContainer}>
            {(!articleImage || imageError) ? (
              <View style={[styles.heroImage, { backgroundColor: isDark ? '#1F1F1F' : '#F5E6D3', justifyContent: 'center', alignItems: 'center' }]}>
                <Ionicons name="image-outline" size={48} color="#D47545" />
              </View>
            ) : (
              <Image 
                source={{ uri: articleImage }} 
                style={styles.heroImage} 
                onError={() => setImageError(true)}
              />
            )}
          </View>

          {/* CONTENT CARDS */}
          <View style={styles.swipeSection}>
            <ScrollView 
              horizontal 
              pagingEnabled 
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(event) => {
                const slideSize = event.nativeEvent.layoutMeasurement.width;
                const index = event.nativeEvent.contentOffset.x / slideSize;
                setActiveIndex(Math.round(index));
              }}
            >
              {MOCK_SUMMARIES.map((text, index) => (
                <View key={index} style={styles.cardWrapper}>
                  <View style={[styles.infoCard, { backgroundColor: isDark ? '#1F1F1F' : '#FFF9F5' }]}>
                    <Text style={[styles.laymanText, { color: isDark ? '#EEE' : '#333' }]} numberOfLines={6}>
                      {text}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
            
            {/* INDICATORS */}
            <View style={styles.pagination}>
              {MOCK_SUMMARIES.map((_, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.dot, 
                    { backgroundColor: isDark ? '#333' : '#E0C9B1' },
                    activeIndex === index && styles.activeDot
                  ]} 
                />
              ))}
            </View>
          </View>
        </ScrollView>

        {/* ASK LAYMAN BUTTON */}
        <View style={styles.bottomBar}>
          <TouchableOpacity 
            style={styles.askLaymanBtn}
            onPress={() => navigation.navigate('Chat', { article })}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="sparkles" size={20} color="#FFF" style={{ marginRight: 10 }} />
            <Text style={styles.askLaymanText}>Ask Layman</Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIconButton: {
    marginLeft: 12,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 120,
  },
  headline: {
    fontSize: 32,
    fontWeight: '800',
    paddingHorizontal: 25,
    marginTop: 20,
    marginBottom: 25,
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  imageContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  heroImage: {
    width: width - 40,
    height: (width - 40) * 0.6,
    borderRadius: 24,
    resizeMode: 'cover',
  },
  swipeSection: {
    alignItems: 'center',
  },
  cardWrapper: {
    width: width,
    paddingHorizontal: 24,
  },
  infoCard: {
    borderRadius: 24,
    padding: 24,
    minHeight: 180,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  laymanText: {
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '500',
    textAlign: 'left',
  },
  pagination: {
    flexDirection: 'row',
    marginTop: 25,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: '#D47545',
    width: 24,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingHorizontal: 20,
    paddingBottom: 25,
    paddingTop: 10,
    backgroundColor: 'transparent',
  },
  askLaymanBtn: {
    backgroundColor: '#D47545', // Terracotta orange
    flexDirection: 'row',
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#D47545',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  askLaymanText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
