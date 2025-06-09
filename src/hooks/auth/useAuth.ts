
import { useAuthState } from "./useAuthState";
import { useAuthActions } from "./useAuthActions";

/**
 * Hook principal de autenticação que combina estado e ações
 */
export function useAuth() {
  const authState = useAuthState();
  const authActions = useAuthActions();

  return {
    ...authState,
    ...authActions
  };
}
