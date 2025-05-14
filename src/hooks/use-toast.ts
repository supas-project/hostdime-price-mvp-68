
import { toast } from "@/utils/toast-utils";

/**
 * Hook para utilizar o sistema de toast em componentes funcionais.
 * 
 * @returns O objeto toast para exibir notificações
 */
export function useToast() {
  return { toast };
}
