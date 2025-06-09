
import { AuthSessionService } from "./auth-session";
import { AuthOperationsService } from "./auth-operations";
import { AuthUtilsService } from "./auth-utils";

/**
 * Serviço principal de autenticação que combina todos os módulos
 */
export class AuthService {
  private static instance: AuthService;
  private sessionService: AuthSessionService;
  private operationsService: AuthOperationsService;
  private utilsService: AuthUtilsService;

  private constructor() {
    this.sessionService = new AuthSessionService();
    this.operationsService = new AuthOperationsService();
    this.utilsService = new AuthUtilsService();
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Delegate to operations service
  async login(email: string, password: string): Promise<boolean> {
    return this.operationsService.login(email, password);
  }

  async logout(): Promise<void> {
    return this.operationsService.logout();
  }

  // Delegate to session service
  async getCurrentSession() {
    return this.sessionService.getCurrentSession();
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return this.sessionService.onAuthStateChange(callback);
  }

  // Delegate to utils service
  isAdmin(user: any): boolean {
    return this.utilsService.isAdmin(user);
  }

  async createAdminUser(): Promise<void> {
    return this.utilsService.createAdminUser();
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();
