
import { toast as sonnerToast } from "sonner";

type ToastOptions = {
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
  important?: boolean;
  dismissible?: boolean;
};

/**
 * Sistema de notificações padronizado para a aplicação
 * 
 * Implementa uma camada sobre o sistema de toast para garantir
 * consistência visual e de comportamento em todas as notificações.
 */
export const toast = {
  /**
   * Notificação de sucesso
   */
  success: (title: string, options?: ToastOptions) => {
    return sonnerToast.success(title, {
      ...options,
      className: "hostdime-toast hostdime-toast-success",
    });
  },

  /**
   * Notificação de erro
   */
  error: (title: string, options?: ToastOptions) => {
    return sonnerToast.error(title, {
      ...options,
      className: "hostdime-toast hostdime-toast-error",
    });
  },

  /**
   * Notificação de informação
   */
  info: (title: string, options?: ToastOptions) => {
    return sonnerToast.info(title, {
      ...options,
      className: "hostdime-toast hostdime-toast-info",
    });
  },

  /**
   * Notificação de aviso
   */
  warning: (title: string, options?: ToastOptions) => {
    return sonnerToast.warning(title, {
      ...options,
      className: "hostdime-toast hostdime-toast-warning",
    });
  },

  /**
   * Notificação personalizada
   */
  custom: (title: string, options?: ToastOptions) => {
    return sonnerToast(title, {
      ...options,
      className: "hostdime-toast",
    });
  },

  /**
   * Exibe notificação de carregamento com possibilidade de atualizar o estado
   */
  promise: <T,>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((err: any) => string);
    },
    options?: ToastOptions
  ) => {
    return sonnerToast.promise(promise, {
      loading,
      success,
      error,
      ...options,
      className: "hostdime-toast",
    });
  },

  /**
   * Remove todas as notificações ativas
   */
  dismiss: () => sonnerToast.dismiss(),
};
