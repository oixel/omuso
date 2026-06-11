import { SecureStorage } from './storage/secure';

export const Auth = {
  setCredentials() {
    SecureStorage.save('test', 'value');
  },

  getCredentials() {
    SecureStorage.get('test');
  },

  deleteCredentials() {
    SecureStorage.delete('test');
  },
};
