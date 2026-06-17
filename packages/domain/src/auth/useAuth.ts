import { AuthStore, Credentials } from '@choral/types';
import { create } from 'zustand';
import { SecureStorage } from '../storage';
import { SubsonicClient } from '@choral/api';

export const useAuth = create<AuthStore>()((set, get) => ({
  credentials: null,
  loading: true, // True until credentials are fully loaded
  client: null,

  loadCredentials: async (): Promise<boolean> => {
    const stored = await SecureStorage.get('credentials');
    const credentials = stored ? JSON.parse(stored) : null;
    set({
      credentials,
      loading: false,
      client: credentials ? new SubsonicClient(credentials) : null,
    });

    return get().credentials !== null;
  },
  login: async (credentials: Credentials): Promise<void> => {
    await SecureStorage.save('credentials', JSON.stringify(credentials));
    set({ credentials });
  },
  logout: async (): Promise<void> => {
    await SecureStorage.delete('credentials');
    set({ credentials: null });
  },
}));
