
import { Outlet } from "react-router-dom";
import Navbar from "../components/navigation/Navbar";
import { cn } from "@/lib/utils";
// import { NotificationCenter } from "@/components/notification-center"; // Disabled for now

const MainLayout = () => {
  return (
    <div className={cn("min-h-screen flex flex-col bg-background text-foreground")}>
      <Navbar notifications={<div>Notifications</div>} />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
