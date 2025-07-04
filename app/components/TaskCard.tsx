import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MorningTask, taskService } from '../../services/taskService';

interface TaskCardProps {
  task: MorningTask;
  onTaskCompleted: () => void;
}

export default function TaskCard({ task, onTaskCompleted }: TaskCardProps) {
  const [loading, setLoading] = useState(false);

  const handleCompleteTask = async () => {
    setLoading(true);
    try {
      const success = await taskService.completeTask(task.id);
      if (success) {
        onTaskCompleted();
      } else {
        Alert.alert('Error', 'Failed to complete task. Please try again.');
      }
    } catch (error) {
      console.error('Error completing task:', error);
      Alert.alert('Error', 'Failed to complete task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={[styles.container, task.completed && styles.completedContainer]}>
      <View style={styles.header}>
        <Text style={styles.title}>Today's Morning Task</Text>
        <Text style={styles.time}>
          Created at {formatTime(task.createdAt)}
        </Text>
      </View>

      <View style={styles.taskContent}>
        <Text style={[styles.taskText, task.completed && styles.completedTaskText]}>
          {task.title}
        </Text>
        
        {task.completed && task.completedAt && (
          <Text style={styles.completedTime}>
            Completed at {formatTime(task.completedAt)}
          </Text>
        )}
      </View>

      {!task.completed && (
        <TouchableOpacity
          style={[styles.completeButton, loading && styles.disabledButton]}
          onPress={handleCompleteTask}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.completeButtonText}>Mark as Complete</Text>
          )}
        </TouchableOpacity>
      )}

      {task.completed && (
        <View style={styles.completedBadge}>
          <Text style={styles.completedBadgeText}>✓ Completed</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  completedContainer: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  time: {
    fontSize: 14,
    color: '#666',
  },
  taskContent: {
    marginBottom: 20,
  },
  taskText: {
    fontSize: 20,
    color: '#333',
    lineHeight: 28,
    fontWeight: '500',
  },
  completedTaskText: {
    color: '#666',
    textDecorationLine: 'line-through',
  },
  completedTime: {
    fontSize: 14,
    color: '#28a745',
    marginTop: 8,
    fontWeight: '500',
  },
  completeButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  completeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  completedBadge: {
    backgroundColor: '#28a745',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  completedBadgeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
}); 