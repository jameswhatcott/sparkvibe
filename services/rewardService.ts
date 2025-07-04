import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export interface UserRewards {
  totalPoints: number;
  currentLevel: number;
  currentStreak: number;
  longestStreak: number;
  totalTasksCompleted: number;
  achievements: Achievement[];
  lastTaskDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  category: 'daily' | 'streak' | 'milestone' | 'special';
}

export interface DailyProgress {
  date: string; // YYYY-MM-DD format
  pointsEarned: number;
  tasksCompleted: number;
  streakBonus: number;
  earlyBirdBonus: number;
  perfectWeekBonus: number;
  totalPoints: number;
}

export const ACHIEVEMENTS = {
  FIRST_TASK: {
    id: 'first_task',
    name: 'First Steps',
    description: 'Complete your first morning task',
    icon: '🌱',
    category: 'milestone' as const,
  },
  WEEK_WARRIOR: {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: 'Complete 7 days in a row',
    icon: '🔥',
    category: 'streak' as const,
  },
  MONTH_MASTER: {
    id: 'month_master',
    name: 'Month Master',
    description: 'Complete 30 days in a row',
    icon: '👑',
    category: 'streak' as const,
  },
  EARLY_RISER: {
    id: 'early_riser',
    name: 'Early Riser',
    description: 'Complete 5 tasks before 7 AM',
    icon: '🌅',
    category: 'milestone' as const,
  },
  TASK_EXPLORER: {
    id: 'task_explorer',
    name: 'Task Explorer',
    description: 'Try 10 different types of tasks',
    icon: '🧭',
    category: 'milestone' as const,
  },
  CONSISTENCY_KING: {
    id: 'consistency_king',
    name: 'Consistency King',
    description: 'Maintain a 14-day streak',
    icon: '⚡',
    category: 'streak' as const,
  },
  PERFECT_WEEK: {
    id: 'perfect_week',
    name: 'Perfect Week',
    description: 'Complete every day for a week',
    icon: '⭐',
    category: 'streak' as const,
  },
};

export const POINT_VALUES = {
  TASK_COMPLETION: 10,
  STREAK_BONUS: 5,
  EARLY_BIRD_BONUS: 3,
  PERFECT_WEEK_BONUS: 25,
  PERFECT_MONTH_BONUS: 100,
};

export const LEVEL_THRESHOLDS = [
  0, 50, 150, 300, 500, 750, 1050, 1400, 1800, 2250, 2750, 3300, 3900, 4550, 5250, 6000
];

class RewardService {
  private getCurrentUser() {
    return auth().currentUser;
  }

  async getUserRewards(): Promise<UserRewards | null> {
    const user = this.getCurrentUser();
    if (!user) return null;

    try {
      const doc = await firestore()
        .collection('users')
        .doc(user.uid)
        .collection('rewards')
        .doc('userRewards')
        .get();

      if (doc.exists()) {
        const data = doc.data();
        return {
          totalPoints: data?.totalPoints || 0,
          currentLevel: data?.currentLevel || 1,
          currentStreak: data?.currentStreak || 0,
          longestStreak: data?.longestStreak || 0,
          totalTasksCompleted: data?.totalTasksCompleted || 0,
          achievements: data?.achievements || [],
          lastTaskDate: data?.lastTaskDate?.toDate(),
          createdAt: data?.createdAt?.toDate() || new Date(),
          updatedAt: data?.updatedAt?.toDate() || new Date(),
        };
      }

      // Create new rewards document if it doesn't exist
      return this.createInitialRewards();
    } catch (error) {
      console.error('Error getting user rewards:', error);
      return null;
    }
  }

  private async createInitialRewards(): Promise<UserRewards> {
    const user = this.getCurrentUser();
    if (!user) throw new Error('No user found');

    const initialRewards: UserRewards = {
      totalPoints: 0,
      currentLevel: 1,
      currentStreak: 0,
      longestStreak: 0,
      totalTasksCompleted: 0,
      achievements: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await firestore()
      .collection('users')
      .doc(user.uid)
      .collection('rewards')
      .doc('userRewards')
      .set(initialRewards);

    return initialRewards;
  }

  async recordTaskCompletion(taskCompletedAt: Date, isEarlyBird: boolean = false): Promise<{
    pointsEarned: number;
    newLevel: number;
    achievementsUnlocked: Achievement[];
    newStreak: number;
  }> {
    const user = this.getCurrentUser();
    if (!user) throw new Error('No user found');

    try {
      const rewards = await this.getUserRewards();
      if (!rewards) throw new Error('Failed to get user rewards');

      // Calculate points
      let pointsEarned = POINT_VALUES.TASK_COMPLETION;
      let streakBonus = 0;
      let earlyBirdBonus = 0;
      let perfectWeekBonus = 0;

      // Check if this is a consecutive day
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const lastTaskDate = rewards.lastTaskDate;
      const lastTaskDay = lastTaskDate ? new Date(lastTaskDate) : null;
      if (lastTaskDay) {
        lastTaskDay.setHours(0, 0, 0, 0);
      }

      const isConsecutiveDay = !lastTaskDay || 
        (today.getTime() - lastTaskDay.getTime()) === 24 * 60 * 60 * 1000;

      let newStreak = rewards.currentStreak;
      if (isConsecutiveDay) {
        newStreak++;
        if (newStreak >= 3) {
          streakBonus = POINT_VALUES.STREAK_BONUS;
          pointsEarned += streakBonus;
        }
      } else {
        newStreak = 1;
      }

      // Early bird bonus
      if (isEarlyBird) {
        earlyBirdBonus = POINT_VALUES.EARLY_BIRD_BONUS;
        pointsEarned += earlyBirdBonus;
      }

      // Perfect week bonus (7 consecutive days)
      if (newStreak === 7) {
        perfectWeekBonus = POINT_VALUES.PERFECT_WEEK_BONUS;
        pointsEarned += perfectWeekBonus;
      }

      // Calculate new total and level
      const newTotalPoints = rewards.totalPoints + pointsEarned;
      const newLevel = this.calculateLevel(newTotalPoints);
      const newTotalTasks = rewards.totalTasksCompleted + 1;
      const newLongestStreak = Math.max(rewards.longestStreak, newStreak);

      // Check for new achievements
      const newAchievements = await this.checkAchievements(
        rewards.achievements,
        newTotalTasks,
        newStreak,
        newLongestStreak
      );

      // Update rewards
      const updatedRewards: UserRewards = {
        ...rewards,
        totalPoints: newTotalPoints,
        currentLevel: newLevel,
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
        totalTasksCompleted: newTotalTasks,
        achievements: [...rewards.achievements, ...newAchievements],
        lastTaskDate: taskCompletedAt,
        updatedAt: new Date(),
      };

      await firestore()
        .collection('users')
        .doc(user.uid)
        .collection('rewards')
        .doc('userRewards')
        .set(updatedRewards);

      // Record daily progress
      await this.recordDailyProgress(today, {
        pointsEarned,
        streakBonus,
        earlyBirdBonus,
        perfectWeekBonus,
        totalPoints: newTotalPoints,
      });

      return {
        pointsEarned,
        newLevel,
        achievementsUnlocked: newAchievements,
        newStreak,
      };
    } catch (error) {
      console.error('Error recording task completion:', error);
      throw error;
    }
  }

  private calculateLevel(totalPoints: number): number {
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (totalPoints >= LEVEL_THRESHOLDS[i]) {
        return i + 1;
      }
    }
    return 1;
  }

  private async checkAchievements(
    currentAchievements: Achievement[],
    totalTasks: number,
    currentStreak: number,
    longestStreak: number
  ): Promise<Achievement[]> {
    const unlockedAchievements: Achievement[] = [];
    const currentAchievementIds = currentAchievements.map(a => a.id);

    // Check first task achievement
    if (totalTasks === 1 && !currentAchievementIds.includes(ACHIEVEMENTS.FIRST_TASK.id)) {
      unlockedAchievements.push({
        ...ACHIEVEMENTS.FIRST_TASK,
        unlockedAt: new Date(),
      });
    }

    // Check week warrior achievement
    if (currentStreak === 7 && !currentAchievementIds.includes(ACHIEVEMENTS.WEEK_WARRIOR.id)) {
      unlockedAchievements.push({
        ...ACHIEVEMENTS.WEEK_WARRIOR,
        unlockedAt: new Date(),
      });
    }

    // Check consistency king achievement
    if (currentStreak === 14 && !currentAchievementIds.includes(ACHIEVEMENTS.CONSISTENCY_KING.id)) {
      unlockedAchievements.push({
        ...ACHIEVEMENTS.CONSISTENCY_KING,
        unlockedAt: new Date(),
      });
    }

    // Check month master achievement
    if (currentStreak === 30 && !currentAchievementIds.includes(ACHIEVEMENTS.MONTH_MASTER.id)) {
      unlockedAchievements.push({
        ...ACHIEVEMENTS.MONTH_MASTER,
        unlockedAt: new Date(),
      });
    }

    return unlockedAchievements;
  }

  private async recordDailyProgress(date: Date, progress: {
    pointsEarned: number;
    streakBonus: number;
    earlyBirdBonus: number;
    perfectWeekBonus: number;
    totalPoints: number;
  }): Promise<void> {
    const user = this.getCurrentUser();
    if (!user) return;

    const dateString = date.toISOString().split('T')[0];
    
    try {
      await firestore()
        .collection('users')
        .doc(user.uid)
        .collection('dailyProgress')
        .doc(dateString)
        .set({
          date: dateString,
          pointsEarned: progress.pointsEarned,
          tasksCompleted: 1,
          streakBonus: progress.streakBonus,
          earlyBirdBonus: progress.earlyBirdBonus,
          perfectWeekBonus: progress.perfectWeekBonus,
          totalPoints: progress.totalPoints,
          createdAt: firestore.FieldValue.serverTimestamp(),
        });
    } catch (error) {
      console.error('Error recording daily progress:', error);
    }
  }

  async getDailyProgress(days: number = 7): Promise<DailyProgress[]> {
    const user = this.getCurrentUser();
    if (!user) return [];

    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const snapshot = await firestore()
        .collection('users')
        .doc(user.uid)
        .collection('dailyProgress')
        .where('date', '>=', startDate.toISOString().split('T')[0])
        .where('date', '<=', endDate.toISOString().split('T')[0])
        .orderBy('date', 'desc')
        .get();

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          date: data.date,
          pointsEarned: data.pointsEarned || 0,
          tasksCompleted: data.tasksCompleted || 0,
          streakBonus: data.streakBonus || 0,
          earlyBirdBonus: data.earlyBirdBonus || 0,
          perfectWeekBonus: data.perfectWeekBonus || 0,
          totalPoints: data.totalPoints || 0,
        };
      });
    } catch (error) {
      console.error('Error getting daily progress:', error);
      return [];
    }
  }

  async getLeaderboardStats(): Promise<{
    currentStreak: number;
    longestStreak: number;
    totalPoints: number;
    level: number;
    achievementsCount: number;
  }> {
    const rewards = await this.getUserRewards();
    if (!rewards) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        totalPoints: 0,
        level: 1,
        achievementsCount: 0,
      };
    }

    return {
      currentStreak: rewards.currentStreak,
      longestStreak: rewards.longestStreak,
      totalPoints: rewards.totalPoints,
      level: rewards.currentLevel,
      achievementsCount: rewards.achievements.length,
    };
  }
}

export const rewardService = new RewardService();