
import React from 'react';
import { View, ActivityIndicator, TouchableOpacity, Text, Image, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, StackNavigationOptions } from '@react-navigation/stack';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import SignupScreen from './src/screens/SignupScreen';
import TaskDetailScreen from './src/screens/TaskDetailScreen';
import { useAuth } from './src/services/authService';

type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Signup: undefined;
  TaskDetail: { taskId: string };
};

const Stack = createStackNavigator<RootStackParamList>();

const App = () => {
  const { user, loading, logout } = useAuth();
   // Home screen options
   const HeaderLogo = () => (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Image
        source={require('./src/assets/company-logo.svg')} // Update with your actual logo path
        style={{ width: 114, height: 36, marginRight: 10 }}
        resizeMode="contain"
      />
     
    </View>
  );
  const homeScreenOptions: StackNavigationOptions = {
    // headerTitle: 'Task Management',

    headerTitle: () => <HeaderLogo />,
    headerRight: () => (
      <TouchableOpacity 
        onPress={logout}
        style={{
          marginRight: 15,
          padding: 8,
          backgroundColor: '#ff4444',
          borderRadius: 5,
          borderBottomWidth:0
          
        }}
        testID="logout-button"
      >
        
        <Text style={{ color: 'white', fontWeight: 'bold' }}>Logout</Text>
      </TouchableOpacity>
    ),
  };
  // Task Detail screen options
  const taskDetailOptions: StackNavigationOptions = {
    headerTitle: 'Task Details',
    headerBackTitle: 'Back' // Custom back button text
  };
  const authScreenOptions: StackNavigationOptions = {
    headerShown: false
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" testID="loading-indicator" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{
          // Common options for all screens
          headerBackTitleVisible: false,
          headerBackgroundContainerStyle:{
            borderBottomWidth:0
          },
          cardStyle: {
            height:'100%',
        
          },
          
        }}
        initialRouteName={user ? 'Home' : 'Login'}
      >
        {/* Declare ALL screens upfront */}
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={homeScreenOptions}
          
        />
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={authScreenOptions}
        />
        <Stack.Screen 
          name="Signup" 
          component={SignupScreen} 
          options={authScreenOptions}
        />
        <Stack.Screen 
          name="TaskDetail" 
          component={TaskDetailScreen} 
          options={taskDetailOptions}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;