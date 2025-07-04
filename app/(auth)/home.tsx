import { View, Text, Button } from 'react-native';
import auth from '@react-native-firebase/auth';
import React from 'react'

const Page = () => {
    const user = auth().currentUser;


  return (
    <View>
    <Text>Welcome back {user?.email}</Text>
      <Button title='Sign out' onPress={() => auth().signOut()} />
    </View>
  )
}

export default Page