import AsyncStorage from '@react-native-async-storage/async-storage';

export const Cache = {
  async get(key: string) {
    return await AsyncStorage.getItem(key);
  },
  async set(key: string, value: string) {
    await AsyncStorage.setItem(key, value);
  },
};
