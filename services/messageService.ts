import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

// Message interface (moved from onboarding.tsx)
export interface Message {
  id: string;
  text: string;
  category: 'motivational' | 'achievement' | 'mindfulness' | 'productivity';
  mood: 'energetic' | 'calm' | 'focused' | 'grateful';
  length: 'short' | 'medium' | 'long';
  tags: string[]; // e.g., ['monday', 'workout', 'goals']
  createdAt: any; // Firestore Timestamp
}

// User preferences for message selection
export interface UserMessagePreferences {
  preferredCategories: string[];
  preferredMood: string;
  preferredLength: string;
  excludedTags: string[];
  lastMessageIds?: string[]; // To avoid repetition
}

// Message selection context
export interface MessageContext {
  dayOfWeek: string;
  timeOfDay: 'early' | 'morning' | 'afternoon' | 'evening';
  weather?: string;
  userMood?: string;
  hasWorkout?: boolean;
  hasMeetings?: boolean;
}

class MessageService {
  // Get a personalized wake-up message
  async getPersonalizedMessage(): Promise<Message | null> {
    try {
      const user = auth().currentUser;
      if (!user) {
        console.error('No authenticated user found');
        return null;
      }

      // Get user preferences
      const userPrefs = await this.getUserMessagePreferences(user.uid);
      
      // Get message context
      const context = this.getCurrentContext();
      
      // Get available messages
      const messages = await this.getAvailableMessages();
      
      // Select the best message
      const selectedMessage = this.selectBestMessage(messages, userPrefs, context);
      
      if (selectedMessage) {
        // Update user's last message IDs to avoid repetition
        await this.updateUserMessageHistory(user.uid, selectedMessage.id);
      }
      
      return selectedMessage;
    } catch (error) {
      console.error('Error getting personalized message:', error);
      return null;
    }
  }

  // Get user message preferences from Firestore
  private async getUserMessagePreferences(userId: string): Promise<UserMessagePreferences> {
    try {
      const userDoc = await firestore()
        .collection('users')
        .doc(userId)
        .get();
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return {
          preferredCategories: userData?.messagePreferences?.preferredCategories || ['motivational'],
          preferredMood: userData?.messagePreferences?.preferredMood || 'energetic',
          preferredLength: userData?.messagePreferences?.preferredLength || 'medium',
          excludedTags: userData?.messagePreferences?.excludedTags || [],
          lastMessageIds: userData?.messagePreferences?.lastMessageIds || []
        };
      }
    } catch (error) {
      console.error('Error getting user preferences:', error);
    }
    
    // Default preferences
    return {
      preferredCategories: ['motivational'],
      preferredMood: 'energetic',
      preferredLength: 'medium',
      excludedTags: [],
      lastMessageIds: []
    };
  }

  // Get current context for message selection
  private getCurrentContext(): MessageContext {
    const now = new Date();
    
    // Fix the day of week issue
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayOfWeek = days[now.getDay()];
    
    const hour = now.getHours();
    
    let timeOfDay: 'early' | 'morning' | 'afternoon' | 'evening';
    if (hour < 6) timeOfDay = 'early';
    else if (hour < 12) timeOfDay = 'morning';
    else if (hour < 17) timeOfDay = 'afternoon';
    else timeOfDay = 'evening';

    console.log('Current context:', { dayOfWeek, timeOfDay, hour });

    return {
      dayOfWeek,
      timeOfDay,
    };
  }

  // Get available messages from Firestore
  private async getAvailableMessages(): Promise<Message[]> {
    try {
      const messagesSnapshot = await firestore()
        .collection('messages')
        .get();
      
      const messages = messagesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      
      console.log('Available messages:', messages.length);
      return messages;
    } catch (error) {
      console.error('Error getting messages:', error);
      return [];
    }
  }

  // Select the best message based on preferences and context
  private selectBestMessage(
    messages: Message[], 
    userPrefs: UserMessagePreferences, 
    context: MessageContext
  ): Message | null {
    if (messages.length === 0) {
      console.log('No messages available');
      return null;
    }

    // Filter out recently used messages
    const availableMessages = messages.filter(
      msg => !userPrefs.lastMessageIds?.includes(msg.id)
    );

    // If no messages available, reset history and use all messages
    const messagesToUse = availableMessages.length > 0 ? availableMessages : messages;
    console.log('Messages to choose from:', messagesToUse.length);

    // Score each message
    const scoredMessages = messagesToUse.map(message => ({
      message,
      score: this.calculateMessageScore(message, userPrefs, context)
    }));

    // Sort by score (highest first) and return the best one
    scoredMessages.sort((a, b) => b.score - a.score);
    
    const selectedMessage = scoredMessages[0]?.message || null;
    console.log('Selected message:', selectedMessage?.text);
    
    return selectedMessage;
  }

  // Calculate a score for a message based on preferences and context
  private calculateMessageScore(
    message: Message, 
    userPrefs: UserMessagePreferences, 
    context: MessageContext
  ): number {
    let score = 0;

    // Category preference (highest weight)
    if (userPrefs.preferredCategories.includes(message.category)) {
      score += 10;
    }

    // Mood preference
    if (message.mood === userPrefs.preferredMood) {
      score += 8;
    }

    // Length preference
    if (message.length === userPrefs.preferredLength) {
      score += 5;
    }

    // Day-specific tags
    if (message.tags.includes(context.dayOfWeek)) {
      score += 6;
    }

    // Time-specific tags
    if (message.tags.includes(context.timeOfDay)) {
      score += 4;
    }

    // Avoid excluded tags
    const hasExcludedTag = message.tags.some(tag => 
      userPrefs.excludedTags.includes(tag)
    );
    if (hasExcludedTag) {
      score -= 15;
    }

    // Random factor to add variety
    score += Math.random() * 3;

    return score;
  }

  // Update user's message history to avoid repetition
  private async updateUserMessageHistory(userId: string, messageId: string): Promise<void> {
    try {
      const userDoc = await firestore()
        .collection('users')
        .doc(userId)
        .get();
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const currentHistory = userData?.messagePreferences?.lastMessageIds || [];
        
        // Keep only the last 10 message IDs
        const newHistory = [...currentHistory, messageId].slice(-10);
        
        await firestore()
          .collection('users')
          .doc(userId)
          .update({
            'messagePreferences.lastMessageIds': newHistory,
            updatedAt: firestore.FieldValue.serverTimestamp()
          });
      }
    } catch (error) {
      console.error('Error updating message history:', error);
    }
  }

  // Add a new message to the database (for admin use)
  async addMessage(messageData: Omit<Message, 'id' | 'createdAt'>): Promise<string> {
    try {
      const docRef = await firestore()
        .collection('messages')
        .add({
          ...messageData,
          createdAt: firestore.FieldValue.serverTimestamp()
        });
      
      return docRef.id;
    } catch (error) {
      console.error('Error adding message:', error);
      throw error;
    }
  }

  // Update user message preferences
  async updateUserPreferences(userId: string, preferences: Partial<UserMessagePreferences>): Promise<void> {
    try {
      await firestore()
        .collection('users')
        .doc(userId)
        .update({
          'messagePreferences': preferences,
          updatedAt: firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }
}

export const messageService = new MessageService();