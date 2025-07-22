import { useState, useEffect, useCallback, useRef } from 'react';
import { storeData, getData, removeData } from '../utils/storage';
import { User } from '../types';
import uuid from 'react-uuid';
import bcrypt from 'react-native-bcrypt';
import { getRandomBytes } from 'react-native-randombytes';
import defaultUsers from '../data/Users.json';
import isaac from 'isaac';
import AsyncStorage from '@react-native-async-storage/async-storage';


bcrypt.setRandomFallback((len:number) => {
  const buf = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    buf[i] = Math.floor(isaac.random() * 256);
  }
  return buf;
});
// Performance monitoring utility
const perfLogger = {
  start: (label: string) => {
    if (__DEV__) {
      console.time(label);
      return Date.now();
    }
    return 0;
  },
  end: (label: string, startTime?: number) => {
    if (__DEV__) {
      console.timeEnd(label);
      if (startTime) {
        console.log(`${label} took ${Date.now() - startTime}ms`);
      }
    }
  }
};

// Constants
const DB_KEY = 'user-database';
const CURRENT_USER_KEY = 'current-user';
const TOKEN_EXPIRY_HOURS = 24;
const SALT_ROUNDS = 8; // Balanced security/performance for mobile

// Cache for frequently accessed data
const authCache = {
  emailToId: new Map<string, string>(),
  userTokens: new Map<string, { token: string; expiry: number }>()
};

// Fast storage operations with debouncing
const debouncedUpdates = new Map<string, NodeJS.Timeout>();
const fastStoreData = async (key: string, value: string) => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (err) {
    console.error('Storage error:', err);
  }
};

const updateUserInDB = (user: User) => {
  if (debouncedUpdates.has(user.id)) {
    clearTimeout(debouncedUpdates.get(user.id));
  }

  debouncedUpdates.set(user.id, setTimeout(async () => {
    const currentDB = await getData(DB_KEY);
    const updatedDB = { ...JSON.parse(currentDB || '{}'), [user.id]: user };
    await fastStoreData(DB_KEY, JSON.stringify(updatedDB));
    debouncedUpdates.delete(user.id);
  }, 500));
};

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
  const initialized = useRef(false);

  // Helper function to promisify bcrypt calls
  const bcryptHash = useCallback((password: string, saltRounds: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      console.log(typeof password,typeof saltRounds); 
      console.log("bcryptHash======",password,8)
      bcrypt.genSalt(saltRounds, function(err, salt) {
        if (err) {
          console.error("Salt error:", err);
          return;
        }
        console.log(salt)
        bcrypt.hash(password, salt, (err:any, hash:string) => {
          if (err){
            
            reject(err);

          } 
          
          else {
            console.log(hash)
            resolve(hash);
          }
        });
      });
    });
  },[]);

  const bcryptCompare = (password: string, hash: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, hash, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  };

  // Generate JWT token with caching
  const generateToken = useCallback((userId: string): string => {
    const cacheKey = `${userId}-${Math.floor(Date.now() / (TOKEN_EXPIRY_HOURS * 3600000))}`;
    const cached = authCache.userTokens.get(cacheKey);

    if (cached && cached.expiry > Date.now() / 1000) {
      return cached.token;
    }

    const payload = {
      userId,
      exp: Math.floor(Date.now() / 1000) + (TOKEN_EXPIRY_HOURS * 3600)
    };
    const token = `mock.${btoa(JSON.stringify(payload))}.token`;

    authCache.userTokens.set(cacheKey, {
      token,
      expiry: payload.exp
    });

    return token;
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

  // Optimized DB refresh with caching
  const refreshUsersDB = useCallback(async (): Promise<Record<string, User>> => {
    const start = perfLogger.start('refreshUsersDB');
    const storedDB = await getData(DB_KEY);
    const parsedDB = storedDB ? JSON.parse(storedDB) : {};

    // Update email cache
    Object.entries(parsedDB).forEach(([key, user]) => {
      authCache.emailToId.set(user.email.toLowerCase(), key);
    });

    setUsersDB(parsedDB);
    perfLogger.end('refreshUsersDB', start);
    return parsedDB;
  }, []);

  const getUuid = () => {
    const unique_id = uuid()
    return unique_id
  }

  // Initialize database with performance optimizations
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const initializeAuth = async () => {
      const initStart = Date.now();
      try {
        setAuthState(prev => ({ ...prev, loading: true }));

        // 1. Check current session in parallel with DB load
        const [session, db] = await Promise.all([
          getData(CURRENT_USER_KEY),
          getData(DB_KEY)
        ]);

        // 2. Fast path for logged-in users
        if (session) {
          const user = JSON.parse(session);
          if (validateToken(user.token)) {
            setAuthState({ user, loading: false, error: null });
            perfLogger.end('initializeAuth', initStart);
            return;
          }
        }

        // 3. Initialize with pre-hashed defaults if empty
        if (!db) {
          perfLogger.start('prepareDefaults');
          const defaultDB = defaultUsers.reduce((acc, user) => {
            acc[user.id] = user;
            return acc;
          }, {});
          perfLogger.end('prepareDefaults');

          await Promise.all([
            fastStoreData(DB_KEY, JSON.stringify(defaultDB)),
            setUsersDB(defaultDB)
          ]);
        } else {
          setUsersDB(JSON.parse(db));
        }

        setAuthState({ user: null, loading: false, error: null });
        perfLogger.end('initializeAuth', initStart);
      } catch (err) {
        console.error('Auth init error:', err);
        setAuthState({
          user: null,
          loading: false,
          error: 'Failed to initialize authentication'
        });
      }
    };

    // Warm up bcrypt during initialization
    // bcryptHash('warmup').catch(() => {});
    initializeAuth();
  }, []);

  // Optimized login function
  const login = async (email: string, password: string): Promise<{ success: boolean, user?: User, error?: string }> => {
    const loginStart = Date.now();
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      // 1. Fast validation
      perfLogger.start('validateCredentials');
      validateCredentials(email, password);
      perfLogger.end('validateCredentials');

      // 2. Memory-first lookup
      const emailLower = email.toLowerCase();
      let user = Object.values(usersDB).find(u =>
        u.email.toLowerCase() === emailLower
      );

      // 3. Fallback to storage if not found
      if (!user) {
        perfLogger.start('refreshUsersDB');
        const db = await refreshUsersDB();
        user = Object.values(db).find(u =>
          u.email.toLowerCase() === emailLower
        );
        perfLogger.end('refreshUsersDB');
        if (!user) throw new Error('No account found');
      }

      // 4. Password verification
      perfLogger.start('passwordVerification');
      console.log(user.passwordHash)
      const valid = user.passwordHash
        ? await bcryptCompare(password, user.passwordHash)
        : password === user.password; // Legacy fallback
      perfLogger.end('passwordVerification');

      if (!valid) throw new Error('Incorrect password');

      // 5. Generate token and update
      perfLogger.start('tokenGeneration');
      const token = generateToken(user.id);
      const updatedUser = { ...user, token };

      // 6. Async updates (don't wait)
      updateUserInDB(updatedUser);
      const { passwordHash, ...safeUser } = updatedUser;
      await fastStoreData(CURRENT_USER_KEY, JSON.stringify(safeUser));
      perfLogger.end('tokenGeneration');

      setAuthState({ user: safeUser, loading: false, error: null });

      if (__DEV__) {
        console.log(`Login completed in ${Date.now() - loginStart}ms`);
      }

      return { success: true, user: safeUser };
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Login failed';
      setAuthState(prev => ({ ...prev, error, loading: false }));

      if (__DEV__) {
        console.log(`Login failed after ${Date.now() - loginStart}ms`, error);
      }

      return { success: false, error };
    }
  };

  // Signup function with performance tracking
  const signup = async (email: string, password: string): Promise<{ success: boolean, user?: User, error?: string }> => {
    const signupStart = Date.now();
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      perfLogger.start('validateCredentials');
      validateCredentials(email, password);
      perfLogger.end('validateCredentials');

      const emailLower = email.toLowerCase();

      perfLogger.start('emailCheck');
      const currentDB = await refreshUsersDB();
      if (Object.values(currentDB).some(u => u.email.toLowerCase() === emailLower)) {
        throw new Error('Email address already in use');
      }
      perfLogger.end('emailCheck');

      perfLogger.start('signuppasswordHash');
      const passwordHash = await bcryptHash(password, SALT_ROUNDS)
      perfLogger.end('signuppasswordHash');

      const newUser: User = {
        id: `user-${getUuid()}`,
        email: emailLower,
        passwordHash,
        token: generateToken(getUuid()),
        createdAt: new Date().toISOString()
      };

      // Update database
      // perfLogger.start('dbUpdate');
      const updatedDB = { ...currentDB, [newUser.id]: newUser };
      setUsersDB(updatedDB);
      await fastStoreData(DB_KEY, JSON.stringify(updatedDB));
      // perfLogger.end('dbUpdate');

      // Store current user (without sensitive data)
      const { passwordHash: _, ...safeUser } = newUser;
      await fastStoreData(CURRENT_USER_KEY, JSON.stringify(safeUser));

      setAuthState({ user: safeUser, loading: false, error: null });

      // if (__DEV__) {
      //   console.log(`Signup completed in ${Date.now() - signupStart}ms`);
      // }

      return { success: true, user: safeUser };
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Registration failed';
      setAuthState(prev => ({ ...prev, error, loading: false }));

      // if (__DEV__) {
      //   console.log(`Signup failed after ${Date.now() - signupStart}ms`, error);
      // }

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