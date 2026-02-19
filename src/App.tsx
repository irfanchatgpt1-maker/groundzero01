import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UserRole } from "./types";
import { AdminDashboard } from "./components/AdminDashboard";
import { CampManagerDashboard } from "./components/CampManagerDashboard";
import { VolunteerDashboard } from "./components/VolunteerDashboard";
import { ConnectionProvider } from "./lib/connection-mode";
import { ConnectionStatusBanner } from "./components/ConnectionStatusBanner";

const queryClient = new QueryClient();

const App = () => {
  const [currentRole, setCurrentRole] = useState<UserRole>(UserRole.ADMIN);

  const renderDashboard = () => {
    switch (currentRole) {
      case UserRole.ADMIN:
        return <AdminDashboard onRoleChange={setCurrentRole} />;
      case UserRole.CAMP_MANAGER:
        return <CampManagerDashboard onRoleChange={setCurrentRole} />;
      case UserRole.VOLUNTEER:
        return <VolunteerDashboard onRoleChange={setCurrentRole} />;
      default:
        return <AdminDashboard onRoleChange={setCurrentRole} />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ConnectionProvider>
          <Toaster />
          <Sonner />
          <div className="min-h-screen bg-background-light dark:bg-background-dark overflow-hidden flex flex-col">
            <ConnectionStatusBanner />
            {renderDashboard()}
          </div>
        </ConnectionProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
