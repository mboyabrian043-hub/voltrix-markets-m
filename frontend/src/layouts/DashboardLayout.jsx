import { useMemo, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { TopNavbar } from "../components/TopNavbar";
import { useAuth } from "../hooks/useAuth";

export const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const username = useMemo(() => user?.username || "Trader", [user]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-slate-900">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <div className="flex min-h-screen flex-1 flex-col md:ml-0">
        <TopNavbar
          onMenuClick={() => setSidebarOpen(true)}
          username={username}
          onLogout={handleLogout}
        />
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
