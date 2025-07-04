import React, { useState } from 'react';
import { View, Text, Switch, Button, StyleSheet, ScrollView } from 'react-native';

interface NotificationPreferences {
  dailyReminders: boolean;
  weeklyReports: boolean;
  achievementAlerts: boolean;
  marketingEmails: boolean;
}

interface NotificationStepProps {
  onNext: (preferences: NotificationPreferences) => void;
  onSkip: () => void;
  onBack: () => void;
  initialValue?: NotificationPreferences;
}

export default function NotificationStep({ onNext, onSkip, onBack, initialValue }: NotificationStepProps) {
  const [preferences, setPreferences] = useState<NotificationPreferences>(
    initialValue || {
      dailyReminders: true,
      weeklyReports: true,
      achievementAlerts: true,
      marketingEmails: false,
    }
  );

  const togglePreference = (key: keyof NotificationPreferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleNext = () => {
    onNext(preferences);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Notification Preferences</Text>
      <Text style={styles.subtitle}>Choose what notifications you'd like to receive</Text>
      
      <View style={styles.preferencesContainer}>
        <View style={styles.preferenceItem}>
          <View style={styles.preferenceText}>
            <Text style={styles.preferenceTitle}>Daily Reminders</Text>
            <Text style={styles.preferenceDescription}>Get reminded to check your progress</Text>
          </View>
          <Switch
            value={preferences.dailyReminders}
            onValueChange={() => togglePreference('dailyReminders')}
          />
        </View>

        <View style={styles.preferenceItem}>
          <View style={styles.preferenceText}>
            <Text style={styles.preferenceTitle}>Weekly Reports</Text>
            <Text style={styles.preferenceDescription}>Receive a summary of your week</Text>
          </View>
          <Switch
            value={preferences.weeklyReports}
            onValueChange={() => togglePreference('weeklyReports')}
          />
        </View>

        <View style={styles.preferenceItem}>
          <View style={styles.preferenceText}>
            <Text style={styles.preferenceTitle}>Achievement Alerts</Text>
            <Text style={styles.preferenceDescription}>Celebrate your milestones</Text>
          </View>
          <Switch
            value={preferences.achievementAlerts}
            onValueChange={() => togglePreference('achievementAlerts')}
          />
        </View>

        <View style={styles.preferenceItem}>
          <View style={styles.preferenceText}>
            <Text style={styles.preferenceTitle}>Marketing Emails</Text>
            <Text style={styles.preferenceDescription}>Get updates about new features</Text>
          </View>
          <Switch
            value={preferences.marketingEmails}
            onValueChange={() => togglePreference('marketingEmails')}
          />
        </View>
      </View>
      
      <View style={styles.buttonContainer}>
        <Button title="Back" onPress={onBack} color="#666" />
        <Button title="Skip" onPress={onSkip} color="#666" />
        <Button title="Complete" onPress={handleNext} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    justifyContent: 'center',
    minHeight: '100%',
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
  preferencesContainer: {
    marginBottom: 30,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  preferenceText: {
    flex: 1,
    marginRight: 15,
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  preferenceDescription: {
    fontSize: 14,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
});