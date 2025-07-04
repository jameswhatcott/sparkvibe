import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { UserRewards, ACHIEVEMENTS } from '../../services/rewardService';

interface AchievementsModalProps {
  visible: boolean;
  onClose: () => void;
  userRewards: UserRewards | null;
}

const { width } = Dimensions.get('window');

export default function AchievementsModal({ visible, onClose, userRewards }: AchievementsModalProps) {
  // Early return if userRewards is null
  if (!userRewards) {
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
              <Text style={styles.title}>Achievements</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading achievements...</Text>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  const allAchievements = [
    ACHIEVEMENTS.FIRST_TASK,
    ACHIEVEMENTS.WEEK_WARRIOR,
    ACHIEVEMENTS.MONTH_MASTER,
    ACHIEVEMENTS.EARLY_RISER,
    ACHIEVEMENTS.TASK_EXPLORER,
    ACHIEVEMENTS.CONSISTENCY_KING,
    ACHIEVEMENTS.PERFECT_WEEK,
  ];

  const renderAchievement = (achievement: any) => {
    const isUnlocked = userRewards?.achievements?.some(a => a.id === achievement.id) || false;
    const unlockedAchievement = userRewards?.achievements?.find(a => a.id === achievement.id);
    
    return (
      <View key={achievement.id} style={styles.achievementItem}>
        <View style={styles.achievementHeader}>
          <Text style={styles.achievementIcon}>{achievement.icon}</Text>
          <View style={styles.achievementInfo}>
            <Text style={[styles.achievementName, isUnlocked && styles.unlockedText]}>
              {achievement.name}
            </Text>
            <Text style={[styles.achievementDescription, isUnlocked && styles.unlockedText]}>
              {achievement.description}
            </Text>
          </View>
          <View style={[styles.achievementStatus, isUnlocked && styles.unlockedStatus]}>
            <Text style={styles.achievementStatusText}>
              {isUnlocked ? '✓' : ''}
            </Text>
          </View>
        </View>
        
        {isUnlocked && unlockedAchievement && (
          <Text style={styles.unlockDate}>
            Unlocked: {new Date(unlockedAchievement.unlockedAt).toLocaleDateString()}
          </Text>
        )}
      </View>
    );
  };

  const unlockedCount = userRewards.achievements.length;
  const totalCount = allAchievements.length;

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
            <Text style={styles.title}>Achievements</Text>
            <Text style={styles.subtitle}>
              {unlockedCount} of {totalCount} unlocked
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.achievementsList} showsVerticalScrollIndicator={false}>
            {allAchievements.map(renderAchievement)}
          </ScrollView>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userRewards.totalPoints}</Text>
              <Text style={styles.statLabel}>Total Points</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userRewards.currentLevel}</Text>
              <Text style={styles.statLabel}>Level</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userRewards.currentStreak}</Text>
              <Text style={styles.statLabel}>Current Streak</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userRewards.longestStreak}</Text>
              <Text style={styles.statLabel}>Longest Streak</Text>
            </View>
          </View>
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
      margin: 20,
      maxHeight: '90%',
      width: width - 40,
    },
    header: {
      padding: 20,
      paddingBottom: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#f0f0f0',
      position: 'relative',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center',
      color: '#333',
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 16,
      textAlign: 'center',
      color: '#666',
    },
    closeButton: {
      position: 'absolute',
      top: 20,
      right: 20,
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: '#f0f0f0',
      justifyContent: 'center',
      alignItems: 'center',
    },
    closeButtonText: {
      fontSize: 18,
      color: '#666',
      fontWeight: 'bold',
    },
    loadingContainer: {
      padding: 40,
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 16,
      color: '#666',
    },
    achievementsList: {
      flex: 1,
      padding: 20,
    },
    achievementItem: {
      backgroundColor: '#f8f9fa',
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: '#e9ecef',
    },
    achievementHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    achievementIcon: {
      fontSize: 32,
      marginRight: 12,
    },
    achievementInfo: {
      flex: 1,
    },
    achievementName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#333',
      marginBottom: 2,
    },
    achievementDescription: {
      fontSize: 14,
      color: '#666',
      lineHeight: 18,
    },
    unlockedText: {
      color: '#28a745',
    },
    achievementStatus: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: '#6c757d',
      justifyContent: 'center',
      alignItems: 'center',
    },
    unlockedStatus: {
      backgroundColor: '#28a745',
      width: 24,
      height: 24,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    achievementStatusText: {
      color: 'white',
      fontSize: 14,
      fontWeight: 'bold',
    },
    unlockDate: {
      fontSize: 12,
      color: '#155724',
      textAlign: 'center',
      fontWeight: '500',
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      padding: 20,
      borderTopWidth: 1,
      borderTopColor: '#f0f0f0',
      backgroundColor: '#f8f9fa',
    },
    statItem: {
      alignItems: 'center',
    },
    statNumber: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#007AFF',
      marginBottom: 2,
    },
    statLabel: {
      fontSize: 12,
      color: '#666',
    },
  });