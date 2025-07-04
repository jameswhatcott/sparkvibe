import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export interface MorningTask {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
  isCustom: boolean;
}

export const defaultTasks = [
  "Make your bed",
  "Do some stretches",
  "Drink a glass of water",
  "Write down 3 things you're grateful for",
  "Take 5 deep breaths",
  "Open the curtains and let in natural light",
  "Do 10 jumping jacks",
  "Read one page of a book",
  "Listen to your favorite song",
  "Plan your top 3 priorities for today"
];

class TaskService {
  private getCurrentUser() {
    return auth().currentUser;
  }

  async getTodaysTask(): Promise<MorningTask | null> {
    const user = this.getCurrentUser();
    if (!user) return null;

    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

      const taskDoc = await firestore()
        .collection('users')
        .doc(user.uid)
        .collection('morningTasks')
        .where('createdAt', '>=', startOfDay)
        .where('createdAt', '<=', endOfDay)
        .limit(1)
        .get();

      if (!taskDoc.empty) {
        const taskData = taskDoc.docs[0].data();
        return {
          id: taskDoc.docs[0].id,
          title: taskData.title,
          description: taskData.description || '',
          completed: taskData.completed || false,
          createdAt: taskData.createdAt.toDate(),
          completedAt: taskData.completedAt?.toDate(),
          isCustom: taskData.isCustom || false,
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting today\'s task:', error);
      return null;
    }
  }

  async createTodaysTask(title: string, isCustom: boolean = false): Promise<MorningTask | null> {
    const user = this.getCurrentUser();
    if (!user) return null;

    try {
      // Check if a task already exists for today
      const existingTask = await this.getTodaysTask();
      if (existingTask) {
        console.log('Task already exists for today');
        return existingTask;
      }

      const taskData = {
        title,
        description: '',
        completed: false,
        createdAt: firestore.FieldValue.serverTimestamp(),
        isCustom,
      };

      const docRef = await firestore()
        .collection('users')
        .doc(user.uid)
        .collection('morningTasks')
        .add(taskData);

      return {
        id: docRef.id,
        title,
        description: '',
        completed: false,
        createdAt: new Date(),
        isCustom,
      };
    } catch (error) {
      console.error('Error creating today\'s task:', error);
      return null;
    }
  }

  async completeTask(taskId: string): Promise<boolean> {
    const user = this.getCurrentUser();
    if (!user) return false;

    try {
      await firestore()
        .collection('users')
        .doc(user.uid)
        .collection('morningTasks')
        .doc(taskId)
        .update({
          completed: true,
          completedAt: firestore.FieldValue.serverTimestamp(),
        });

      return true;
    } catch (error) {
      console.error('Error completing task:', error);
      return false;
    }
  }

  async getTaskHistory(limit: number = 7): Promise<MorningTask[]> {
    const user = this.getCurrentUser();
    if (!user) return [];

    try {
      const taskDocs = await firestore()
        .collection('users')
        .doc(user.uid)
        .collection('morningTasks')
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();

      return taskDocs.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          description: data.description || '',
          completed: data.completed || false,
          createdAt: data.createdAt.toDate(),
          completedAt: data.completedAt?.toDate(),
          isCustom: data.isCustom || false,
        };
      });
    } catch (error) {
      console.error('Error getting task history:', error);
      return [];
    }
  }

  async getTaskStats(): Promise<{ total: number; completed: number; streak: number }> {
    const user = this.getCurrentUser();
    if (!user) return { total: 0, completed: 0, streak: 0 };

    try {
      const taskDocs = await firestore()
        .collection('users')
        .doc(user.uid)
        .collection('morningTasks')
        .orderBy('createdAt', 'desc')
        .get();

      const tasks = taskDocs.docs.map(doc => {
        const data = doc.data();
        return {
          completed: data.completed || false,
          createdAt: data.createdAt.toDate(),
        };
      });

      const total = tasks.length;
      const completed = tasks.filter(task => task.completed).length;

      // Calculate current streak
      let streak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (const task of tasks) {
        const taskDate = new Date(task.createdAt);
        taskDate.setHours(0, 0, 0, 0);

        if (taskDate.getTime() === today.getTime() - (streak * 24 * 60 * 60 * 1000)) {
          if (task.completed) {
            streak++;
          } else {
            break;
          }
        } else {
          break;
        }
      }

      return { total, completed, streak };
    } catch (error) {
      console.error('Error getting task stats:', error);
      return { total: 0, completed: 0, streak: 0 };
    }
  }
}

export const taskService = new TaskService(); 