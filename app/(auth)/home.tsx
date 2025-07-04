import { View, Text, Button } from 'react-native';
import auth from '@react-native-firebase/auth';
import React from 'react';
import { seedMessages } from '../../services/seedData';

const Page = () => {
    const user = auth().currentUser;

    const handleSeedMessages = async () => {
        try {
            const success = await seedMessages();
            if (success) {
                alert('Messages seeded successfully!');
            } else {
                alert('Failed to seed messages');
            }
        } catch (error) {
            console.error('Error seeding messages:', error);
            alert('Error seeding messages');
        }
    };

    return (
        <View>
            <Text>Welcome back {user?.email}</Text>
            <Button title='Sign out' onPress={() => auth().signOut()} />
            <Button title='Seed Messages' onPress={handleSeedMessages} />
        </View>
    );
};

export default Page;