
import { toast as sonnerToast } from "sonner";
import { ReactNode, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Define the notification type
export type Notification = {
  id: string;
  message: string;
  description?: string;
  timestamp: number;
  read: boolean;
  variant?: 'default' | 'destructive' | 'success' | 'info' | 'warning';
  icon?: ReactNode;
  important?: boolean;
};

// Maximum number of stored notifications
const MAX_STORED_NOTIFICATIONS = 50;

// Re-export the toast function
export const toast = sonnerToast;

// Create a global notifications state
let notifications: Notification[] = [];
let listeners: Function[] = [];

// Helper functions to manage notifications
const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
  const newNotification: Notification = {
    id: uuidv4(),
    timestamp: Date.now(),
    read: false,
    ...notification
  };
  
  // Limit the number of stored notifications by removing oldest ones
  if (notifications.length >= MAX_STORED_NOTIFICATIONS) {
    // Find oldest read notification to remove first
    const oldestReadIndex = notifications.findIndex(n => n.read);
    
    if (oldestReadIndex >= 0) {
      notifications = [
        ...notifications.slice(0, oldestReadIndex),
        ...notifications.slice(oldestReadIndex + 1)
      ];
    } else {
      // If no read notifications, remove the oldest one
      notifications = notifications.slice(1);
    }
  }
  
  notifications = [newNotification, ...notifications];
  notifyListeners();
  
  return newNotification.id;
};

const markAsRead = (id: string) => {
  notifications = notifications.map(n => 
    n.id === id ? { ...n, read: true } : n
  );
  notifyListeners();
};

const markAllAsRead = () => {
  notifications = notifications.map(n => ({ ...n, read: true }));
  notifyListeners();
};

const clearNotification = (id: string) => {
  notifications = notifications.filter(n => n.id !== id);
  notifyListeners();
};

const clearAllNotifications = () => {
  notifications = [];
  notifyListeners();
};

const notifyListeners = () => {
  listeners.forEach(listener => listener(notifications));
};

// Extend the toast function to track notifications
const originalToast = sonnerToast;

// Configure toast to limit the number of simultaneous notifications
const toastConfig = {
  visibleToasts: 3, // Limit to 3 visible toasts at once
};

// Configure and extend sonner toast
const extendedToast = Object.assign(
  (message: string, data?: any) => {
    const id = originalToast(message, {
      ...toastConfig,
      ...data
    });
    
    addNotification({ 
      message, 
      description: data?.description,
      variant: 'default',
      icon: data?.icon,
      important: data?.important
    });
    
    return id;
  },
  {
    ...originalToast,
    success: (message: string, data?: any) => {
      const id = originalToast.success(message, {
        ...toastConfig,
        ...data
      });
      
      addNotification({ 
        message, 
        description: data?.description,
        variant: 'success',
        icon: data?.icon,
        important: data?.important
      });
      
      return id;
    },
    error: (message: string, data?: any) => {
      const id = originalToast.error(message, {
        ...toastConfig,
        ...data
      });
      
      addNotification({ 
        message, 
        description: data?.description,
        variant: 'destructive',
        icon: data?.icon,
        important: data?.important || true // Errors are important by default
      });
      
      return id;
    },
    info: (message: string, data?: any) => {
      const id = originalToast.info(message, {
        ...toastConfig,
        ...data
      });
      
      addNotification({ 
        message, 
        description: data?.description,
        variant: 'info',
        icon: data?.icon,
        important: data?.important
      });
      
      return id;
    },
    warning: (message: string, data?: any) => {
      const id = originalToast.warning(message, {
        ...toastConfig,
        ...data
      });
      
      addNotification({ 
        message, 
        description: data?.description,
        variant: 'warning',
        icon: data?.icon,
        important: data?.important || true // Warnings are important by default
      });
      
      return id;
    }
  }
);

// Export the use-toast hook with notification functionality
export function useToast() {
  const [localNotifications, setLocalNotifications] = useState<Notification[]>(notifications);
  const [unreadCount, setUnreadCount] = useState(0);
  
  useEffect(() => {
    // Add listener for notification changes
    const listener = (updatedNotifications: Notification[]) => {
      setLocalNotifications([...updatedNotifications]);
      setUnreadCount(updatedNotifications.filter(n => !n.read).length);
    };
    
    listeners.push(listener);
    
    // Initial setup
    setUnreadCount(notifications.filter(n => !n.read).length);
    
    // Remove listener on unmount
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }, []);
  
  return {
    toast: extendedToast,
    notifications: localNotifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications
  };
}
