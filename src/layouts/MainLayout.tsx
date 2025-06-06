
import { Outlet } from "react-router-dom";
import { Navbar } from "../components/navigation/Navbar";
import { cn } from "@/lib/utils";
import { NotificationCenter } from "@/components/notification-center";

const MainLayout = () => {
  return (
    <div className={cn("min-h-screen flex flex-col bg-background text-foreground")}>
      <Navbar notifications={<NotificationCenter />} />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
