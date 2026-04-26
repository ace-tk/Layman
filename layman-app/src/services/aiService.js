export const askLaymanAI = async (articleContext, userMessage, chatHistory = [], audioBase64 = null) => {
  const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

  if (!API_KEY || API_KEY === 'YOUR_GEMINI_API_KEY') {
    throw new Error('Gemini API key is missing. Please add it to your .env file and restart Expo.');
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

  // Convert previous history to Gemini format
  let compiledHistory = '';
  chatHistory.forEach(msg => {
    compiledHistory += `\n${msg.isBot ? 'Layman: ' : 'User: '}${msg.text}`;
  });

  const parts = [];

  if (audioBase64) {
    // For voice input, we ask Gemini to transcribe and then follow the system instruction
    parts.push({ 
      text: `${systemInstruction}\n\nPast Chat Context:${compiledHistory}\n\nIMPORTANT: The user has sent a voice message. Please transcribe their question exactly and then answer it using the Layman rules above.` 
    });
    parts.push({
      inline_data: {
        mime_type: "audio/aac", // expo-av records in AAC/m4a
        data: audioBase64
      }
    });
  } else {
    // Standard text input
    const fullPrompt = `${systemInstruction}\n\nPast Chat Context:${compiledHistory}\n\nUser: ${userMessage}\nLayman:`;
    parts.push({ text: fullPrompt });
  }

  const payload = {
    contents: [
      {
        parts: parts
      }
    ]
  };

  const modelName = 'gemini-2.5-flash';
  const API_URL = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${API_KEY}`;

  console.log(`[DEBUG] Calling Gemini API (Model: ${modelName}) ${audioBase64 ? 'with VOICE' : 'with TEXT'}`);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const statusCode = response.status;
    const responseText = await response.text();

    console.log(`[DEBUG] Status: ${statusCode}`);
    
    if (!response.ok) {
      throw new Error(`API failed with status ${statusCode}: ${responseText}`);
    }

    const data = JSON.parse(responseText);
    const botText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (botText) {
      return botText.trim();
    } else {
      throw new Error(`Invalid response structure: ${responseText}`);
    }
  } catch (error) {
    console.error(`[DEBUG] Gemini API Error:`, error.message);
    throw error;
  }
};
