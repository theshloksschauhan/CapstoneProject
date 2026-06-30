import React from "react";
import { scoreColor } from "@/lib/format";

export default function ScoreRing({ score, size = 120, stroke = 10, label, testId }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const value = score == null ? 0 : Math.max(0, Math.min(100, score));
  const offset = circumference - (value / 100) * circumference;
  const color = scoreColor(score);

  return (
    <div className="relative inline-flex items-center justify-center" data-testid={testId}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s ease, stroke 0.4s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-3xl font-bold" style={{ color }}>
          {score == null ? "—" : value}
        </span>
        {label && <span className="overline text-[#6B7280] mt-0.5">{label}</span>}
      </div>
    </div>
  );
}
