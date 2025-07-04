import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

interface NameStepProps {
  onNext: (name: string) => void;
  onSkip: () => void;
  initialValue?: string;
}

export default function NameStep({ onNext, onSkip, initialValue = '' }: NameStepProps) {
  const [name, setName] = useState(initialValue);
  const [error, setError] = useState('');

  const handleNext = () => {
    if (name.trim().length === 0) {
      setError('Please enter your name');
      return;
    }
    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }
    setError('');
    onNext(name.trim());
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What's your name?</Text>
      <Text style={styles.subtitle}>We&apos;ll use this to personalize your experience</Text>
      
      <TextInput
        style={[styles.input, error ? styles.inputError : null]}
        value={name}
        onChangeText={(text) => {
          setName(text);
          if (error) setError(''); // Clear error when user types
        }}
        placeholder="Enter your name"
        autoFocus
        autoCapitalize="words"
        autoCorrect={false}
      />
      
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      
      <View style={styles.buttonContainer}>
        <Button title="Skip" onPress={onSkip} color="#666" />
        <Button title="Next" onPress={handleNext} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 30,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 20,
  },
  inputError: {
    borderColor: '#ff0000',
  },
  errorText: {
    color: '#ff0000',
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
});