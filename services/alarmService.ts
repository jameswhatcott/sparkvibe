import PushNotification from 'react-native-push-notification';
import { messageService } from './messageService';

class AlarmService {
  constructor() {
    this.configurePushNotifications();
  }

  configurePushNotifications() {
    PushNotification.configure({
      onRegister: function (token) {
        console.log("TOKEN:", token);
      },
      onNotification: function (notification) {
        console.log("NOTIFICATION:", notification);
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: true,
    });

    // Create notification channel for Android
    PushNotification.createChannel(
      {
        channelId: "wake-up-alarm",
        channelName: "Wake Up Alarm",
        channelDescription: "Morning wake-up alarm with motivational messages",
        playSound: true,
        soundName: "default",
        importance: 4,
        vibrate: true,
      },
      (created) => console.log(`Channel created: ${created}`)
    );
  }

  async scheduleAlarm(wakeTime: string, userId: string) {
    try {
      // Parse wake time (assuming format like "07:30")
      const [hours, minutes] = wakeTime.split(':').map(Number);
      
      // Cancel any existing alarms
      this.cancelAlarm();
      
      // Schedule new alarm for every day at the specified time
      PushNotification.localNotificationSchedule({
        channelId: "wake-up-alarm",
        title: "Good Morning! ��",
        message: "Time to start your day with purpose!",
        date: this.getNextAlarmTime(hours, minutes),
        repeatType: 'day',
        allowWhileIdle: true,
        id: 'wake-up-alarm',
        userInfo: { userId },
        playSound: true,
        soundName: 'default',
        importance: 'high',
        priority: 'high',
      });

      console.log(`Alarm scheduled for ${wakeTime} daily`);
    } catch (error) {
      console.error('Error scheduling alarm:', error);
    }
  }

  private getNextAlarmTime(hours: number, minutes: number): Date {
    const now = new Date();
    const alarmTime = new Date();
    alarmTime.setHours(hours, minutes, 0, 0);
    
    // If alarm time has passed today, schedule for tomorrow
    if (alarmTime <= now) {
      alarmTime.setDate(alarmTime.getDate() + 1);
    }
    
    return alarmTime;
  }

  cancelAlarm() {
    PushNotification.cancelLocalNotifications({ id: 'wake-up-alarm' });
  }

  async showWakeUpMessage(userId: string) {
    try {
      const message = await messageService.getPersonalizedMessage();
      if (message) {
        PushNotification.localNotification({
          channelId: "wake-up-alarm",
          title: "Your Morning Message ✨",
          message: message.text,
          playSound: false,
          importance: 'high',
          priority: 'high',
        });
      }
    } catch (error) {
      console.error('Error showing wake-up message:', error);
    }
  }
}

export const alarmService = new AlarmService();