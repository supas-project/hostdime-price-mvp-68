
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

export function useSessionDiagnostics() {
  const [user, setUser] = useState<User | null>(null);
  const [sessionStatus, setSessionStatus] = useState<"authenticated" | "unauthenticated" | "loading">("loading");
  const [sessionDetails, setSessionDetails] = useState<{[key: string]: any} | null>(null);
  const [serverTime, setServerTime] = useState<Date | null>(null);
  
  // Fetch session information
  useEffect(() => {
    const fetchSessionInfo = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          setSessionStatus("unauthenticated");
          setUser(null);
          return;
        }
        
        if (user) {
          setUser(user);
          setSessionStatus("authenticated");
          
          // Fetch the session to get more details
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (!sessionError && session) {
            setSessionDetails({
              sessionCreatedAt: session.created_at || new Date().toISOString(), // Use session created_at if available
              lastActivity: new Date().toISOString(),
              expiresAt: session?.expires_at,
              provider: session?.user.app_metadata.provider,
              lastSignIn: user.last_sign_in_at 
            });
          }
        } else {
          setSessionStatus("unauthenticated");
        }
        
        // Get server time for syncing
        // This is just an approximation since we can't directly query the server's time
        setServerTime(new Date());
      } catch (error) {
        console.error("Error fetching session info:", error);
        setSessionStatus("unauthenticated");
      }
    };
    
    fetchSessionInfo();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        setSessionStatus("authenticated");
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setSessionStatus("unauthenticated");
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  return {
    user,
    sessionStatus,
    sessionDetails,
    serverTime,
  };
}
