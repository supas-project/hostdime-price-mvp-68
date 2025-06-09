
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

/**
 * Serviço para gerenciamento de sessões
 */
export class AuthSessionService {
  /**
   * Get current session
   */
  async getCurrentSession(): Promise<{ user: User | null; session: Session | null }> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("❌ Session error:", error);
        return { user: null, session: null };
      }
      
      return { 
        user: session?.user || null, 
        session 
      };
    } catch (error) {
      console.error("❌ Get session error:", error);
      return { user: null, session: null };
    }
  }

  /**
   * Set up auth state listener
   */
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
}
