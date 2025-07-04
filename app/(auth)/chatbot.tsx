import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import ChatBot from '../components/ChatBot';

export default function ChatBotScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ChatBot />
    </SafeAreaView>
  );
} 