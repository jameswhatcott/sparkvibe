import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { taskService, defaultTasks, MorningTask } from '../../services/taskService';

interface MorningTaskModalProps {
  visible: boolean;
  onClose: () => void;
  onTaskCreated: (task: MorningTask) => void;
}

export default function MorningTaskModal({ visible, onClose, onTaskCreated }: MorningTaskModalProps) {
  const [customTask, setCustomTask] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleTaskSelect = async (taskTitle: string) => {
    setLoading(true);
    try {
      const task = await taskService.createTodaysTask(taskTitle, false);
      if (task) {
        onTaskCreated(task);
        onClose();
      } else {
        Alert.alert('Error', 'Failed to create task. Please try again.');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      Alert.alert('Error', 'Failed to create task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomTaskSubmit = async () => {
    if (!customTask.trim()) {
      Alert.alert('Error', 'Please enter a task');
      return;
    }

    setLoading(true);
    try {
      const task = await taskService.createTodaysTask(customTask.trim(), true);
      if (task) {
        onTaskCreated(task);
        setCustomTask('');
        setShowCustomInput(false);
        onClose();
      } else {
        Alert.alert('Error', 'Failed to create task. Please try again.');
      }
    } catch (error) {
      console.error('Error creating custom task:', error);
      Alert.alert('Error', 'Failed to create task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderTaskOption = (task: string) => (
    <TouchableOpacity
      key={task}
      style={styles.taskOption}
      onPress={() => handleTaskSelect(task)}
      disabled={loading}
    >
      <Text style={styles.taskOptionText}>{task}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Choose Your Morning Task</Text>
            <Text style={styles.subtitle}>
              Pick a small task to build momentum for your day
            </Text>
          </View>

          <ScrollView style={styles.taskList} showsVerticalScrollIndicator={false}>
            {defaultTasks.map(renderTaskOption)}
            
            <TouchableOpacity
              style={[styles.taskOption, styles.customTaskButton]}
              onPress={() => setShowCustomInput(true)}
              disabled={loading}
            >
              <Text style={styles.customTaskText}>+ Write your own task</Text>
            </TouchableOpacity>
          </ScrollView>

          {showCustomInput && (
            <View style={styles.customInputContainer}>
              <TextInput
                style={styles.customInput}
                placeholder="Enter your morning task..."
                value={customTask}
                onChangeText={setCustomTask}
                multiline
                maxLength={100}
              />
              <View style={styles.customInputButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => {
                    setShowCustomInput(false);
                    setCustomTask('');
                  }}
                  disabled={loading}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.submitButton]}
                  onPress={handleCustomTaskSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text style={styles.submitButtonText}>Create Task</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            disabled={loading}
          >
            <Text style={styles.closeButtonText}>Maybe Later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    lineHeight: 22,
  },
  taskList: {
    maxHeight: 300,
  },
  taskOption: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  taskOptionText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  customTaskButton: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
  },
  customTaskText: {
    fontSize: 16,
    color: '#2196f3',
    textAlign: 'center',
    fontWeight: '500',
  },
  customInputContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  customInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  customInputButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  submitButton: {
    backgroundColor: '#007AFF',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  closeButton: {
    marginTop: 20,
    padding: 16,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#666',
    fontSize: 16,
  },
}); 