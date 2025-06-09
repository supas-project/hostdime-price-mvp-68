
import { useAuthState } from "./useAuthState";
import { useAuthActions } from "./useAuthActions";
import { AuthContextType } from "@/types/auth-interfaces";

/**
 * Unified auth hook - combines state and actions
 * Single entry point for all auth-related functionality
 */
export function useAuth(): AuthContextType {
  const authState = useAuthState();
  const authActions = useAuthActions();

  return {
    ...authState,
    ...authActions
  };
}
