import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import TaskDetailScreen from '../screens/TaskDetailScreen';
import { Button } from 'react-native';
import { useAuth } from '../services/authService';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { logout } = useAuth();

  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Home"
        component={HomeScreen}
        options={{
          headerRight: () => (
            <Button onPress={logout} title="Logout" color="#000" />
          ),
        }}
      />
      <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;