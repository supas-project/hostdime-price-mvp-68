
import * as React from "react"
import { toast as sonnerToast, type ToastT, type ExternalToast } from "sonner";
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

// Notification store
const notifications = React.createRef<Notification[]>();
if (!notifications.current) {
  notifications.current = [];
}

// Add notification to history
const addNotificationToHistory = (
  id: string,
  message: string, 
  options?: ToastOptions
) => {
  if (!notifications.current) return;
  
  const newNotification: Notification = {
    id,
    message,
    description: options?.description,
    variant: options?.variant || "default",
    timestamp: new Date(),
    read: false,
    icon: options?.icon
  };
  
  notifications.current = [newNotification, ...notifications.current].slice(0, 50); // Keep last 50 notifications
};

// Simple wrapper around sonner toast that conforms to our project's structure
function toast(message: string, options?: ToastOptions) {
  const { description, variant, duration, icon, ...rest } = options || {};
  
  const id = Math.random().toString(36).substring(2, 9);
  addNotificationToHistory(id, message, options);
  
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

function useToast() {
  const [notificationList, setNotificationList] = React.useState<Notification[]>([]);
  
  // Get notifications from the store
  React.useEffect(() => {
    if (notifications.current) {
      setNotificationList([...notifications.current]);
    }
  }, []);

  // Mark notification as read
  const markAsRead = (id: string) => {
    if (!notifications.current) return;
    
    notifications.current = notifications.current.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    );
    
    setNotificationList([...notifications.current]);
  };
  
  // Mark all as read
  const markAllAsRead = () => {
    if (!notifications.current) return;
    
    notifications.current = notifications.current.map(notification => 
      ({ ...notification, read: true })
    );
    
    setNotificationList([...notifications.current]);
  };
  
  // Clear a specific notification
  const clearNotification = (id: string) => {
    if (!notifications.current) return;
    
    notifications.current = notifications.current.filter(
      notification => notification.id !== id
    );
    
    setNotificationList([...notifications.current]);
  };
  
  // Clear all notifications
  const clearAllNotifications = () => {
    if (!notifications.current) {
      notifications.current = [];
    }
    
    setNotificationList([]);
  };
  
  return {
    toast,
    notifications: notificationList,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
    unreadCount: notificationList.filter(n => !n.read).length,
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
