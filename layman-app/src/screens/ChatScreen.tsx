import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  Keyboard,
  SafeAreaView,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { askLaymanAI } from '../services/aiService';

export default function ChatScreen({ route, navigation }: any) {
  const { article } = route.params;
  const articleTitle = article?.title || "Technology news article";
  const articleDescription = article?.description || articleTitle;
  
  // Combine title and description for rich context
  const contextBlock = `Title: ${articleTitle}\nDescription: ${articleDescription}`;

  const [messages, setMessages] = useState<any[]>([
    { id: 'start', text: 'Hi! I am Layman. What would you like to know about this article?', isBot: true }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const flatListRef = useRef<FlatList>(null);

  // Dynamic Suggestion Chips based locally on context to be fast
  const suggestions = [
    "Explain this simply.",
    "Why is this important?",
    "Who does this affect?"
  ];

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg = { id: Date.now().toString(), text, isBot: false };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);
    Keyboard.dismiss();

    try {
      // Pass the context, user's input, and previous messages
      const response = await askLaymanAI(contextBlock, text, messages.filter(m => m.id !== 'start'));
      
      const botMsg = { id: (Date.now() + 1).toString(), text: response, isBot: true };
      setMessages(prev => [...prev, botMsg]);
    } catch (error: any) {
      const errorMsg = { 
        id: (Date.now() + 1).toString(), 
        text: "I'm sorry, I encountered an error connecting to my brain. Please check your API key.", 
        isBot: true 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: any }) => (
    <View style={[styles.messageBubble, item.isBot ? styles.botBubble : styles.userBubble]}>
      {item.isBot && <Ionicons name="sparkles" size={16} color="#FFF" style={styles.botIcon} />}
      <Text style={[styles.messageText, item.isBot ? styles.botText : styles.userText]}>
        {item.text}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.headerTitle} numberOfLines={1}>Ask Layman</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
            <Ionicons name="close-circle" size={28} color="#666" />
          </TouchableOpacity>
        </View>

        {/* CHAT MESSAGES */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.chatContainer}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {/* LOADING INDICATOR */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#E65100" />
            <Text style={styles.loadingText}>Layman is thinking...</Text>
          </View>
        )}

        {/* SUGGESTION CHIPS */}
        {messages.length === 1 && !isLoading && (
          <View style={styles.suggestionsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {suggestions.map((suggestion, idx) => (
                <TouchableOpacity 
                  key={idx} 
                  style={styles.chip}
                  onPress={() => sendMessage(suggestion)}
                >
                  <Text style={styles.chipText}>{suggestion}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* INPUT BAR */}
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="mic-outline" size={24} color="#666" />
          </TouchableOpacity>
          <TextInput
            style={styles.textInput}
            placeholder="Type your question..."
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={() => sendMessage(inputText)}
            returnKeyType="send"
          />
          <TouchableOpacity 
            style={[styles.iconButton, styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            disabled={!inputText.trim() || isLoading}
            onPress={() => sendMessage(inputText)}
          >
            <Ionicons name="send" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
        
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF0E5',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFF0E5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    backgroundColor: '#FFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
  },
  chatContainer: {
    padding: 16,
    paddingBottom: 20,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 14,
    borderRadius: 20,
    marginBottom: 12,
    flexDirection: 'row',
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#E65100',
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#FFF',
    borderBottomRightRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  botIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  botText: {
    color: '#FFF',
    flexShrink: 1,
  },
  userText: {
    color: '#333',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  loadingText: {
    marginLeft: 8,
    color: '#E65100',
    fontSize: 14,
    fontStyle: 'italic',
  },
  suggestionsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  chip: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  chipText: {
    color: '#E65100',
    fontSize: 14,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    marginHorizontal: 8,
    maxHeight: 100,
  },
  iconButton: {
    padding: 8,
  },
  sendButton: {
    backgroundColor: '#E65100',
    borderRadius: 20,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#CCC',
  }
});
