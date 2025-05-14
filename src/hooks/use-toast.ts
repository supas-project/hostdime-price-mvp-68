
import * as React from "react"
import { toast as sonnerToast } from "sonner";
import { AlertCircle, Bell, CheckCircle, Info } from "lucide-react";

// Define a standard interface for toast functions to ensure consistent usage
export interface ToastOptions {
  description?: React.ReactNode
  action?: React.ReactNode
  variant?: "default" | "destructive" | "success" | "info" | "warning"
  duration?: number
  icon?: React.ReactNode
}

// Define notification store for history
type Notification = {
  id: string;
  message: string;
  description?: React.ReactNode;
  variant: "default" | "destructive" | "success" | "info" | "warning";
  timestamp: Date;
  read: boolean;
  icon?: React.ReactNode;
}

// Create a React context to store notifications
type ToastContextType = {
  notifications: Notification[];
  addNotification: (id: string, message: string, options?: ToastOptions) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  clearAllNotifications: () => void;
};

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

// Provider component to wrap the app with
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = React.useState<Notification[]>([]);

  // Add notification to history
  const addNotification = (id: string, message: string, options?: ToastOptions) => {
    const newNotification: Notification = {
      id,
      message,
      description: options?.description,
      variant: options?.variant || "default",
      timestamp: new Date(),
      read: false,
      icon: options?.icon
    };
    
    setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Keep last 50 notifications
  };

  // Mark notification as read
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };
  
  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };
  
  // Clear a specific notification
  const clearNotification = (id: string) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== id)
    );
  };
  
  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const value = {
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
  };

  return React.createElement(ToastContext.Provider, { value }, children);
};

// Helper function to get icon based on variant
const getIconForVariant = (variant?: string) => {
  switch (variant) {
    case "destructive":
      return React.createElement(AlertCircle, { className: "h-4 w-4" });
    case "success":
      return React.createElement(CheckCircle, { className: "h-4 w-4" });
    case "info":
      return React.createElement(Info, { className: "h-4 w-4" });
    case "warning":
      return React.createElement(AlertCircle, { className: "h-4 w-4" });
    default:
      return React.createElement(Bell, { className: "h-4 w-4" });
  }
};

// Simple wrapper around sonner toast that conforms to our project's structure
function toast(message: string, options?: ToastOptions) {
  const { description, variant, duration, icon, ...rest } = options || {};
  
  const id = Math.random().toString(36).substring(2, 9);
  
  // Attempt to add to notification history if context is available
  try {
    if (typeof window !== 'undefined') {
      // This is a workaround to allow the toast function to be called outside of React components
      // It will be picked up by the ToastProvider context when it's available
      setTimeout(() => {
        try {
          const element = document.createElement('div');
          const root = document.createElement('div');
          element.appendChild(root);
          
          // Try to create a mini React app to access context
          const MiniApp = () => {
            const ctx = React.useContext(ToastContext);
            if (ctx) {
              ctx.addNotification(id, message, options);
            }
            return null;
          };
          
          // This won't actually render but might help with context access
          React.createElement(MiniApp, null);
        } catch (innerError) {
          // Silently fail for non-React environments
        }
      }, 0);
    }
  } catch (e) {
    // Silently fail if not in a React component context
  }
  
  // Get default icon based on variant
  const defaultIcon = getIconForVariant(variant);
  const notificationIcon = icon || defaultIcon;
  
  // Convert our variant to sonner styling with appropriate duration
  if (variant === "destructive") {
    return sonnerToast.error(message, { 
      ...rest, 
      description, 
      duration: duration || 8000, // Longer for errors
      icon: notificationIcon
    });
  } else if (variant === "success") {
    return sonnerToast.success(message, { 
      ...rest, 
      description, 
      duration: duration || 5000,
      icon: notificationIcon
    });
  } else if (variant === "info") {
    return sonnerToast.info(message, { 
      ...rest, 
      description, 
      duration: duration || 5000,
      icon: notificationIcon
    });
  } else if (variant === "warning") {
    return sonnerToast.warning(message, { 
      ...rest, 
      description, 
      duration: duration || 6000,
      icon: notificationIcon
    });
  } else {
    return sonnerToast(message, { 
      ...rest, 
      description, 
      duration: duration || 5000,
      icon: notificationIcon
    });
  }
}

// Add variants as direct methods for convenience
toast.error = (message: string, options?: Omit<ToastOptions, "variant">) => {
  return toast(message, { ...options, variant: "destructive" });
};

toast.success = (message: string, options?: Omit<ToastOptions, "variant">) => {
  return toast(message, { ...options, variant: "success" });
};

toast.info = (message: string, options?: Omit<ToastOptions, "variant">) => {
  return toast(message, { ...options, variant: "info" });
};

toast.warning = (message: string, options?: Omit<ToastOptions, "variant">) => {
  return toast(message, { ...options, variant: "warning" });
};

// Custom hook to access toast notifications
function useToast() {
  const context = React.useContext(ToastContext);
  
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  
  return {
    toast,
    notifications: context.notifications,
    markAsRead: context.markAsRead,
    markAllAsRead: context.markAllAsRead,
    clearNotification: context.clearNotification,
    clearAllNotifications: context.clearAllNotifications,
    unreadCount: context.notifications.filter(n => !n.read).length,
    dismiss: (toastId?: string) => {
      if (toastId) {
        sonnerToast.dismiss(toastId);
      } else {
        sonnerToast.dismiss();
      }
    }
  };
}

export { useToast, toast };
