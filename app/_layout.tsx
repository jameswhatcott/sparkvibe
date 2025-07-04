import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import firestore from '@react-native-firebase/firestore';
import { Stack, useRouter, useSegments } from "expo-router";
import { useState, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";

export default function RootLayout() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>();
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);
  const router = useRouter();
  const segments = useSegments();
  
  const onAuthStateChanged = (user: FirebaseAuthTypes.User | null) => {
    console.log('onAuthStateChanged', user);
    setUser(user);
    if (initializing) setInitializing(false);
  }

  const checkOnboardingStatus = async (userId: string) => {
    try {
      const userDoc = await firestore()
        .collection('users')
        .doc(userId)
        .get();
      
      if (userDoc.exists) {
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

  useEffect(() => {
    if(initializing || onboardingCompleted === null) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inPublicGroup = segments[0] === '(public)';

    if(user && !inAuthGroup) {
      if (onboardingCompleted) {
        router.replace('/(auth)/home');
      } else {
        router.replace('/(auth)/onboarding');
      }
    } else if (!user && inAuthGroup) {
      router.replace('/(public)');
    }
  }, [user, initializing, onboardingCompleted])

  if (initializing)
    return (
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
         }}>
        <ActivityIndicator size="large" />
      </View>
  );
  
  return (
    <Stack>
      <Stack.Screen name="(public)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
    </Stack>
  );
}
