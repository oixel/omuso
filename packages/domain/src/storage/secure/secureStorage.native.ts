//
// Storing and accessing of secure, persistent data (e.g. user credentials and api key) on mobile devices
//

import * as ExpoStore from 'expo-secure-store';

export const SecureStorage = {
  async save(key: string, value: string) {
    await ExpoStore.setItemAsync(key, value);
  },

  async get(key: string) {
    let result = await ExpoStore.getItemAsync(key);
    if (result) {
      console.log('Value accessed securely: ' + result);
    } else {
      console.log('Value not found!!!');
    }
  },

  async delete(key: string) {
    await ExpoStore.deleteItemAsync(key);
  },
};
