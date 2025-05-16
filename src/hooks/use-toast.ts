
import { useState, useEffect } from "react";
import { toast as sonnerToast } from "sonner";

export interface Notification {
  id: string;
  message: string;
  description?: string;
  timestamp: Date;
  read: boolean;
  variant?: "default" | "destructive" | "success" | "info" | "warning";
  icon?: React.ReactNode;
  important?: boolean;
}

// Armazenamento global de notificações para persistência entre renders
let notifications: Notification[] = [];

// Listeners para mudanças nas notificações
const listeners = new Set<() => void>();

const addNotificationToState = (notification: Notification) => {
  notifications = [notification, ...notifications].slice(0, 50); // Limita a 50 notificações
  notifyListeners();
};

const markNotificationAsReadInState = (id: string) => {
  notifications = notifications.map((n) =>
    n.id === id ? { ...n, read: true } : n
  );
  notifyListeners();
};

const markAllNotificationsAsReadInState = () => {
  notifications = notifications.map((n) => ({ ...n, read: true }));
  notifyListeners();
};

const clearNotificationInState = (id: string) => {
  notifications = notifications.filter((n) => n.id !== id);
  notifyListeners();
};

const clearAllNotificationsInState = () => {
  notifications = [];
  notifyListeners();
};

const notifyListeners = () => {
  listeners.forEach((listener) => listener());
};

// Helper para acessar o toast de qualquer lugar
export const toast = {
  info: (message: string, options?: any) => {
    toast.default(message, { ...options, variant: "info" });
  },
  success: (message: string, options?: any) => {
    toast.default(message, { ...options, variant: "success" });
  },
  warning: (message: string, options?: any) => {
    toast.default(message, { ...options, variant: "warning" });
  },
  error: (message: string, options?: any) => {
    toast.default(message, { ...options, variant: "destructive" });
  },
  default: (message: string, options?: any) => {
    const notification: Notification = {
      id: `notification-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      message,
      description: options?.description,
      timestamp: new Date(),
      read: false,
      variant: options?.variant || "default",
      icon: options?.icon,
      important: options?.important || false,
    };

    addNotificationToState(notification);

    // Exibir toast usando o sonner
    const toastFunction = options?.variant 
      ? (options.variant === 'destructive' ? sonnerToast.error 
        : options.variant === 'success' ? sonnerToast.success 
        : options.variant === 'warning' ? sonnerToast.warning
        : options.variant === 'info' ? sonnerToast.info
        : sonnerToast)
      : sonnerToast;

    toastFunction(message, {
      description: options?.description,
      duration: options?.duration || 5000,
    });
  },
};

// Hook para consumir notificações
export function useToast() {
  const [state, setState] = useState<{
    notifications: Notification[];
    unreadCount: number;
  }>({
    notifications,
    unreadCount: notifications.filter((n) => !n.read).length,
  });

  useEffect(() => {
    const updateState = () => {
      setState({
        notifications,
        unreadCount: notifications.filter((n) => !n.read).length,
      });
    };

    listeners.add(updateState);
    updateState(); // Inicial setup

    return () => {
      listeners.delete(updateState);
    };
  }, []);

  return {
    notifications: state.notifications,
    unreadCount: state.unreadCount,
    toast: {
      ...sonnerToast,
      // Métodos de conveniência com registro
      info: (message: string, options?: any) => addToast(message, { ...options, variant: "info" }),
      success: (message: string, options?: any) => addToast(message, { ...options, variant: "success" }),
      warning: (message: string, options?: any) => addToast(message, { ...options, variant: "warning" }),
      error: (message: string, options?: any) => addToast(message, { ...options, variant: "destructive" }),
    },
    // Métodos para gerenciar as notificações
    addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => {
      const fullNotification: Notification = {
        id: `notification-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        timestamp: new Date(),
        read: false,
        ...notification,
      };
      addNotificationToState(fullNotification);
      return fullNotification.id;
    },
    markAsRead: (id: string) => markNotificationAsReadInState(id),
    markAllAsRead: () => markAllNotificationsAsReadInState(),
    clearNotification: (id: string) => clearNotificationInState(id),
    clearAllNotifications: () => clearAllNotificationsInState(),
  };
}

// Helper function for adding toast with notification
const addToast = (
  message: string,
  options?: {
    description?: string;
    variant?: "default" | "destructive" | "success" | "info" | "warning";
    icon?: React.ReactNode;
    important?: boolean;
    duration?: number;
  }
) => {
  const notification: Notification = {
    id: `notification-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    message,
    description: options?.description,
    timestamp: new Date(),
    read: false,
    variant: options?.variant || "default",
    icon: options?.icon,
    important: options?.important || false,
  };

  addNotificationToState(notification);

  // Exibir o toast usando sonner
  const toastFunction = options?.variant 
    ? (options.variant === 'destructive' ? sonnerToast.error 
      : options.variant === 'success' ? sonnerToast.success 
      : options.variant === 'warning' ? sonnerToast.warning
      : options.variant === 'info' ? sonnerToast.info
      : sonnerToast)
    : sonnerToast;

  toastFunction(message, {
    description: options?.description,
    duration: options?.duration || 5000,
    position: "top-right",
  });

  return notification.id;
};
