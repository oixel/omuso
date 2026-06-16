import { AuthStore, Credentials } from '@choral/types';
import { create } from 'zustand';
import { SecureStorage } from '../storage';

//
// Consumed by UI to get / alter AudioPlayer's state
//

// Does not use set / get since this store is event-driven using listeners to ensure that states are in sync
export const useAuth = create<AuthStore>()((set, get) => ({
  credentials: null,
  loading: true, // True until credentials are fully loaded

  loadCredentials: async (): Promise<boolean> => {
    const stored = await SecureStorage.get('credentials');
    set({
      credentials: stored ? JSON.parse(stored) : null,
      loading: false,
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
