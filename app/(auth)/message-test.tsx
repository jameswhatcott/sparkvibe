import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import { messageService, Message } from '../../services/messageService';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MessageTest() {
  const [currentMessage, setCurrentMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(false);

  const getPersonalizedMessage = async () => {
    setLoading(true);
    try {
      const message = await messageService.getPersonalizedMessage();
      setCurrentMessage(message);
      console.log('Selected message:', message);
    } catch (error) {
      console.error('Error getting message:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Message Selection Test</Text>
        
        <Button 
          title={loading ? "Loading..." : "Get Personalized Message"} 
          onPress={getPersonalizedMessage}
          disabled={loading}
        />
        
        {currentMessage && (
          <View style={styles.messageContainer}>
            <Text style={styles.messageText}>{currentMessage.text}</Text>
            <View style={styles.messageMeta}>
              <Text style={styles.metaText}>Category: {currentMessage.category}</Text>
              <Text style={styles.metaText}>Mood: {currentMessage.mood}</Text>
              <Text style={styles.metaText}>Length: {currentMessage.length}</Text>
              <Text style={styles.metaText}>Tags: {currentMessage.tags.join(', ')}</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 0,
    flexGrow: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  messageContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  messageText: {
    fontSize: 18,
    lineHeight: 26,
    marginBottom: 15,
    color: '#333',
    fontStyle: 'italic',
  },
  messageMeta: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
  },
  metaText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
}); 