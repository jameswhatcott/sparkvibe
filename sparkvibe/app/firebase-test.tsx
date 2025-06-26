import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { createDocument, getDocuments } from '../services/firebase';
import { router } from 'expo-router';

export default function FirebaseTestPage() {
  const [testData, setTestData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const testCreate = async () => {
    setLoading(true);
    try {
      await createDocument('test', {
        message: 'Hello Firebase!',
        timestamp: new Date().toISOString()
      });
      console.log('✅ Document created successfully');
      alert('Document created successfully!');
    } catch (error) {
      console.error('❌ Error creating document:', error);
      alert(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testRead = async () => {
    setLoading(true);
    try {
      const data = await getDocuments('test');
      setTestData(data);
      console.log('✅ Documents retrieved:', data);
      alert(`Retrieved ${data.length} documents`);
    } catch (error) {
      console.error('❌ Error reading documents:', error);
      alert(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Firebase Test</Text>
      <Button 
        title={loading ? "Creating..." : "Create Test Document"} 
        onPress={testCreate}
        disabled={loading}
      />
      <View style={styles.spacer} />
      <Button 
        title={loading ? "Reading..." : "Read Test Documents"} 
        onPress={testRead}
        disabled={loading}
      />
      <View style={styles.spacer} />
      <Text style={styles.dataTitle}>Test Data:</Text>
      <Text style={styles.dataText}>
        {JSON.stringify(testData, null, 2)}
      </Text>
      <Button 
        title="Go to Firebase Test Page" 
        onPress={() => router.push('/firebase-test')}
        color="#FF6B6B"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  spacer: {
    height: 10,
  },
  dataTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
  },
  dataText: {
    fontSize: 12,
    fontFamily: 'monospace',
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 5,
  },
}); 