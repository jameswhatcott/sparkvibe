import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface WakeTimeStepProps {
  onNext: (wakeTime: string) => void;
  onSkip: () => void;
  onBack: () => void;
  initialValue?: string;
}

export default function WakeTimeStep({ onNext, onSkip, onBack, initialValue }: WakeTimeStepProps) {
  const [wakeTime, setWakeTime] = useState(() => {
    if (initialValue) {
      const [hours, minutes] = initialValue.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      return date;
    }
    // Default to 7:00 AM
    const date = new Date();
    date.setHours(7, 0, 0, 0);
    return date;
  });
  const [showPicker, setShowPicker] = useState(false);

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowPicker(Platform.OS === 'ios');
    if (selectedTime) {
      setWakeTime(selectedTime);
    }
  };

  const handleNext = () => {
    const timeString = `${wakeTime.getHours().toString().padStart(2, '0')}:${wakeTime.getMinutes().toString().padStart(2, '0')}`;
    onNext(timeString);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What time do you want to wake up?</Text>
      <Text style={styles.subtitle}>We'll use this to schedule your notifications</Text>
      
      <View style={styles.timeDisplay}>
        <Text style={styles.timeText}>{formatTime(wakeTime)}</Text>
        <Button 
          title="Change Time" 
          onPress={() => setShowPicker(true)} 
        />
      </View>
      
      {showPicker && (
        <DateTimePicker
          value={wakeTime}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={handleTimeChange}
        />
      )}
      
      <View style={styles.buttonContainer}>
        <Button title="Back" onPress={onBack} color="#666" />
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
  timeDisplay: {
    alignItems: 'center',
    marginBottom: 30,
  },
  timeText: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
});