
import { LoginCredentials, AuthUser, SessionConfig } from "@/types/auth";
import { toast } from "sonner";

const SESSION_CONFIG: SessionConfig = {
  timeout: 30, // 30 minutos
  maxAttempts: 5,
  blockDuration: 15 // 15 minutos
};

export class AuthService {
  private static instance: AuthService;
  private attemptCounter: Map<string, { count: number; lastAttempt: Date }> = new Map();

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(credentials: LoginCredentials): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      // Verificar tentativas de login
      if (this.isBlocked(credentials.email)) {
        const blockTime = this.getBlockTimeRemaining(credentials.email);
        return {
          user: null,
          error: `Muitas tentativas de login. Tente novamente em ${blockTime} minutos.`
        };
      }

      // Normalizar email
      const email = credentials.email.trim().toLowerCase();

      // Fazer login via API
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password: credentials.password
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        this.recordFailedAttempt(email);
        console.error("Erro de autenticação:", data.error);
        
        return { user: null, error: data.error || "Email ou senha incorretos" };
      }

      if (!data.user) {
        return { user: null, error: "Erro interno de autenticação" };
      }

      // Reset contador de tentativas em caso de sucesso
      this.resetAttempts(email);

      // Salvar token
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
      }

      const authUser: AuthUser = {
        id: data.user.id,
        email: data.user.email,
        nome_completo: data.user.name || '',
        tipo: data.user.isAdmin ? 'ADMIN' : 'USER',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      return { user: authUser, error: null };

    } catch (error) {
      console.error("Erro no serviço de autenticação:", error);
      return { 
        user: null, 
        error: "Erro interno do sistema. Tente novamente." 
      };
    }
  }

  async logout(): Promise<void> {
    try {
      // Remover token local
      localStorage.removeItem('auth_token');
      
      // Se houver endpoint de logout na API, chamar aqui
      // await fetch('/api/logout', { method: 'POST' });
      
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      throw error;
    }
  }

  async refreshToken(): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error || !data.user) {
        return { user: null, error: "Sessão expirada" };
      }

      // Buscar dados atualizados do perfil
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      const authUser: AuthUser = {
        id: data.user.id,
        email: data.user.email!,
        nome_completo: profile?.nome_completo || '',
        tipo: profile?.tipo || 'USER',
        created_at: data.user.created_at,
        updated_at: profile?.updated_at || data.user.updated_at
      };

      return { user: authUser, error: null };

    } catch (error) {
      console.error("Erro ao atualizar token:", error);
      return { user: null, error: "Erro ao atualizar sessão" };
    }
  }

  private isBlocked(email: string): boolean {
    const attempts = this.attemptCounter.get(email);
    if (!attempts) return false;

    const now = new Date();
    const timeDiff = (now.getTime() - attempts.lastAttempt.getTime()) / (1000 * 60); // em minutos

    if (attempts.count >= SESSION_CONFIG.maxAttempts && timeDiff < SESSION_CONFIG.blockDuration) {
      return true;
    }

    // Se passou o tempo de bloqueio, reset o contador
    if (timeDiff >= SESSION_CONFIG.blockDuration) {
      this.attemptCounter.delete(email);
    }

    return false;
  }

  private recordFailedAttempt(email: string): void {
    const attempts = this.attemptCounter.get(email) || { count: 0, lastAttempt: new Date() };
    attempts.count++;
    attempts.lastAttempt = new Date();
    this.attemptCounter.set(email, attempts);
  }

  private resetAttempts(email: string): void {
    this.attemptCounter.delete(email);
  }

  private getBlockTimeRemaining(email: string): number {
    const attempts = this.attemptCounter.get(email);
    if (!attempts) return 0;

    const now = new Date();
    const timeDiff = (now.getTime() - attempts.lastAttempt.getTime()) / (1000 * 60);
    return Math.ceil(SESSION_CONFIG.blockDuration - timeDiff);
  }

  getSessionConfig(): SessionConfig {
    return SESSION_CONFIG;
  }
}

export const authService = AuthService.getInstance();
