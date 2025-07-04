import AchievementsModal from '../components/AchievementsModal';
import { View, Text, Button, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import MorningTaskModal from '../components/MorningTaskModal';
import TaskCard from '../components/TaskCard';
import RewardCard from '../components/RewardCard';
import { taskService, MorningTask } from '../../services/taskService';
import { rewardService, UserRewards } from '../../services/rewardService';

const Page = () => {
    const user = auth().currentUser;
    const [showAchievementsModal, setShowAchievementsModal] = useState(false);
    const [todaysTask, setTodaysTask] = useState<MorningTask | null>(null);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [taskStats, setTaskStats] = useState({ total: 0, completed: 0, streak: 0 });
    const [userRewards, setUserRewards] = useState<UserRewards | null>(null);

    useEffect(() => {
        loadTodaysTask();
        loadTaskStats();
        loadUserRewards();
    }, []);


    const loadTodaysTask = async () => {
        try {
            const task = await taskService.getTodaysTask();
            setTodaysTask(task);
        } catch (error) {
            console.error('Error loading today\'s task:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadTaskStats = async () => {
        try {
            const stats = await taskService.getTaskStats();
            setTaskStats(stats);
        } catch (error) {
            console.error('Error loading task stats:', error);
        }
    };

    const loadUserRewards = async () => {
        try {
            const rewards = await rewardService.getUserRewards();
            setUserRewards(rewards);
        } catch (error) {
            console.error('Error loading user rewards:', error);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await Promise.all([loadTodaysTask(), loadTaskStats(), loadUserRewards()]);
        setRefreshing(false);
    };

    const handleTaskCreated = (task: MorningTask) => {
        setTodaysTask(task);
        loadTaskStats();
        loadUserRewards();
    };

    const handleTaskCompleted = () => {
        if (todaysTask) {
            setTodaysTask({ ...todaysTask, completed: true, completedAt: new Date() });
        }
        loadTaskStats();
        loadUserRewards();
    };

    const handleViewAchievements = () => {
        if (userRewards) {
            console.log("Showing Achievements");
            setShowAchievementsModal(true);
        } else {
            Alert.alert('Loading', 'Please wait while we load your achievements...');
        }
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView 
                style={styles.scrollView}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
            >
                <View style={styles.header}>
                    <Text style={styles.greeting}>{getGreeting()}, {user?.email?.split('@')[0] || 'there'}!</Text>
                    <Text style={styles.subtitle}>Let&apos;s build momentum for your day</Text>
                </View>

                {/* Task Stats */}
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{taskStats.streak}</Text>
                        <Text style={styles.statLabel}>Day Streak</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{taskStats.completed}</Text>
                        <Text style={styles.statLabel}>Completed</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{taskStats.total}</Text>
                        <Text style={styles.statLabel}>Total Tasks</Text>
                    </View>
                </View>

                {/* Reward Card */}
                {userRewards && (
                    <View style={styles.taskSection}>
                        <RewardCard 
                            rewards={userRewards}
                            onViewAchievements={handleViewAchievements}
                        />
                    </View>
                )}

                {/* Today's Task Section */}
                <View style={styles.taskSection}>
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <Text style={styles.loadingText}>Loading your task...</Text>
                        </View>
                    ) : todaysTask ? (
                        <TaskCard task={todaysTask} onTaskCompleted={handleTaskCompleted} />
                    ) : (
                        <View style={styles.noTaskContainer}>
                            <Text style={styles.noTaskTitle}>No task set for today</Text>
                            <Text style={styles.noTaskSubtitle}>
                                Choose a morning task to build momentum
                            </Text>
                            <TouchableOpacity
                                style={styles.addTaskButton}
                                onPress={() => setShowTaskModal(true)}
                            >
                                <Text style={styles.addTaskButtonText}>Choose a Task</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Quick Actions */}
                <View style={styles.actionsContainer}>
                    {!todaysTask && (
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => setShowTaskModal(true)}
                        >
                            <Text style={styles.actionButtonText}>Set Morning Task</Text>
                        </TouchableOpacity>
                    )}
                    
                    <TouchableOpacity
                        style={[styles.actionButton, styles.secondaryButton]}
                        onPress={() => setShowTaskModal(true)}
                    >
                        <Text style={styles.secondaryButtonText}>Test Task Modal</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        style={[styles.actionButton, styles.secondaryButton]}
                        onPress={() => auth().signOut()}
                    >
                        <Text style={styles.secondaryButtonText}>Sign Out</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <MorningTaskModal
                visible={showTaskModal}
                onClose={() => setShowTaskModal(false)}
                onTaskCreated={handleTaskCreated}
            />
            <AchievementsModal
                visible={showAchievementsModal}
                onClose={() => setShowAchievementsModal(false)}
                userRewards={userRewards}
/>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollView: {
        flex: 1,
    },
    header: {
        padding: 20,
        paddingBottom: 10,
    },
    greeting: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 20,
        paddingVertical: 20,
        backgroundColor: 'white',
        marginHorizontal: 20,
        borderRadius: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
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
    taskSection: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    loadingContainer: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 40,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
    },
    noTaskContainer: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 30,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    noTaskTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    noTaskSubtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 22,
    },
    addTaskButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    addTaskButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    actionsContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        gap: 12,
    },
    actionButton: {
        backgroundColor: '#007AFF',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    actionButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    secondaryButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default Page;