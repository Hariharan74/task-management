import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AuthForm from '../components/AuthForm';
import { useAuth } from '../services/authService';

type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Home: undefined;
};

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { login, loading } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);

  const handleLogin = async (values: { email: string; password: string }) => {
    setAuthError(null);
    try {
      const result = await login(values.email, values.password);
      
      if (result.success) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }]
        });
      } else {
        // Handle specific error cases
        if (result.error?.includes('Incorrect password')) {
          setAuthError('Incorrect password');
        } else if (result.error?.includes('No account found')) {
          setAuthError('No account with this email');
        } else {
          setAuthError(result.error || 'Login failed');
        }
      }
    } catch (error) {
      setAuthError('An unexpected error occurred');
    }
  };

  return (
    <View style={styles.container}>
      <AuthForm
        type="login"
        onSubmit={handleLogin}
        onNavigate={() => navigation.navigate('Signup')}
        isLoading={loading}
        authError={authError} // Pass auth error to form
        logoSource={require('../assets/company-logo.svg')}
      />
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
});

export default LoginScreen;