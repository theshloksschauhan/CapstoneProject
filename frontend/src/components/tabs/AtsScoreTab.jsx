import React from "react";
import { motion } from "framer-motion";
import { ScanLine, Lightbulb, XCircle } from "lucide-react";
import ScoreRing from "@/components/ScoreRing";
import { scoreColor } from "@/lib/format";

export default function AtsScoreTab({ data }) {
  if (!data) return null;
  return (
    <div className="space-y-6" data-testid="ats-score-tab">
      <div className="flex flex-col items-center gap-6 rounded-2xl border border-white/10 bg-[#141414] p-6 sm:flex-row">
        <ScoreRing score={data.overall_score} label="ATS" testId="ats-overall-ring" />
        <div className="flex-1 text-center sm:text-left">
          <p className="overline mb-1 text-[#F59E0B]">ATS compatibility</p>
          <h3 className="font-display mb-2 text-xl font-semibold text-[#F3F4F6]">
            {data.overall_score >= 75 ? "Strong — likely to pass" : data.overall_score >= 50 ? "Moderate — needs tuning" : "Weak — high risk of filtering"}
          </h3>
          <p className="text-sm text-[#9CA3AF]">Simulated score against an applicant tracking system for this role.</p>
        </div>
      </div>

      {/* Breakdown */}
      <div className="rounded-2xl border border-white/10 bg-[#141414] p-5">
        <p className="overline mb-4 text-[#6B7280]">Score breakdown</p>
        <div className="space-y-4">
          {(data.breakdown || []).map((b, i) => (
            <div key={i} data-testid={`ats-breakdown-${i}`}>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-sm font-medium text-[#F3F4F6]">{b.category}</span>
                <span className="text-sm font-semibold" style={{ color: scoreColor(b.score) }}>{b.score}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${b.score}%` }}
                  transition={{ duration: 0.8, delay: i * 0.08 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: scoreColor(b.score) }}
                />
              </div>
              {b.note && <p className="mt-1 text-xs text-[#6B7280]">{b.note}</p>}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-[#141414] p-5">
          <div className="mb-3 flex items-center gap-2">
            <XCircle className="h-4 w-4 text-[#F59E0B]" />
            <p className="overline text-[#6B7280]">Missing keywords</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(data.missing_keywords || []).map((k, i) => (
              <span key={i} className="rounded-full border border-[#F59E0B]/30 bg-[#F59E0B]/10 px-2.5 py-1 text-xs text-[#F59E0B]">{k}</span>
            ))}
            {(!data.missing_keywords || data.missing_keywords.length === 0) && <p className="text-sm text-[#6B7280]">None — great keyword coverage.</p>}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#141414] p-5">
          <div className="mb-3 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-[#0066FF]" />
            <p className="overline text-[#6B7280]">Suggestions</p>
          </div>
          <ul className="space-y-2">
            {(data.suggestions || []).map((s, i) => (
              <li key={i} className="flex gap-2 text-sm text-[#9CA3AF]">
                <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-[#0066FF]" />
                {s}
              </li>
            ))}
            {(!data.suggestions || data.suggestions.length === 0) && <p className="text-sm text-[#6B7280]">—</p>}
          </ul>
        </div>
      </div>
    </div>
  );
}
