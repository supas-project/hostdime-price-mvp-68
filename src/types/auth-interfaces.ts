
export interface AuthProvider {
  login(email: string, password: string): Promise<boolean>;
  logout(): Promise<void>;
  getCurrentSession(): Promise<{ user: any; session: any }>;
  onAuthStateChange(callback: (event: string, session: any) => void): any;
  isAdmin(user: any): boolean;
  createAdminUser(): Promise<void>;
}

export interface AuthState {
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: any;
  session: any;
  loading: boolean;
  isSupabaseReady: boolean;
}

export interface AuthActions {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

export interface UserRole {
  id: string;
  name: string;
  permissions: string[];
}

export interface AuthContextType extends AuthState, AuthActions {}
