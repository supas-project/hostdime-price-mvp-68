
import * as React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle, Trash2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

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

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };
  
  const handleClearAll = () => {
    clearAllNotifications();
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
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
        
        <div className="mt-6 space-y-2 max-h-[75vh] overflow-auto pr-2">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">Nenhuma notificação</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={cn(
                  "p-3 border rounded-lg flex gap-3 items-start transition-colors",
                  notification.read ? "bg-background" : "bg-accent/30",
                  notification.variant === "destructive" && "border-l-4 border-l-destructive",
                  notification.variant === "success" && "border-l-4 border-l-green-500",
                  notification.variant === "info" && "border-l-4 border-l-blue-500",
                  notification.variant === "warning" && "border-l-4 border-l-yellow-500"
                )}
              >
                <div className="flex-shrink-0 pt-0.5">
                  {notification.icon || getIconForVariant(notification.variant)}
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
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Helper function to get icon based on variant
function getIconForVariant(variant?: string) {
  switch (variant) {
    case "destructive":
      return <svg className="h-5 w-5 text-destructive" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
        <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="12" cy="16" r="0.5" stroke="currentColor" strokeWidth="3"/>
      </svg>;
    case "success":
      return <svg className="h-5 w-5 text-green-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
        <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>;
    case "info":
      return <svg className="h-5 w-5 text-blue-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
        <circle cx="12" cy="8" r="0.5" stroke="currentColor" strokeWidth="3"/>
        <path d="M12 12V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>;
    case "warning":
      return <svg className="h-5 w-5 text-yellow-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="currentColor" strokeWidth="2"/>
        <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="12" cy="16" r="0.5" stroke="currentColor" strokeWidth="3"/>
      </svg>;
    default:
      return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
        <circle cx="12" cy="8" r="0.5" stroke="currentColor" strokeWidth="3"/>
        <path d="M12 12V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>;
  }
}
