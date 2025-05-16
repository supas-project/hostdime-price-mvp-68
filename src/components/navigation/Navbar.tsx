
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { LoginDialog } from "@/components/login-dialog";

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
          {notifications && <div className="mr-2">{notifications}</div>}
          <LoginDialog />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
