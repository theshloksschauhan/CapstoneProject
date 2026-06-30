import React from "react";
import { STATUS_META } from "@/lib/format";

export default function StatusBadge({ status, testId }) {
  const meta = STATUS_META[status] || STATUS_META.draft;
  return (
    <span
      data-testid={testId}
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
      style={{
        backgroundColor: `${meta.color}1A`,
        color: meta.color,
        border: `1px solid ${meta.color}33`,
      }}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}
