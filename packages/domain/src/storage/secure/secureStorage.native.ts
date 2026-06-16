//
// Storing and accessing of secure, persistent data (e.g. user credentials and api key) on mobile devices
//

import * as ExpoSecureStore from 'expo-secure-store';

export const SecureStorage = {
  async save(key: string, value: string) {
    await ExpoSecureStore.setItemAsync(key, value);
  },

  async get(key: string): Promise<string | null> {
    return await ExpoSecureStore.getItemAsync(key);
  },

  async delete(key: string) {
    await ExpoSecureStore.deleteItemAsync(key);
  },
};
