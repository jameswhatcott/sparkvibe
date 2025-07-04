import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { UserRewards } from '../../services/rewardService';

interface RewardCardProps {
  rewards: UserRewards;
  onViewAchievements: () => void;
}

export default function RewardCard({ rewards, onViewAchievements }: RewardCardProps) {
  const getLevelProgress = () => {
    const currentLevel = rewards.currentLevel;
    const currentPoints = rewards.totalPoints;
    const nextLevelThreshold = currentLevel < 16 ? (currentLevel * 50) + (currentLevel - 1) * 25 : Infinity;
    const currentLevelThreshold = currentLevel > 1 ? ((currentLevel - 1) * 50) + (currentLevel - 2) * 25 : 0;
    const progress = nextLevelThreshold === Infinity ? 100 : 
      ((currentPoints - currentLevelThreshold) / (nextLevelThreshold - currentLevelThreshold)) * 100;
    
    return Math.min(progress, 100);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Progress</Text>
        <TouchableOpacity onPress={onViewAchievements}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{rewards.currentLevel}</Text>
          <Text style={styles.statLabel}>Level</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{rewards.totalPoints}</Text>
          <Text style={styles.statLabel}>Points</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{rewards.currentStreak}</Text>
          <Text style={styles.statLabel}>Streak</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{rewards.achievements.length}</Text>
          <Text style={styles.statLabel}>Badges</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <Text style={styles.progressLabel}>Level Progress</Text>
        <View style={styles.progressBar}>
          <View 
            style={[styles.progressFill, { width: `${getLevelProgress()}%` }]} 
          />
        </View>
        <Text style={styles.progressText}>
          {rewards.totalPoints} / {rewards.currentLevel < 16 ? 
            (rewards.currentLevel * 50) + (rewards.currentLevel - 1) * 25 : 
            'Max Level'} points
        </Text>
      </View>

      {rewards.currentStreak > 0 && (
        <View style={styles.streakContainer}>
          <Text style={styles.streakText}>
            🔥 {rewards.currentStreak} day{rewards.currentStreak > 1 ? 's' : ''} streak!
          </Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  viewAllText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  progressContainer: {
    marginBottom: 15,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  streakContainer: {
    backgroundColor: '#FFF3CD',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  streakText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#856404',
  },
});