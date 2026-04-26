import AsyncStorage from '@react-native-async-storage/async-storage';

const SAVED_ARTICLES_CACHE_KEY = 'cached_saved_articles';

/**
 * Caches the list of saved articles to local storage.
 * @param articles Array of article objects from Supabase
 */
export const cacheSavedArticles = async (articles: any[]) => {
  try {
    await AsyncStorage.setItem(SAVED_ARTICLES_CACHE_KEY, JSON.stringify(articles));
  } catch (error) {
    console.error('Error caching saved articles:', error);
  }
};

/**
 * Retrieves the cached list of saved articles from local storage.
 * @returns Array of article objects or empty array if none cached
 */
export const getCachedSavedArticles = async () => {
  try {
    const cached = await AsyncStorage.getItem(SAVED_ARTICLES_CACHE_KEY);
    return cached ? JSON.parse(cached) : [];
  } catch (error) {
    console.error('Error getting cached articles:', error);
    return [];
  }
};

/**
 * Optimistically adds an article to the local cache.
 */
export const addToCache = async (article: any) => {
  try {
    const cached = await getCachedSavedArticles();
    // Prevent duplicates
    const filtered = cached.filter((a: any) => a.article_id !== article.article_id);
    const updated = [article, ...filtered];
    await cacheSavedArticles(updated);
  } catch (error) {
    console.error('Error adding to cache:', error);
  }
};

/**
 * Optimistically removes an article from the local cache.
 */
export const removeFromCache = async (articleId: string) => {
  try {
    const cached = await getCachedSavedArticles();
    const updated = cached.filter((a: any) => a.article_id !== articleId);
    await cacheSavedArticles(updated);
  } catch (error) {
    console.error('Error removing from cache:', error);
  }
};

