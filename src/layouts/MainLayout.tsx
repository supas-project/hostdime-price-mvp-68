
import React from "react";
import { Navbar } from "../components/navigation/Navbar";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className={cn("min-h-screen flex flex-col bg-background text-foreground")}>
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
