import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import NameStep from '../components/NameStep';
import WakeTimeStep from '../components/WakeTimeStep';
import NotificationStep from '../components/NotificationStep';
import { Timestamp } from '@firebase/firestore';

interface OnboardingData {
  name: string;
  wakeTime: string;
  notificationPreferences: {
    dailyReminders: boolean;
    weeklyReports: boolean;
    achievementAlerts: boolean;
    marketingEmails: boolean;
  };
}

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    name: '',
    wakeTime: '',
    notificationPreferences: {
      dailyReminders: true,
      weeklyReports: true,
      achievementAlerts: true,
      marketingEmails: false,
    }
  });

  const steps = [
    { title: 'Name', component: 'name' },
    { title: 'Wake Time', component: 'wakeTime' },
    { title: 'Notifications', component: 'notifications' }
  ];

  const handleNext = (data: any) => {
    // Update onboarding data based on current step
    if (currentStep === 0) {
      setOnboardingData(prev => ({ ...prev, name: data }));
    } else if (currentStep === 1) {
      setOnboardingData(prev => ({ ...prev, wakeTime: data }));
    } else if (currentStep === 2) {
      setOnboardingData(prev => ({ ...prev, notificationPreferences: data }));
    }

    // Move to next step or complete
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      completeOnboarding();
    }
  };

  const handleSkip = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeOnboarding = async () => {
    setLoading(true);
    try {
      console.log('Starting onboarding completion...');
      
      const user = auth().currentUser;
      console.log('Current user:', user?.uid);
      
      if (!user) {
        console.error('No user found');
        setLoading(false);
        return;
      }

      console.log('Onboarding data to save:', onboardingData);
      console.log('Updating Firestore document...');
      
      // Update the user document in Firestore
      await firestore()
        .collection('users')
        .doc(user.uid)
        .set({
          onboardingCompleted: true,
          onboardingData: onboardingData,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        }, { merge: true });

      console.log('Firestore update successful!');
      console.log('Onboarding completed:', onboardingData);
      
      // Navigate to home page
      console.log('Navigating to home...');
      router.replace('/(auth)/home');
      
    } catch (error: any) {
      console.error('Error completing onboarding:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      // More specific error handling
      if (error.code === 'firestore/not-found') {
        alert('User document not found. Please try signing out and signing back in.');
      } else if (error.code === 'firestore/permission-denied') {
        alert('Permission denied. Please check your Firebase rules.');
      } else {
        alert('Failed to save onboarding data. Please try again.');
      }
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <NameStep
            onNext={handleNext}
            onSkip={handleSkip}
            initialValue={onboardingData.name}
          />
        );
      case 1:
        return (
          <WakeTimeStep
            onNext={handleNext}
            onSkip={handleSkip}
            onBack={handleBack}
            initialValue={onboardingData.wakeTime}
          />
        );
      case 2:
        return (
          <NotificationStep
            onNext={handleNext}
            onSkip={handleSkip}
            onBack={handleBack}
            initialValue={onboardingData.notificationPreferences}
            loading={loading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to SparkVibe!</Text>
      <Text style={styles.subtitle}>Let&apos;s get to know you better</Text>
      
      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          Step {currentStep + 1} of {steps.length}
        </Text>
        <View style={styles.progressBar}>
          {steps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                index <= currentStep ? styles.progressDotActive : styles.progressDotInactive
              ]}
            />
          ))}
        </View>
      </View>
      
      {/* Step Content */}
      {renderStep()}
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
    textAlign: 'center',
    marginTop: 50,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
    color: '#666',
  },
  progressContainer: {
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  progressText: {
    fontSize: 16,
    marginBottom: 15,
    color: '#666',
  },
  progressBar: {
    flexDirection: 'row',
    gap: 10,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  progressDotActive: {
    backgroundColor: '#007AFF',
  },
  progressDotInactive: {
    backgroundColor: '#E0E0E0',
  },
});
