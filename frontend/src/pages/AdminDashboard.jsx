import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Shield, Users, Briefcase, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import api, { formatApiErrorDetail } from "@/lib/api";
import { toast } from "sonner";

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#141414] p-5">
      <div className="mb-3 flex items-center justify-between">
        <span className="overline text-[#6B7280]">{label}</span>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: `${color}1A`, color }}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="font-display text-3xl font-bold">{value ?? "—"}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role !== "admin") {
      navigate("/app");
      return;
    }
    api.get("/admin/stats")
      .then(({ data }) => setStats(data))
      .catch((err) => {
        toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Failed to load admin stats");
        navigate("/app");
      })
      .finally(() => setLoading(false));
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#0066FF]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-8 py-8" data-testid="admin-dashboard">
      <div className="mb-8 flex items-center gap-3">
        <Shield className="h-6 w-6 text-[#8B5CF6]" />
        <div>
          <p className="overline text-[#8B5CF6]">Admin</p>
          <h1 className="font-display text-3xl font-bold tracking-tight">System overview</h1>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total users" value={stats?.users} icon={Users} color="#0066FF" />
        <StatCard label="Applications" value={stats?.applications} icon={Briefcase} color="#10B981" />
        <StatCard label="AI generated" value={stats?.generated_applications} icon={Sparkles} color="#8B5CF6" />
      </div>
    </div>
  );
}
