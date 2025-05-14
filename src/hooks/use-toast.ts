import { useState, useEffect } from "react";
import { toast as sonnerToast } from "@/utils/toast-utils";
import { v4 as uuidv4 } from "uuid";

// Define the types for notifications
interface Notification {
  id: string;
  message: string;
  description?: string;
  timestamp: number;
  read: boolean;
  variant?: "default" | "destructive" | "success" | "warning" | "info";
  important?: boolean;
  icon?: React.ReactNode;
}

// Define the return type for the hook
interface UseToastReturn {
  toast: typeof sonnerToast;
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

/**
 * Hook para utilizar o sistema de toast e notificações em componentes funcionais.
 * 
 * @returns O objeto de funcionalidades de toast e gerenciamento de notificações
 */
export function useToast(): UseToastReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Keep track of toast calls to add to notification center
  useEffect(() => {
    const handleToast = (message: string, options?: any, variant?: string) => {
      const notification: Notification = {
        id: uuidv4(),
        message,
        description: options?.description,
        timestamp: Date.now(),
        read: false,
        variant: variant as any,
        important: options?.important || false,
        icon: options?.icon
      };
      
      setNotifications(prev => [notification, ...prev].slice(0, 100)); // Limit to 100 notifications
      return message; // Pass through for chaining
    };
    
    // Override toast methods to capture notifications
    const originalSuccess = sonnerToast.success;
    const originalError = sonnerToast.error;
    const originalInfo = sonnerToast.info;
    const originalWarning = sonnerToast.warning;
    const originalCustom = sonnerToast.custom;
    
    sonnerToast.success = (message, options) => {
      handleToast(message, options, "success");
      return originalSuccess(message, options);
    };
    
    sonnerToast.error = (message, options) => {
      handleToast(message, options, "destructive");
      return originalError(message, options);
    };
    
    sonnerToast.info = (message, options) => {
      handleToast(message, options, "info");
      return originalInfo(message, options);
    };
    
    sonnerToast.warning = (message, options) => {
      handleToast(message, options, "warning");
      return originalWarning(message, options);
    };
    
    sonnerToast.custom = (message, options) => {
      handleToast(message, options, "default");
      return originalCustom(message, options);
    };
    
    return () => {
      // Restore original methods on cleanup
      sonnerToast.success = originalSuccess;
      sonnerToast.error = originalError;
      sonnerToast.info = originalInfo;
      sonnerToast.warning = originalWarning;
      sonnerToast.custom = originalCustom;
    };
  }, []);
  
  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length;
  
  // Mark notification as read
  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };
  
  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };
  
  // Remove a notification
  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };
  
  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
  };
  
  return {
    toast: sonnerToast,
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications
  };
}

// Export toast directly for use without the hook
export const toast = sonnerToast;
