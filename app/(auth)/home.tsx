import { View, Text, Button, StyleSheet } from 'react-native';
import auth from '@react-native-firebase/auth';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

const Page = () => {
    const user = auth().currentUser;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Welcome back {user?.email}</Text>
                <Button title='Sign out' onPress={() => auth().signOut()} />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
});

export default Page;