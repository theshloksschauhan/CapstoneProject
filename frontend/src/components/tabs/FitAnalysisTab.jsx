import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, Tag, XCircle } from "lucide-react";
import ScoreRing from "@/components/ScoreRing";

const SEVERITY = {
  high: { color: "#EF4444", label: "High" },
  medium: { color: "#F59E0B", label: "Medium" },
  low: { color: "#6B7280", label: "Low" },
};

export default function FitAnalysisTab({ data }) {
  if (!data) return null;
  return (
    <div className="space-y-6" data-testid="fit-analysis-tab">
      {/* Header */}
      <div className="flex flex-col items-center gap-6 rounded-2xl border border-white/10 bg-[#141414] p-6 sm:flex-row sm:items-center">
        <ScoreRing score={data.match_rate} label="Match" testId="fit-match-ring" />
        <div className="flex-1 text-center sm:text-left">
          <p className="overline mb-1 text-[#8B5CF6]">Fit verdict</p>
          <h3 className="font-display mb-2 text-xl font-semibold text-[#F3F4F6]">{data.verdict || "—"}</h3>
          <p className="text-sm leading-relaxed text-[#9CA3AF]">{data.summary}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Strengths */}
        <div className="rounded-2xl border border-white/10 bg-[#141414] p-5">
          <div className="mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
            <p className="overline text-[#6B7280]">Strengths</p>
          </div>
          <div className="space-y-3">
            {(data.strengths || []).map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                className="rounded-xl border border-[#10B981]/20 bg-[#10B981]/5 p-3">
                <p className="text-sm font-medium text-[#F3F4F6]">{s.title}</p>
                {s.detail && <p className="mt-1 text-xs text-[#9CA3AF]">{s.detail}</p>}
              </motion.div>
            ))}
            {(!data.strengths || data.strengths.length === 0) && <p className="text-sm text-[#6B7280]">None identified.</p>}
          </div>
        </div>

        {/* Gaps */}
        <div className="rounded-2xl border border-white/10 bg-[#141414] p-5">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-[#F59E0B]" />
            <p className="overline text-[#6B7280]">Gaps to address</p>
          </div>
          <div className="space-y-3">
            {(data.gaps || []).map((g, i) => {
              const sev = SEVERITY[g.severity] || SEVERITY.low;
              return (
                <motion.div key={i} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                  className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-[#F3F4F6]">{g.title}</p>
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                      style={{ backgroundColor: `${sev.color}1A`, color: sev.color }}>{sev.label}</span>
                  </div>
                  {g.detail && <p className="mt-1 text-xs text-[#9CA3AF]">{g.detail}</p>}
                </motion.div>
              );
            })}
            {(!data.gaps || data.gaps.length === 0) && <p className="text-sm text-[#6B7280]">No major gaps.</p>}
          </div>
        </div>
      </div>

      {/* Keywords */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-[#141414] p-5">
          <div className="mb-3 flex items-center gap-2">
            <Tag className="h-4 w-4 text-[#10B981]" />
            <p className="overline text-[#6B7280]">Matched keywords</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(data.matched_keywords || []).map((k, i) => (
              <span key={i} className="rounded-full border border-[#10B981]/30 bg-[#10B981]/10 px-2.5 py-1 text-xs text-[#10B981]">{k}</span>
            ))}
            {(!data.matched_keywords || data.matched_keywords.length === 0) && <p className="text-sm text-[#6B7280]">—</p>}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#141414] p-5">
          <div className="mb-3 flex items-center gap-2">
            <XCircle className="h-4 w-4 text-[#F59E0B]" />
            <p className="overline text-[#6B7280]">Missing keywords</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(data.missing_keywords || []).map((k, i) => (
              <span key={i} className="rounded-full border border-[#F59E0B]/30 bg-[#F59E0B]/10 px-2.5 py-1 text-xs text-[#F59E0B]">{k}</span>
            ))}
            {(!data.missing_keywords || data.missing_keywords.length === 0) && <p className="text-sm text-[#6B7280]">—</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
