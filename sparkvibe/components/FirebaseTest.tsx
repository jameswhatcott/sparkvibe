// sparkvibe/components/FirebaseTest.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import { createDocument, getDocuments } from '../services/firebase';

export default function FirebaseTest() {
  const [testData, setTestData] = useState<any[]>([]);

  const testCreate = async () => {
    try {
      await createDocument('test', {
        message: 'Hello Firebase!',
        timestamp: new Date()
      });
      console.log('Document created successfully');
    } catch (error) {
      console.error('Error creating document:', error);
    }
  };

  const testRead = async () => {
    try {
      const data = await getDocuments('test');
      setTestData(data);
      console.log('Documents retrieved:', data);
    } catch (error) {
      console.error('Error reading documents:', error);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Firebase Test</Text>
      <Button title="Create Test Document" onPress={testCreate} />
      <Button title="Read Test Documents" onPress={testRead} />
      <Text>Test Data: {JSON.stringify(testData, null, 2)}</Text>
    </View>
  );
}