import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Save data to AsyncStorage with JSON serialization
 *
 * @param key - Storage key
 * @param data - Data to store (will be JSON stringified)
 */
export const setAsyncStorage = async <T>(key: string, data: T) => {
  await AsyncStorage.setItem(key, JSON.stringify(data));
};

/**
 * Retrieve data from AsyncStorage with JSON parsing
 *
 * @param key - Storage key
 * @returns Parsed data or null if not found
 */
export const getAsyncStorage = async (key: string) => {
  const storedData = await AsyncStorage.getItem(key);
  return storedData ? JSON.parse(storedData) : null;
};

/**
 * Remove data from AsyncStorage
 *
 * @param key - Storage key to remove
 */
export const removeAsyncStorage = async (key: string) => {
  await AsyncStorage.removeItem(key);
};
