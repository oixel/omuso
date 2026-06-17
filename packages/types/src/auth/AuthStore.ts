import { SubsonicClient } from '@choral/api';
import { Credentials } from './Credentials';

interface AuthState {
  credentials: Credentials | null;
  loading: boolean;
  client: SubsonicClient | null;
}

export interface AuthStore extends AuthState {
  loadCredentials: () => Promise<boolean>;
  login: (credentials: Credentials) => Promise<void>;
  logout: () => Promise<void>;
}
