
import * as React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle, Trash2, X, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function NotificationCenter() {
  const [open, setOpen] = React.useState(false);
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    clearNotification, 
    clearAllNotifications,
    unreadCount 
  } = useToast();

  // Split notifications into unread and read
  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read);

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };
  
  const handleClearAll = () => {
    clearAllNotifications();
  };

  // Handle notification panel open - mark all as read when closing
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen && unreadCount > 0) {
      // Consider marking all as read when panel is closed
      // Uncomment to auto-mark as read on close
      // markAllAsRead();
    }
  };

  // Get correct icon based on notification variant
  const getNotificationIcon = (variant?: string) => {
    switch (variant) {
      case "destructive":
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "info":
        return <Info className="h-5 w-5 text-blue-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Info className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 min-w-[18px] h-[18px] p-0 flex items-center justify-center text-[10px]"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader className="flex flex-row items-center justify-between">
          <SheetTitle>Notificações</SheetTitle>
          <div className="flex gap-2">
            {notifications.length > 0 && (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleMarkAllAsRead}
                  disabled={unreadCount === 0}
                >
                  <CheckCircle className="h-3.5 w-3.5 mr-1" />
                  Marcar como lidas
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleClearAll}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  Limpar
                </Button>
              </>
            )}
          </div>
        </SheetHeader>
        
        <Tabs defaultValue="all" className="mt-4">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="all">
              Todas
              {notifications.length > 0 && (
                <Badge variant="secondary" className="ml-1.5">
                  {notifications.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="unread">
              Não lidas
              {unreadNotifications.length > 0 && (
                <Badge variant="secondary" className="ml-1.5">
                  {unreadNotifications.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="read">
              Lidas
              {readNotifications.length > 0 && (
                <Badge variant="secondary" className="ml-1.5">
                  {readNotifications.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-0">
            <NotificationList 
              notifications={notifications} 
              markAsRead={markAsRead} 
              clearNotification={clearNotification} 
              getIcon={getNotificationIcon}
            />
          </TabsContent>
          
          <TabsContent value="unread" className="mt-0">
            <NotificationList 
              notifications={unreadNotifications} 
              markAsRead={markAsRead} 
              clearNotification={clearNotification} 
              getIcon={getNotificationIcon}
            />
          </TabsContent>
          
          <TabsContent value="read" className="mt-0">
            <NotificationList 
              notifications={readNotifications} 
              markAsRead={markAsRead} 
              clearNotification={clearNotification} 
              getIcon={getNotificationIcon}
            />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

// Extracted notification list component
function NotificationList({ 
  notifications, 
  markAsRead, 
  clearNotification,
  getIcon
}: { 
  notifications: any[],
  markAsRead: (id: string) => void,
  clearNotification: (id: string) => void,
  getIcon: (variant?: string) => React.ReactNode
}) {
  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Bell className="h-12 w-12 text-muted-foreground/50 mb-3" />
        <p className="text-muted-foreground">Nenhuma notificação</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-[75vh] overflow-auto pr-2">
      {notifications.map((notification) => (
        <div 
          key={notification.id} 
          className={cn(
            "p-3 border rounded-lg flex gap-3 items-start transition-colors",
            notification.read ? "bg-background" : "bg-accent/30",
            notification.variant === "destructive" && "border-l-4 border-l-destructive",
            notification.variant === "success" && "border-l-4 border-l-green-500",
            notification.variant === "info" && "border-l-4 border-l-blue-500",
            notification.variant === "warning" && "border-l-4 border-l-yellow-500",
            notification.important && !notification.read && "ring-2 ring-primary/20"
          )}
        >
          <div className="flex-shrink-0 pt-0.5">
            {notification.icon || getIcon(notification.variant)}
          </div>
          <div className="flex-1">
            <div className="font-medium">{notification.message}</div>
            {notification.description && (
              <div className="text-sm text-muted-foreground mt-0.5">{notification.description}</div>
            )}
            <div className="text-xs text-muted-foreground mt-1">
              {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
            </div>
          </div>
          <div className="flex gap-1">
            {!notification.read && (
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-7 w-7" 
                onClick={() => markAsRead(notification.id)}
              >
                <CheckCircle className="h-4 w-4" />
                <span className="sr-only">Marcar como lida</span>
              </Button>
            )}
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-7 w-7 text-muted-foreground" 
              onClick={() => clearNotification(notification.id)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Remover</span>
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
