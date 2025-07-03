// import AsyncStorage from '@react-native-async-storage/async-storage';

// // Web fallback storage
// const webStorage = {
//   setItem: (key: string, value: string) => {
//     if (typeof window !== 'undefined') {
//       localStorage.setItem(key, value);
//     }
//   },
//   getItem: (key: string) => {
//     if (typeof window !== 'undefined') {
//       return localStorage.getItem(key);
//     }
//     return null;
//   },
//   removeItem: (key: string) => {
//     if (typeof window !== 'undefined') {
//       localStorage.removeItem(key);
//     }
//   }
// };

// export const storeData = async (key: string, value: string) => {
//   console.log(`Storing data: ${key} ${value}`);
//   try {
//     await AsyncStorage.setItem(key, value);
//     webStorage.setItem(key, value); // Web fallback
//     console.log(`Data stored successfully: ${key}`);
//   } catch (e) {
//     console.error('Error storing data', e);
//     throw e;
//   }
// };

// export const getData = async (key: string) => {
//   console.log(`Retrieving data: ${key}`);
//   try {
//     let value = await AsyncStorage.getItem(key);
    
//     if (value === null && typeof window !== 'undefined') {
//       value = webStorage.getItem(key);
//     }
    
//     console.log(`Retrieved data: ${key}`, value);
//     return value;
//   } catch (e) {
//     console.error('Error getting data', e);
//     throw e;
//   }
// };

// export const removeData = async (key: string) => {
//   console.log(`Removing data: ${key}`);
//   try {
//     await AsyncStorage.removeItem(key);
//     webStorage.removeItem(key); // Web fallback
//     console.log(`Data removed successfully: ${key}`);
//   } catch (e) {
//     console.error('Error removing data', e);
//     throw e;
//   }
// };

// // Object helpers
// export const storeObject = async (key: string, value: object) => {
//   return storeData(key, JSON.stringify(value));
// };

// export const getObject = async <T>(key: string): Promise<T | null> => {
//   const value = await getData(key);
//   return value ? JSON.parse(value) : null;
// };

// // Initialize function (optional - just for consistency with your existing code)
// export const initializeUserStorage = async () => {
//   console.log('Initializing user storage (AsyncStorage only)');
//   // No-op since we're just using AsyncStorage
// };

import AsyncStorage from '@react-native-async-storage/async-storage';

// Universal storage functions (works for both React Native and web)
export const storeData = async (key: string, value: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, value);
    console.log(`[Storage] Saved: ${key}`);
  } catch (error) {
    console.error(`[Storage] Error saving ${key}:`, error);
    throw error;
  }
};

export const getData = async (key: string): Promise<string | null> => {
  try {
    const value = await AsyncStorage.getItem(key);
    console.log(`[Storage] Retrieved: ${key}`);
    return value;
  } catch (error) {
    console.error(`[Storage] Error reading ${key}:`, error);
    throw error;
  }
};

export const removeData = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
    console.log(`[Storage] Removed: ${key}`);
  } catch (error) {
    console.error(`[Storage] Error removing ${key}:`, error);
    throw error;
  }
};

// Object helpers
export const storeObject = async <T>(key: string, value: T): Promise<void> => {
  return storeData(key, JSON.stringify(value));
};

export const getObject = async <T>(key: string): Promise<T | null> => {
  const value = await getData(key);
  return value ? JSON.parse(value) : null;
};

// Optional utilities
export const clearAllStorage = async (): Promise<void> => {
  try {
    await AsyncStorage.clear();
    console.log('[Storage] Cleared all data');
  } catch (error) {
    console.error('[Storage] Clear all error:', error);
    throw error;
  }
};

// export const getMultipleKeys = async (keys: string[]): Promise<[string, string | null][]> => {
//   try {
//     return await AsyncStorage.multiGet(keys);
//   } catch (error) {
//     console.error('[Storage] Multi-get error:', error);
//     throw error;
//   }
// };
// Initialize function (optional - just for consistency with your existing code)
export const initializeUserStorage = async () => {
  console.log('Initializing user storage (AsyncStorage only)');
  // No-op since we're just using AsyncStorage
};