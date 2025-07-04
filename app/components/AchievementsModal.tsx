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

  const unlockedAchievementIds = userRewards.achievements.map(a => a.id);
  
  const allAchievements = [
    ACHIEVEMENTS.FIRST_TASK,
    ACHIEVEMENTS.WEEK_WARRIOR,
    ACHIEVEMENTS.MONTH_MASTER,
    ACHIEVEMENTS.EARLY_RISER,
    ACHIEVEMENTS.TASK_EXPLORER,
    ACHIEVEMENTS.CONSISTENCY_KING,
    ACHIEVEMENTS.PERFECT_WEEK,
  ];

  const getAchievementProgress = (achievementId: string) => {
    switch (achievementId) {
      case ACHIEVEMENTS.FIRST_TASK.id:
        return {
          current: userRewards.totalTasksCompleted,
          required: 1,
          description: 'Complete your first morning task'
        };
      case ACHIEVEMENTS.WEEK_WARRIOR.id:
        return {
          current: userRewards.currentStreak,
          required: 7,
          description: 'Complete 7 days in a row'
        };
      case ACHIEVEMENTS.MONTH_MASTER.id:
        return {
          current: userRewards.currentStreak,
          required: 30,
          description: 'Complete 30 days in a row'
        };
      case ACHIEVEMENTS.EARLY_RISER.id:
        return {
          current: 0, // This would need to be tracked separately
          required: 5,
          description: 'Complete 5 tasks before 7 AM'
        };
      case ACHIEVEMENTS.TASK_EXPLORER.id:
        return {
          current: 0, // This would need to be tracked separately
          required: 10,
          description: 'Try 10 different types of tasks'
        };
      case ACHIEVEMENTS.CONSISTENCY_KING.id:
        return {
          current: userRewards.currentStreak,
          required: 14,
          description: 'Maintain a 14-day streak'
        };
      case ACHIEVEMENTS.PERFECT_WEEK.id:
        return {
          current: userRewards.currentStreak,
          required: 7,
          description: 'Complete every day for a week'
        };
      default:
        return {
          current: 0,
          required: 1,
          description: 'Unknown achievement'
        };
    }
  };

  const renderAchievement = (achievement: typeof ACHIEVEMENTS.FIRST_TASK) => {
    const isUnlocked = unlockedAchievementIds.includes(achievement.id);
    const progress = getAchievementProgress(achievement.id);
    const progressPercentage = Math.min((progress.current / progress.required) * 100, 100);

    return (
      <View key={achievement.id} style={[styles.achievementCard, isUnlocked && styles.unlockedCard]}>
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
          {isUnlocked && (
            <View style={styles.unlockedBadge}>
              <Text style={styles.unlockedBadgeText}>✓</Text>
            </View>
          )}
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${progressPercentage}%` },
                isUnlocked && styles.progressFillUnlocked
              ]} 
            />
          </View>
          <Text style={[styles.progressText, isUnlocked && styles.unlockedText]}>
            {progress.current} / {progress.required}
          </Text>
        </View>

        {isUnlocked && (
          <View style={styles.unlockDateContainer}>
            <Text style={styles.unlockDateText}>
              Unlocked {userRewards.achievements.find(a => a.id === achievement.id)?.unlockedAt.toLocaleDateString()}
            </Text>
          </View>
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
  achievementCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  unlockedCard: {
    backgroundColor: '#e8f5e8',
    borderColor: '#28a745',
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
  unlockedBadge: {
    backgroundColor: '#28a745',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unlockedBadgeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e9ecef',
    borderRadius: 3,
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 3,
  },
  progressFillUnlocked: {
    backgroundColor: '#28a745',
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  unlockDateContainer: {
    backgroundColor: '#d4edda',
    padding: 8,
    borderRadius: 6,
  },
  unlockDateText: {
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