import React, { useState } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '../services/supabase';

const { width } = Dimensions.get('window');

// Mock summaries to meet the constraint: 2 sentences, 28-35 words, 6 lines
const MOCK_SUMMARIES = [
  "This significant new development highlights a major turning point in the industry's approach to sustainable design. Experts believe these emerging trends will reshape how competitors bring their future products to broader markets.",
  "Initial reactions from leading analysts indicate a cautious but optimistic outlook regarding the long-term financial implications. Investors are closely monitoring the regulatory landscape to see how quickly these changes will be officially adopted.",
  "As companies rush to adapt, consumers can expect to see rapid innovations hitting the shelves within the next quarter. The ultimate success of this initiative will depend largely on shifting global supply chains."
];


export default function ArticleDetailScreen({ route, navigation }: any) {
  // Grab the article data passed from the HomeScreen
  const { article } = route.params || { article: null };
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Bookmark states
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [imageError, setImageError] = useState(false);

  // Use fallback if article is missing
  const articleId = article?.article_id || 'mock-id';
  const articleTitle = article?.title || "Technology giants announce unexpected merger in the latest market shakeup affecting millions of users.";
  const articleImage = article?.image_url;
  const articleLink = article?.link || "https://newsdata.io";

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this article on Layman: ${articleTitle}\n\n${articleLink}`
      });
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

  React.useEffect(() => {
    checkBookmarkStatus();
  }, [articleId]);

  const checkBookmarkStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      setUserId(user.id);

      const { data, error } = await supabase
        .from('saved_articles')
        .select('id')
        .eq('user_id', user.id)
        .eq('article_id', articleId)
        .single();

      if (data) {
        setIsBookmarked(true);
      }
    } catch (error) {
      // Ignore if not found (single throws error if 0 rows)
    }
  };

  const handleBookmarkToggle = async () => {
    if (!userId || isProcessing || !article) return;

    setIsProcessing(true);
    try {
      if (isBookmarked) {
        // Remove bookmark
        await supabase
          .from('saved_articles')
          .delete()
          .eq('user_id', userId)
          .eq('article_id', articleId);
        
        setIsBookmarked(false);
      } else {
        // Add bookmark
        await supabase
          .from('saved_articles')
          .insert({
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* TOP ICONS BAR */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          
          <View style={styles.rightIcons}>
            <TouchableOpacity onPress={openOriginalArticle} style={styles.iconButton}>
              <Ionicons name="open-outline" size={24} color="#333" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleBookmarkToggle} disabled={isProcessing} style={styles.iconButton}>
              <Ionicons name={isBookmarked ? "bookmark" : "bookmark-outline"} size={24} color={isBookmarked ? "#E65100" : "#333"} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShare} style={styles.iconButton}>
              <Ionicons name="share-social-outline" size={24} color="#333" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* TITLE */}
          <Text style={styles.title} numberOfLines={2}>
            {articleTitle}
          </Text>

          {/* FULL WIDTH IMAGE */}
          {(!articleImage || imageError) ? (
            <View style={[styles.heroImage, { backgroundColor: '#FFE0B2', justifyContent: 'center', alignItems: 'center' }]}>
              <Ionicons name="image-outline" size={48} color="#E65100" style={{ marginBottom: 8 }} />
              <Text style={{ color: '#E65100', fontSize: 16, fontWeight: 'bold' }}>
                No Image Available
              </Text>
            </View>
          ) : (
            <Image 
              source={{ uri: articleImage }} 
              style={styles.heroImage} 
              onError={() => {
                console.log('ArticleDetail Image Load Error URI:', articleImage);
                setImageError(true);
              }}
            />
          )}

          {/* SWIPEABLE CONTENT CARDS */}
          <View style={styles.swipeContainer}>
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
                <View key={index} style={styles.cardContainer}>
                  <View style={styles.card}>
                    <Text style={styles.cardText} numberOfLines={6}>
                      {text}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
            
            {/* INDICATOR DOTS */}
            <View style={styles.pagination}>
              {MOCK_SUMMARIES.map((_, index) => (
                <View 
                  key={index} 
                  style={[styles.dot, activeIndex === index && styles.activeDot]} 
                />
              ))}
            </View>
          </View>
        </ScrollView>

        {/* FIXED BOTTOM BUTTON */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity style={styles.askButton}>
            <Ionicons name="chatbubbles-outline" size={20} color="#fff" style={{marginRight: 8}} />
            <Text style={styles.askButtonText}>Ask Layman</Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFF0E5',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFF0E5',
  },
  rightIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
  },
  scrollContent: {
    paddingBottom: 100, // Space for fixed button
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#000',
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
    lineHeight: 32,
  },
  heroImage: {
    width: width,
    height: 250,
    resizeMode: 'cover',
  },
  swipeContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  cardContainer: {
    width: width,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    justifyContent: 'center'
  },
  cardText: {
    fontSize: 18,
    lineHeight: 26,
    color: '#333',
    fontWeight: '500',
    textAlign: 'center',
    ellipsizeMode: 'tail',
  },
  pagination: {
    flexDirection: 'row',
    marginTop: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(230, 81, 0, 0.2)', // Light orange
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: '#E65100', // Deep orange
    width: 16,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'transparent',
  },
  askButton: {
    backgroundColor: '#000',
    flexDirection: 'row',
    borderRadius: 30,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  askButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
