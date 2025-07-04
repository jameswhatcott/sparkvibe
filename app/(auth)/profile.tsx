import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert, Platform, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { messageService } from '../../services/messageService';
import MorningTaskModal from '../components/MorningTaskModal';

export default function Profile() {
  const [wakeTime, setWakeTime] = useState(new Date());
  const [alarmEnabled, setAlarmEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const user = auth().currentUser;

  useEffect(() => {
    loadUserSettings();
  }, [loadUserSettings]);

  const loadUserSettings = async () => {
    if (!user) return;
    
    try {
      console.log('Loading user settings for user:', user.uid);
      const userDoc = await firestore()
        .collection('users')
        .doc(user.uid)
        .get();
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log('User data loaded:', userData);
        const savedTime = userData?.onboardingData?.wakeTime || '07:00';
        const [hours, minutes] = savedTime.split(':').map(Number);
        const timeDate = new Date();
        timeDate.setHours(hours, minutes, 0, 0);
        setWakeTime(timeDate);
        setAlarmEnabled(userData?.alarmEnabled ?? true);
        console.log('Settings loaded - Wake time:', savedTime, 'Alarm enabled:', userData?.alarmEnabled !== false);
      } else {
        console.log('User document does not exist');
      }
    } catch (error) {
      console.error('Error loading user settings:', error);
    }
  };

  const updateAlarmSettings = async () => {
    if (!user) {
      console.error('No user found');
      return;
    }
    
    setLoading(true);
    console.log('Starting to update alarm settings...');
    
    try {
      const timeString = `${wakeTime.getHours().toString().padStart(2, '0')}:${wakeTime.getMinutes().toString().padStart(2, '0')}`;
      console.log('Updating wake time to:', timeString);
      console.log('Alarm enabled:', alarmEnabled);
      
      const updateData = {
        'onboardingData.wakeTime': timeString,
        alarmEnabled: alarmEnabled,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      };
      
      console.log('Updating Firestore with data:', updateData);
      
      await firestore()
        .collection('users')
        .doc(user.uid)
        .update(updateData);

      console.log('Firestore update successful!');
      Alert.alert('Success', 'Alarm settings updated!');
    } catch (error: any) {
      console.error('Error updating alarm settings:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      // More specific error handling
      if (error?.code === 'firestore/not-found') {
        Alert.alert('Error', 'User document not found. Please try signing out and signing back in.');
      } else if (error?.code === 'firestore/permission-denied') {
        Alert.alert('Error', 'Permission denied. Please check your Firebase rules.');
      } else {
        Alert.alert('Error', 'Failed to update alarm settings. Please try again.');
      }
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  const testAlarm = async () => {
    if (!user) {
      Alert.alert('Error', 'No user found');
      return;
    }

    console.log('Testing alarm...');
    
    try {
      // Get a personalized message
      const message = await messageService.getPersonalizedMessage();
      
      if (message) {
        console.log('Got message:', message.text);
        
        // Show the message as an alert (simulating the alarm notification)
        Alert.alert(
          '🌅 Good Morning!',
          message.text,
          [
            {
              text: 'Snooze',
              style: 'cancel',
              onPress: () => console.log('Snooze pressed')
            },
            {
              text: 'Start My Day',
              onPress: () => {
                console.log('Start day pressed - showing task modal');
                setShowTaskModal(true);
              }
            }
          ],
          { cancelable: false }
        );
      } else {
        Alert.alert('Error', 'No message available');
      }
    } catch (error) {
      console.error('Error testing alarm:', error);
      Alert.alert('Error', 'Failed to get message');
    }
  };

  const handleTaskCreated = (task: MorningTask) => {
    console.log('Task created:', task.title);
    Alert.alert('Task Set!', `Your morning task "${task.title}" has been set for today.`);
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    console.log('Time picker event:', event.type);
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      console.log('Selected time:', selectedTime);
      setWakeTime(selectedTime);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Profile Settings</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alarm Settings</Text>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Enable Alarm</Text>
            <Switch
              value={alarmEnabled}
              onValueChange={(value) => {
                console.log('Alarm enabled changed to:', value);
                setAlarmEnabled(value);
              }}
            />
          </View>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Wake Time</Text>
            <TouchableOpacity 
              style={styles.timeButton}
              onPress={() => {
                console.log('Opening time picker');
                setShowTimePicker(true);
              }}
            >
              <Text style={styles.timeText}>
                {wakeTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </TouchableOpacity>
          </View>
          
          {showTimePicker && (
            <DateTimePicker
              value={wakeTime}
              mode="time"
              is24Hour={false}
              display="default"
              onChange={onTimeChange}
            />
          )}
          
          <TouchableOpacity 
            style={styles.button}
            onPress={updateAlarmSettings}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Updating...' : 'Save Settings'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.testButton]}
            onPress={testAlarm}
          >
            <Text style={styles.buttonText}>Test Alarm</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <MorningTaskModal
        visible={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        onTaskCreated={handleTaskCreated}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f5f5f5',
    },
    scrollContent: {
      padding: 20,
      paddingTop: 0,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 30,
      marginTop: 20,
    },
    section: {
      backgroundColor: 'white',
      padding: 20,
      borderRadius: 10,
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 20,
    },
    settingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
    },
    settingLabel: {
      fontSize: 16,
    },
    timeButton: {
      backgroundColor: '#f0f0f0',
      padding: 10,
      borderRadius: 8,
      minWidth: 80,
      alignItems: 'center',
    },
    timeText: {
      fontSize: 16,
      fontWeight: '500',
    },
    button: {
      backgroundColor: '#007AFF',
      padding: 15,
      borderRadius: 8,
      marginTop: 20,
      alignItems: 'center',
    },
    testButton: {
      backgroundColor: '#FF9500',
    },
    buttonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
  });