import React from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Plus, Target, ScanLine, Briefcase, Sparkles, ArrowUpRight, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/StatusBadge";
import { relativeTime, STATUS_META, STATUS_ORDER } from "@/lib/format";

function StatCard({ label, value, suffix, icon: Icon, color, testId }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/10 bg-[#141414] p-5"
      data-testid={testId}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="overline text-[#6B7280]">{label}</span>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: `${color}1A`, color }}>
          <Icon className="h-4 w-4" strokeWidth={1.5} />
        </div>
      </div>
      <div className="font-display text-3xl font-bold text-[#F3F4F6]">
        {value == null ? "—" : value}
        {value != null && suffix && <span className="text-lg text-[#6B7280]">{suffix}</span>}
      </div>
    </motion.div>
  );
}

export default function DashboardHome() {
  const navigate = useNavigate();
  const { apps, stats, loading } = useOutletContext();

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#0066FF]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-8 py-8" data-testid="dashboard-home">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="overline mb-1 text-[#8B5CF6]">Dashboard</p>
          <h1 className="font-display text-3xl font-bold tracking-tight">Your job search command center</h1>
        </div>
        <Button
          data-testid="dashboard-new-btn"
          onClick={() => navigate("/app/new")}
          className="rounded-full bg-[#0066FF] text-white hover:bg-[#0052CC]"
        >
          <Plus className="mr-2 h-4 w-4" /> New application
        </Button>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Applications" value={stats?.total ?? 0} icon={Briefcase} color="#0066FF" testId="stat-total" />
        <StatCard label="Avg match rate" value={stats?.avg_match_rate} suffix="%" icon={Target} color="#10B981" testId="stat-match" />
        <StatCard label="Avg ATS score" value={stats?.avg_ats} suffix="%" icon={ScanLine} color="#F59E0B" testId="stat-ats" />
        <StatCard label="AI generated" value={stats?.generated_count ?? 0} icon={Sparkles} color="#8B5CF6" testId="stat-generated" />
      </div>

      {/* Pipeline */}
      {stats?.total > 0 && (
        <div className="mb-8 rounded-2xl border border-white/10 bg-[#141414] p-5">
          <p className="overline mb-4 text-[#6B7280]">Pipeline</p>
          <div className="flex flex-wrap gap-3">
            {STATUS_ORDER.map((s) => (
              <div key={s} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <span className={`h-2 w-2 rounded-full ${STATUS_META[s].dot}`} />
                <span className="text-sm text-[#9CA3AF]">{STATUS_META[s].label}</span>
                <span className="font-display text-sm font-bold text-[#F3F4F6]">{stats.by_status?.[s] || 0}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Applications */}
      <p className="overline mb-4 text-[#6B7280]">Recent applications</p>
      {apps.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-[#141414] py-16 text-center" data-testid="empty-state">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0066FF]/15 text-[#0066FF]">
            <Sparkles className="h-6 w-6" />
          </div>
          <h3 className="font-display mb-1 text-lg font-semibold">No applications yet</h3>
          <p className="mb-5 text-sm text-[#9CA3AF]">Upload a resume and paste a job description to begin.</p>
          <Button
            data-testid="empty-new-btn"
            onClick={() => navigate("/app/new")}
            className="rounded-full bg-[#0066FF] text-white hover:bg-[#0052CC]"
          >
            <Plus className="mr-2 h-4 w-4" /> Create your first application
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {apps.map((a, i) => (
            <motion.button
              key={a.id}
              data-testid={`app-card-${a.id}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => navigate(`/app/application/${a.id}`)}
              className="group rounded-2xl border border-white/10 bg-[#141414] p-5 text-left transition-colors hover:border-white/20"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <div className="overflow-hidden">
                  <h3 className="font-display truncate text-base font-semibold text-[#F3F4F6]">{a.job_title}</h3>
                  <p className="truncate text-sm text-[#9CA3AF]">{a.company}</p>
                </div>
                <ArrowUpRight className="h-4 w-4 flex-shrink-0 text-[#6B7280] transition-colors group-hover:text-white" />
              </div>
              <div className="mb-4 flex items-center gap-4">
                <div>
                  <p className="overline text-[#6B7280]">Match</p>
                  <p className="font-display text-lg font-bold text-[#10B981]">{a.match_rate != null ? `${a.match_rate}%` : "—"}</p>
                </div>
                <div className="h-8 w-px bg-white/10" />
                <div>
                  <p className="overline text-[#6B7280]">ATS</p>
                  <p className="font-display text-lg font-bold text-[#F59E0B]">{a.ats_overall != null ? `${a.ats_overall}%` : "—"}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <StatusBadge status={a.status} />
                <span className="text-xs text-[#6B7280]">{relativeTime(a.created_at)}</span>
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}
