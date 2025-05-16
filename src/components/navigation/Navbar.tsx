
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface NavbarProps {
  notifications?: React.ReactNode;
}

const Navbar: React.FC<NavbarProps> = ({ notifications }) => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, logout, user } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-14 items-center">
        <div className="flex items-center space-x-4">
          <a href="/" className="flex items-center space-x-2">
            <span className="font-bold text-lg sm:block md:text-xl">HostDime</span>
          </a>
        </div>

        <div className={cn("flex flex-1 items-center justify-end space-x-4")}>
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              {notifications && <div className="mr-2">{notifications}</div>}
              
              <div className="text-sm text-muted-foreground">
                {user?.email}
                {isAdmin && <span className="ml-1 text-primary">(Admin)</span>}
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
              >
                Logout
              </Button>
            </div>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate("/login")}
            >
              Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
