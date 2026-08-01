import { AuthStore, Credentials } from '@omuso/types';
import { create } from 'zustand';
import { SecureStorage } from '../storage';
import { SubsonicClient } from '@omuso/api';

export const useAuth = create<AuthStore>()((set, get) => ({
  credentials: null,
  loading: true, // True until credentials are fully loaded
  client: null,

  loadCredentials: async (): Promise<boolean> => {
    try {
      const stored = await SecureStorage.get('credentials');
      const credentials = stored ? JSON.parse(stored) : null;
      set({
        credentials,
        loading: false,
        client: credentials ? new SubsonicClient(credentials) : null,
      });

      return get().credentials !== null;
    } catch {
      set({ credentials: null, client: null, loading: false });
      return false;
    }
  },
  login: async (credentials: Credentials): Promise<void> => {
    await SecureStorage.save('credentials', JSON.stringify(credentials));
    set({ credentials, client: new SubsonicClient(credentials), loading: false });
  },
  logout: async (): Promise<void> => {
    await SecureStorage.delete('credentials');
    set({ credentials: null, client: null });
  },
}));
