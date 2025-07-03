import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import AuthForm from '../components/AuthForm';
import { useAuth } from '../services/authService';
import { storeObject, getObject, initializeUserStorage } from '../utils/storage';


const SignupScreen = ({ navigation }) => {
    const { signup } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Initialize storage when component mounts
  useEffect(() => {
    const init = async () => {
      try {
        await initializeUserStorage();
        setInitialized(true);
      } catch (error) {
        console.error('Storage initialization failed:', error);
      }
    };
    init();
  }, []);

  const handleSignup = async (values: { email: string; password: string }, 
                           { setErrors }: { setErrors: (errors: any) => void }) => {
    if (!initialized) {
      setErrors({ general: 'System is initializing. Please try again shortly.' });
      return;
    }

    setIsLoading(true);
    try {
      // Get existing users
      const existingUsers = await getObject<Array<{ email: string }>>('users.json') || [];
      
      // Check for duplicate email
      if (existingUsers.some(user => user.email === values.email)) {
        setErrors({ email: 'This email is already registered' });
        return;
      }

      // Perform authentication
      const result = await signup(values.email, values.password);
      
      if (!result.success) {
        setErrors({ general: result.error || 'Signup failed' });
        return;
      }

      // Update users list with additional metadata
      const updatedUsers = [...existingUsers, { 
        email: values.email,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        id: result.user?.id || `temp-${Date.now()}`
      }];
      
      // Save to AsyncStorage
      await storeObject('users.json', updatedUsers);
      
      // Navigate after successful signup
      navigation.navigate('Login');
    } catch (error) {
      // Handle different error types
      let errorMessage = error.message || 'Signup failed';
      if (errorMessage.includes('auth/email-already-in-use')) {
        errorMessage = 'This email is already registered';
      }
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  // Debug function to view storage contents (remove in production)
  const showStorageContents = async () => {
    try {
      const users = await getObject('users.json');
      alert(`Current users:\n${JSON.stringify(users, null, 2)}`);
    } catch (error) {
      console.error('Error getting storage contents:', error);
    }
  };

  if (!initialized) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AuthForm
        type="signup"
        onSubmit={handleSignup}
        onNavigate={() => navigation.navigate('Login')}
        isLoading={isLoading}
        logoSource={require('../assets/company-logo.svg')}
      />
      
      {/* Development-only debug button - now matching AuthForm button style */}
      {/* {__DEV__ && (
        <TouchableOpacity
          style={[styles.debugButton, isLoading && styles.disabledButton]}
          onPress={showStorageContents}
          disabled={isLoading}
        >
          <Text style={styles.debugButtonText}>Show Storage Contents</Text>
        </TouchableOpacity>
      )} */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
    
  },
  center: {
    alignItems: 'center',
  },
  debugButton: {
    backgroundColor: '#666',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  debugButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default SignupScreen;