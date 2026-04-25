const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const MODEL_NAME = 'gemini-1.5-flash';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

export const askLaymanAI = async (articleContext, userMessage, chatHistory = []) => {
  if (!API_KEY || API_KEY === 'YOUR_GEMINI_API_KEY') {
    throw new Error('Gemini API key is missing. Please add it to your .env file.');
  }

  // Build the strict layman prompt
  const systemInstruction = `
    You are "Layman", a highly intelligent but extremely simple AI assistant.
    Your job is to explain concepts related to the following news article context:
    "${articleContext}"
    
    CRITICAL RULES:
    1. Your response MUST be a maximum of 1 or 2 sentences.
    2. You MUST use absolutely simple, everyday language meant for a 10-year-old.
    3. NO technical jargon, NO complex words, NO markdown formatting (like bold/asterisks) in your explanation.
    4. Answer the user's question directly based on the article context.
  `;

  // Convert previous history to Gemini format if we want continuous conversation,
  // but for simplicity and strict control, we send the instruction + history as a compiled block.
  let compiledHistory = '';
  chatHistory.forEach(msg => {
    compiledHistory += `\n${msg.isBot ? 'Layman: ' : 'User: '}${msg.text}`;
  });

  const fullPrompt = `${systemInstruction}\n\nPast Chat Context:${compiledHistory}\n\nUser: ${userMessage}\nLayman:`;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: fullPrompt }]
          }
        ],
        generationConfig: {
          temperature: 0.3, // Low temperature for factual, consistent answers
          maxOutputTokens: 100, // Ensuring it stays brief logically
        }
      })
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error?.message || 'Failed to fetch from Gemini');
    }

    const data = await response.json();
    
    // Extract the text from Gemini response structure
    const botText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (botText) {
      return botText.trim();
    } else {
      throw new Error('Invalid response structure from Gemini API');
    }

  } catch (error) {
    console.error('aiService Error:', error);
    throw error;
  }
};
