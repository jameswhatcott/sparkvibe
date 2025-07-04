import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import firestore from '@react-native-firebase/firestore';
import { Stack, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";

export default function RootLayout() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>();
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);
  const router = useRouter();
  
  function onAuthStateChanged(user: FirebaseAuthTypes.User | null) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);

  useEffect(() => {
    if (user) {
      checkOnboardingStatus(user.uid);
    } else {
      setOnboardingCompleted(null);
    }
  }, [user]);

  const checkOnboardingStatus = async (userId: string) => {
    try {
      const userDoc = await firestore()
        .collection('users')
        .doc(userId)
        .get();
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setOnboardingCompleted(userData?.onboardingCompleted || false);
      } else {
        setOnboardingCompleted(false);
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setOnboardingCompleted(false);
    }
  };

  // Only navigate after initialization is complete
  useEffect(() => {
    if (!initializing) { // Wait for auth to initialize
      if (user) {
        if (onboardingCompleted === false) {
          router.replace('/(auth)/onboarding');
        } else {
          router.replace('/(auth)/home');
        }
      } else {
        router.replace('/(public)');
      }
    }
  }, [user, onboardingCompleted, initializing, router]);

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  
  return (
    <Stack>
      <Stack.Screen name="(public)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
    </Stack>
  );
}
