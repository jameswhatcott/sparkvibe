import { useState } from "react";
import { Button, View, StyleSheet, KeyboardAvoidingView, TextInput, ActivityIndicator, Text } from "react-native"; 
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useRouter } from 'expo-router';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const signUp = async() => {
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;
      
      await firestore()
        .collection('users')
        .doc(user.uid)
        .set({
          email: user.email,
          onboardingCompleted: false,
          onboardingData: {
            name: '',
            wakeTime: '',
            notificationPreferences: {}
          },
          createdAt: firestore.FieldValue.serverTimestamp(),
          updatedAt: firestore.FieldValue.serverTimestamp()
        });

      alert('Account created successfully!');
    } catch (error: any) {
      const errorMessage = error?.message || 'Registration failed';
      alert('Registration failed: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior="padding">
        <Text style={styles.title}>Create Account</Text>
        
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="Email"
          textContentType="emailAddress"
          autoComplete="email"
        />
        
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Password"
          textContentType="newPassword"
          autoComplete="new-password"
          autoCorrect={false}
          spellCheck={false}
        />
        
        <TextInput
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          placeholder="Confirm Password"
          textContentType="newPassword"
          autoComplete="new-password"
          autoCorrect={false}
          spellCheck={false}
        />
        
        {loading ? (
          <ActivityIndicator size="large" style={styles.loader} />
        ) : (
          <>
            <Button onPress={signUp} title="Create Account" />
            <Button onPress={goBack} title="Back to Login" />
          </>
        )}
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    marginVertical: 4,
    height: 50,
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    backgroundColor: '#fff',
  },
  loader: {
    marginTop: 20,
  },
});