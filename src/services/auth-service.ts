import { authService } from "./auth-service-refactored";

/**
 * @deprecated Use authService from auth-service-refactored.ts instead
 * This file is kept for backward compatibility only
 */
export class AuthService {
  static getInstance() {
    console.warn('[AuthService] DEPRECATED: Use authService from auth-service-refactored.ts instead');
    return authService;
  }

  async login(credentials: any): Promise<any> {
    console.warn('[AuthService] DEPRECATED: Use authService from auth-service-refactored.ts instead');
    return authService.login(credentials.email, credentials.password);
  }

  async logout(): Promise<void> {
    console.warn('[AuthService] DEPRECATED: Use authService from auth-service-refactored.ts instead');
    return authService.logout();
  }

  async refreshToken(): Promise<any> {
    console.warn('[AuthService] DEPRECATED: Use authService from auth-service-refactored.ts instead');
    return authService.getCurrentSession();
  }

  getSessionConfig(): any {
    console.warn('[AuthService] DEPRECATED: Session config is no longer needed. configurations are now automatic');
    return {
      timeout: 30,
      maxAttempts: 5,
      blockDuration: 15
    };
  }
}

// Re-export for compatibility
export const authService = AuthService.getInstance();
