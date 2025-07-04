import firestore from '@react-native-firebase/firestore';

export const sampleMessages = [
  {
    text: "Good morning! Today is your day to shine. Every sunrise is a new opportunity to be the best version of yourself.",
    category: "motivational",
    mood: "energetic",
    length: "medium",
    tags: ["morning", "monday", "opportunity"]
  },
  {
    text: "Rise and conquer! Your potential is limitless. Let's make today amazing.",
    category: "motivational",
    mood: "energetic",
    length: "short",
    tags: ["morning", "energy", "goals"]
  },
  {
    text: "Take a deep breath. You are capable of amazing things. Trust the process and enjoy the journey.",
    category: "mindfulness",
    mood: "calm",
    length: "medium",
    tags: ["mindfulness", "calm", "journey"]
  },
  {
    text: "You've got this! Every step forward is progress. Keep moving toward your dreams.",
    category: "achievement",
    mood: "focused",
    length: "short",
    tags: ["progress", "goals", "focused"]
  },
  {
    text: "Gratitude is the key to happiness. Take a moment to appreciate the beautiful day ahead and all the possibilities it holds.",
    category: "mindfulness",
    mood: "grateful",
    length: "long",
    tags: ["gratitude", "happiness", "possibilities"]
  }
];

// Function to seed the database with sample messages
export const seedMessages = async () => {
  try {
    console.log('Starting to seed messages...');
    
    for (const message of sampleMessages) {
      await firestore()
        .collection('messages')
        .add({
          ...message,
          createdAt: firestore.FieldValue.serverTimestamp()
        });
    }
    
    console.log('Successfully seeded messages!');
  } catch (error) {
    console.error('Error seeding messages:', error);
  }
}; 