import React, { useState, useEffect, useCallback } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import {
  Sparkles, Plus, LayoutDashboard, LogOut, Loader2, Briefcase, Settings, Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import StatusBadge from "@/components/StatusBadge";
import { relativeTime } from "@/lib/format";

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [apps, setApps] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadApps = useCallback(async () => {
    try {
      const [a, s] = await Promise.all([api.get("/applications"), api.get("/stats")]);
      setApps(a.data.items ?? a.data);
      setStats(s.data);
    } catch (e) {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApps();
  }, [loadApps]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const activeId = location.pathname.startsWith("/app/application/")
    ? location.pathname.split("/").pop()
    : null;

  return (
    <div className="flex h-screen overflow-hidden bg-[#0A0A0A] text-[#F3F4F6]">
      {/* Sidebar */}
      <aside className="flex w-72 flex-shrink-0 flex-col border-r border-white/10 bg-[#0d0d0d]">
        <div className="flex items-center gap-2 px-5 py-5">
          <Link to="/app" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0066FF]">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight">CareerOS</span>
          </Link>
        </div>

        <div className="px-4">
          <Button
            data-testid="sidebar-new-application-btn"
            onClick={() => navigate("/app/new")}
            className="h-10 w-full rounded-xl bg-[#0066FF] font-medium text-white hover:bg-[#0052CC]"
          >
            <Plus className="mr-2 h-4 w-4" /> New application
          </Button>
        </div>

        <nav className="px-4 py-4">
          <Link
            to="/app"
            data-testid="sidebar-dashboard-link"
            className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors ${
              location.pathname === "/app"
                ? "bg-white/10 text-white"
                : "text-[#9CA3AF] hover:bg-white/5 hover:text-white"
            }`}
          >
            <LayoutDashboard className="h-4 w-4" /> Dashboard
          </Link>
          <Link
            to="/app/settings"
            data-testid="sidebar-settings-link"
            className={`mt-1 flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors ${
              location.pathname === "/app/settings"
                ? "bg-white/10 text-white"
                : "text-[#9CA3AF] hover:bg-white/5 hover:text-white"
            }`}
          >
            <Settings className="h-4 w-4" /> Settings
          </Link>
          {user?.role === "admin" && (
            <Link
              to="/app/admin"
              data-testid="sidebar-admin-link"
              className={`mt-1 flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors ${
                location.pathname === "/app/admin"
                  ? "bg-white/10 text-white"
                  : "text-[#9CA3AF] hover:bg-white/5 hover:text-white"
              }`}
            >
              <Shield className="h-4 w-4" /> Admin
            </Link>
          )}
        </nav>

        <div className="px-5 pb-1">
          <p className="overline text-[#6B7280]">Applications {stats ? `· ${stats.total}` : ""}</p>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-4" data-testid="sidebar-applications-list">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-[#6B7280]" />
            </div>
          ) : apps.length === 0 ? (
            <div className="px-3 py-8 text-center text-sm text-[#6B7280]">
              <Briefcase className="mx-auto mb-2 h-6 w-6 opacity-50" />
              No applications yet
            </div>
          ) : (
            apps.map((a) => (
              <button
                key={a.id}
                data-testid={`sidebar-app-${a.id}`}
                onClick={() => navigate(`/app/application/${a.id}`)}
                className={`mb-1 w-full rounded-xl px-3 py-2.5 text-left transition-colors ${
                  activeId === a.id ? "bg-white/10" : "hover:bg-white/5"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium text-[#F3F4F6]">{a.job_title}</span>
                  {a.match_rate != null && (
                    <span className="flex-shrink-0 text-xs font-semibold text-[#10B981]">{a.match_rate}%</span>
                  )}
                </div>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <span className="truncate text-xs text-[#6B7280]">{a.company}</span>
                  <StatusBadge status={a.status} />
                </div>
              </button>
            ))
          )}
        </div>

        {/* User */}
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#8B5CF6]/20 text-sm font-semibold text-[#8B5CF6]">
                {(user?.name || user?.email || "U")[0].toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="truncate text-sm font-medium text-[#F3F4F6]">{user?.name || "User"}</p>
                <p className="truncate text-xs text-[#6B7280]">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <Outlet context={{ apps, stats, refresh: loadApps, loading }} />
      </main>
    </div>
  );
}
