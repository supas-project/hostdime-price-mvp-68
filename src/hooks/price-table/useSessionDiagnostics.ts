
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export function useSessionDiagnostics() {
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  
  // Fetch diagnostic information
  useEffect(() => {
    const fetchDiagnosticInfo = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get session information
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw new Error(`Session error: ${sessionError.message}`);
        }
        
        // Get system information
        const systemInfo = {
          userAgent: navigator.userAgent,
          language: navigator.language,
          platform: navigator.platform,
          connectionType: (navigator as any).connection ? 
            (navigator as any).connection.effectiveType : 'unknown'
        };
        
        // Combine all diagnostic information
        setSessionInfo({
          user: user ? {
            id: user.id,
            email: user.email,
            lastLogin: user.lastSignInAt
          } : 'No user authenticated',
          session: sessionData?.session ? {
            id: sessionData.session.access_token?.substring(0, 8) + '...',
            expiresAt: new Date(sessionData.session.expires_at || 0).toLocaleString()
          } : 'No active session',
          system: systemInfo
        });
        
      } catch (err: any) {
        setError(`Failed to load diagnostic info: ${err.message}`);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDiagnosticInfo();
  }, [user]);
  
  return { sessionInfo, isLoading, error };
}
