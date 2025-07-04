import { useState } from "react";
import { Button, View, Text, StyleSheet, KeyboardAvoidingView, TextInput } from "react-native"; 
import auth from '@react-native-firebase/auth';
import { useRouter } from 'expo-router';

export default function Index() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const signIn = async () => {
    try {
      await auth().signInWithEmailAndPassword(email, password);
    } catch (error: any) {
      // React Native Firebase errors have a different structure
      const errorMessage = error?.message || 'Sign in failed';
      alert('Sign in failed: ' + errorMessage);
    }
  }

  const navigateToSignup = () => {
    router.push('/(public)/signup');
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior="padding">
        <Text style={styles.title}>Welcome to SparkVibe!</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="Email"
          />
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Password"
          textContentType="password"
          autoComplete="password"
          autoCorrect={false}
          spellCheck={false}
        />
        <Button onPress={navigateToSignup} title="Sign Up" />
        <Button onPress={signIn} title="Login" />
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    flex: 1,
    justifyContent: 'center',
  },
  input: {
    marginVertical: 4,
    height: 50,
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    backgroundColor: '#fff',

  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },



})
