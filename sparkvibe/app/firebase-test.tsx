import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { createDocument, getDocuments, updateDocument, deleteDocument } from '../services/firebase';

export default function FirebaseTest() {
  const [testData, setTestData] = useState('');
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Test data structure
  const testDocument = {
    name: testData || 'Test User',
    message: 'Hello from SparkVibe!',
    timestamp: new Date().toISOString(),
    testField: 'This is a test document'
  };

  // Create a test document
  const handleCreateDocument = async () => {
    setLoading(true);
    try {
      const docRef = await createDocument('test-collection', testDocument);
      Alert.alert('Success', `Document created with ID: ${docRef.id}`);
      loadDocuments(); // Refresh the list
    } catch (error) {
      Alert.alert('Error', `Failed to create document: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  // Load all documents
  const loadDocuments = async () => {
    setLoading(true);
    try {
      const docs = await getDocuments('test-collection');
      setDocuments(docs);
    } catch (error) {
      Alert.alert('Error', `Failed to load documents: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  // Update a document
  const handleUpdateDocument = async (docId: string) => {
    setLoading(true);
    try {
      await updateDocument('test-collection', docId, {
        ...testDocument,
        updatedAt: new Date().toISOString()
      });
      Alert.alert('Success', 'Document updated successfully');
      loadDocuments(); // Refresh the list
    } catch (error) {
      Alert.alert('Error', `Failed to update document: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  // Delete a document
  const handleDeleteDocument = async (docId: string) => {
    setLoading(true);
    try {
      await deleteDocument('test-collection', docId);
      Alert.alert('Success', 'Document deleted successfully');
      loadDocuments(); // Refresh the list
    } catch (error) {
      Alert.alert('Error', `Failed to delete document: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  // Load documents on component mount
  useEffect(() => {
    loadDocuments();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Firebase Test Connection</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Test Name:</Text>
        <TextInput
          style={styles.input}
          value={testData}
          onChangeText={setTestData}
          placeholder="Enter test name"
        />
      </View>

      <TouchableOpacity 
        style={styles.button} 
        onPress={handleCreateDocument}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Creating...' : 'Create Test Document'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, styles.secondaryButton]} 
        onPress={loadDocuments}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Loading...' : 'Refresh Documents'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Documents in Collection:</Text>
      
      {documents.length === 0 ? (
        <Text style={styles.noData}>No documents found</Text>
      ) : (
        documents.map((doc) => (
          <View key={doc.id} style={styles.documentCard}>
            <Text style={styles.documentTitle}>ID: {doc.id}</Text>
            <Text style={styles.documentText}>Name: {doc.name}</Text>
            <Text style={styles.documentText}>Message: {doc.message}</Text>
            <Text style={styles.documentText}>Created: {new Date(doc.createdAt?.toDate?.() || doc.createdAt).toLocaleString()}</Text>
            
            <View style={styles.documentActions}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.updateButton]}
                onPress={() => handleUpdateDocument(doc.id)}
                disabled={loading}
              >
                <Text style={styles.actionButtonText}>Update</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDeleteDocument(doc.id)}
                disabled={loading}
              >
                <Text style={styles.actionButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#34C759',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 15,
    color: '#333',
  },
  noData: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  documentCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  documentText: {
    fontSize: 14,
    marginBottom: 4,
    color: '#666',
  },
  documentActions: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  updateButton: {
    backgroundColor: '#FF9500',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
}); 