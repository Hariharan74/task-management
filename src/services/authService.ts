

import { useState, useEffect, useCallback } from 'react';
import { storeData, getData, removeData } from '../utils/storage';
import { User } from '../types';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'react-native-bcrypt';
import defaultUsers from '../data/Users.json';

// Helper function to promisify bcrypt calls
const bcryptHash = (password: string, saltRounds: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, saltRounds, (err, hash) => {
      if (err) reject(err);
      else resolve(hash);
    });
  });
};

const bcryptCompare = (password: string, hash: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, hash, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
};

// Constants
const DB_KEY = 'user-database';
const CURRENT_USER_KEY = 'current-user';
const TOKEN_EXPIRY_HOURS = 24;
const SALT_ROUNDS = 10;

export const useAuth = () => {
  const [authState, setAuthState] = useState<{
    user: User | null;
    loading: boolean;
    error: string | null;
  }>({
    user: null,
    loading: true,
    error: null
  });

  const [usersDB, setUsersDB] = useState<Record<string, User>>({});

  // Generate JWT token
  const generateToken = useCallback((userId: string): string => {
    const payload = { 
      userId,
      exp: Math.floor(Date.now() / 1000) + (TOKEN_EXPIRY_HOURS * 3600)
    };
    return `mock.${btoa(JSON.stringify(payload))}.token`;
  }, []);

  // Validate token
  const validateToken = useCallback((token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp > Math.floor(Date.now() / 1000);
    } catch {
      return false;
    }
  }, []);

  // Validate user credentials format
  const validateCredentials = useCallback((email: string, password: string): void => {
    if (!email?.includes('@')) throw new Error('Please enter a valid email address');
    if (!password || password.length < 6) throw new Error('Password must be at least 6 characters');
  }, []);

  const refreshUsersDB = useCallback(async (): Promise<Record<string, User>> => {
    const storedDB = await getData(DB_KEY);
    const parsedDB = storedDB ? JSON.parse(storedDB) : {};
    setUsersDB(parsedDB);
    return parsedDB;
  }, []);

  // Initialize database
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setAuthState(prev => ({ ...prev, loading: true }));
        
        // 1. Load existing DB
        const storedDB = await getData(DB_KEY);
        const initialDB = storedDB ? JSON.parse(storedDB) : {};
        
        // 2. Prepare default users with hashed passwords
        const preparedDefaults = await Promise.all(
          Object.entries(defaultUsers).map(async ([key, user]) => {
            const passwordHash = user.passwordHash || await bcryptHash(user.password, SALT_ROUNDS);
            return {
              [key]: {
                ...user,
                passwordHash,
                token: user.token || generateToken(user.id)
              }
            };
          })
        ).then(results => Object.assign({}, ...results));
        
        // 3. Merge with priority to existing users
        const mergedDB = { ...preparedDefaults, ...initialDB };
        
        setUsersDB(mergedDB);
        await storeData(DB_KEY, JSON.stringify(mergedDB));
        
        // 4. Load current session
        const storedUser = await getData(CURRENT_USER_KEY);
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser?.id && validateToken(parsedUser.token)) {
            setAuthState({ user: parsedUser, loading: false, error: null });
            return;
          }
          await removeData(CURRENT_USER_KEY);
        }
        
        setAuthState({ user: null, loading: false, error: null });
      } catch (err) {
        console.error('Auth init error:', err);
        setAuthState({
          user: null,
          loading: false,
          error: 'Failed to initialize authentication'
        });
      }
    };
  
    initializeAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<{success: boolean, user?: User, error?: string}> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      validateCredentials(email, password);
      const newUpdateDB = await refreshUsersDB();
      const userKey = Object.keys(newUpdateDB).find(key => 
        newUpdateDB[key].email.toLowerCase() === email.toLowerCase()
      );
      
      if (!userKey) {
        throw new Error('No account found with this email address');
      }
      
      const user = newUpdateDB[userKey];
      let valid = false;
  
      // Special handling for default users
      if (userKey.startsWith('default-')) {
        // First try direct comparison (for plain text passwords)
        if (user.password && password === user.password) {
          valid = true;
          // If matched plain text, generate hash for future use
          if (!user.passwordHash) {
            const passwordHash = await bcryptHash(password, SALT_ROUNDS);
            const updatedUser = { ...user, passwordHash };
            const updatedDB = { ...newUpdateDB, [userKey]: updatedUser };
            setUsersDB(updatedDB);
            await storeData(DB_KEY, JSON.stringify(updatedDB));
          }
        } else {
          // Fallback to bcrypt compare if plain text didn't match
          valid = await bcryptCompare(password, user.passwordHash);
        }
      } else {
        // Regular users must use bcrypt
        valid = await bcryptCompare(password, user.passwordHash);
      }
      
      if (!valid) {
        throw new Error('Incorrect password');
      }
      
      const token = generateToken(user.id);
      const updatedUser = { ...user, token };
      
      const updatedDB = { ...newUpdateDB, [userKey]: updatedUser };
      setUsersDB(updatedDB);
      await storeData(DB_KEY, JSON.stringify(updatedDB));
      
      const { passwordHash, ...safeUser } = updatedUser;
      await storeData(CURRENT_USER_KEY, JSON.stringify(safeUser));
      setAuthState({ user: safeUser, loading: false, error: null });
      
      return { success: true, user: safeUser };
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Login failed';
      setAuthState(prev => ({ ...prev, error, loading: false }));
      return { success: false, error };
    }
  };

  // Signup function
  const signup = async (email: string, password: string): Promise<{success: boolean, user?: User, error?: string}> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      validateCredentials(email, password);

      const emailLower = email.toLowerCase();
      const currentDB = await refreshUsersDB();
      if (Object.values(currentDB).some(u => u.email.toLowerCase() === emailLower)) {
        throw new Error('Email address already in use');
      }

      const passwordHash = await bcryptHash(password, SALT_ROUNDS);
      const newUser: User = {
        id: `user-${uuidv4()}`,
        email: emailLower,
        passwordHash,
        token: generateToken(uuidv4()),
        createdAt: new Date().toISOString()
      };

      // Update database
      const updatedDB = { ...currentDB, [newUser.id]: newUser };
      setUsersDB(updatedDB);
      await storeData(DB_KEY, JSON.stringify(updatedDB));
      
      // Store current user (without sensitive data)
      const { passwordHash: _, ...safeUser } = newUser;
      await storeData(CURRENT_USER_KEY, JSON.stringify(safeUser));
      setAuthState({ user: safeUser, loading: false, error: null });
      
      return { success: true, user: safeUser };
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Registration failed';
      setAuthState(prev => ({ ...prev, error, loading: false }));
      return { success: false, error };
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      await removeData(CURRENT_USER_KEY);
      setAuthState({ user: null, loading: false, error: null });
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Logout failed';
      setAuthState(prev => ({ ...prev, error, loading: false }));
      throw err;
    }
  };

  // Middleware for protected operations
  const withAuth = async <T>(operation: (token: string) => Promise<T>): Promise<T> => {
    if (!authState.user?.token) throw new Error('Authentication required');
    if (!validateToken(authState.user.token)) {
      await logout();
      throw new Error('Session expired. Please login again.');
    }
    return operation(authState.user.token);
  };

  // Get all users (for debugging)
  const getUsers = useCallback((): User[] => {
    return Object.values(usersDB).map(({ passwordHash, ...user }) => user);
  }, [usersDB]);

  return { 
    ...authState,
    login,
    signup,
    logout,
    withAuth,
    getUsers,
    isAuthenticated: !!authState.user
  };
};