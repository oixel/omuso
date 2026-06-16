import { Credentials } from './Credentials';

interface AuthState {
  credentials: Credentials | null;
  isLoading: boolean;
}

export interface AuthStore extends AuthState {
  loadCredentials: () => Promise<boolean>;
  login: (credentials: Credentials) => Promise<void>;
  logout: () => Promise<void>;
}
