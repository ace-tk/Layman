const API_KEY = process.env.EXPO_PUBLIC_NEWSDATA_API_KEY;
const BASE_URL = 'https://newsdata.io/api/1/news';

export const fetchNews = async (category = 'business,technology') => {
  if (!API_KEY || API_KEY === 'YOUR_NEWSDATA_API_KEY') {
    throw new Error('NewsData API key is missing. Please add it to your .env file.');
  }

  try {
    // English language, specific categories
    const url = `${BASE_URL}?apikey=${API_KEY}&language=en&category=${category}&image=1`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch news: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.status === 'success') {
      return data.results;
    } else {
      throw new Error(data.message || 'Error occurred while fetching news.');
    }
  } catch (error) {
    console.error('newsService Error:', error);
    throw error;
  }
};
