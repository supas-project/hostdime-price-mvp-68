
import { useAuth } from "@/hooks/auth";
import { useLoginRedirect } from "@/hooks/auth/useLoginRedirect";
import { LoginForm } from "@/components/auth/LoginForm";
import { AuthLoadingState } from "@/components/auth/AuthLoadingState";

export default function LoginPage() {
  console.log('🔍 LoginPage component rendering');
  
  const {
    isAuthenticated,
    user,
    loading,
    isSupabaseReady
  } = useAuth();

  // Handle redirects
  useLoginRedirect({ 
    isAuthenticated, 
    isSupabaseReady, 
    loading, 
    user 
  });
  
  // Display loading indicator while checking authentication state
  if (loading || !isSupabaseReady) {
    return <AuthLoadingState message="Verificando autenticação..." />;
  }
  
  // If user is already authenticated, don't render the form
  if (isAuthenticated) {
    return <AuthLoadingState message="Autenticado. Redirecionando..." />;
  }
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <LoginForm />
    </div>
  );
}
