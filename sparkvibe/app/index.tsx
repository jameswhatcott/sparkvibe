import { useState } from "react";
import { Button, View, StyleSheet, KeyboardAvoidingView, TextInput, ActivityIndicator } from "react-native"; 
import auth from '@react-native-firebase/auth';

export default function Index() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const signUp = async() => {
    setLoading(true);
    try {
      await auth().createUserWithEmailAndPassword(email, password);
      alert('Check your emails!');
    } catch (e: any) {
      alert('Registration failed: ' + err.message);
    }
    setLoading(false);
  }

  const signIn = () => {

  }

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior="pading">
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
        />
        <Button onPress={signUp} title="Sign Up" />
        <Button onPress={signIn} title="Sign In" />
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



})
