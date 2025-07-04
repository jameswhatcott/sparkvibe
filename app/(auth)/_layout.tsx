import { Stack } from 'expo-router';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function AuthLayout() {
  return (
    <Tabs 
      screenOptions={{ 
        headerShown: false,
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
        }
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="message-test"
        options={{
          title: 'Test',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="flask" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="onboarding"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="components"
        options={{
          href: null, // Hide the entire components folder
        }}
      />
    </Tabs>
  );
}