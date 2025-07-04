import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert, Platform, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Profile() {
  const [wakeTime, setWakeTime] = useState(new Date());
  const [alarmEnabled, setAlarmEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const user = auth().currentUser;

  useEffect(() => {
    loadUserSettings();
  }, []);

  const loadUserSettings = async () => {
    if (!user) return;
    
    try {
      const userDoc = await firestore()
        .collection('users')
        .doc(user.uid)
        .get();
      
      if (userDoc.exists) {
        const userData = userDoc.data();
        const savedTime = userData?.onboardingData?.wakeTime || '07:00';
        const [hours, minutes] = savedTime.split(':').map(Number);
        const timeDate = new Date();
        timeDate.setHours(hours, minutes, 0, 0);
        setWakeTime(timeDate);
        setAlarmEnabled(userData?.alarmEnabled !== false);
      }
    } catch (error) {
      console.error('Error loading user settings:', error);
    }
  };

  const updateAlarmSettings = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const timeString = `${wakeTime.getHours().toString().padStart(2, '0')}:${wakeTime.getMinutes().toString().padStart(2, '0')}`;
      
      await firestore()
        .collection('users')
        .doc(user.uid)
        .update({
          'onboardingData.wakeTime': timeString,
          alarmEnabled: alarmEnabled,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });

      Alert.alert('Success', 'Alarm settings updated!');
    } catch (error) {
      console.error('Error updating alarm settings:', error);
      Alert.alert('Error', 'Failed to update alarm settings');
    } finally {
      setLoading(false);
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
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
              onValueChange={setAlarmEnabled}
            />
          </View>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Wake Time</Text>
            <TouchableOpacity 
              style={styles.timeButton}
              onPress={() => setShowTimePicker(true)}
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
        </View>
      </ScrollView>
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
    buttonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
  });