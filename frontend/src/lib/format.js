export const STATUS_META = {
  draft: { label: "Draft", color: "#6B7280", dot: "bg-[#6B7280]" },
  applied: { label: "Applied", color: "#0066FF", dot: "bg-[#0066FF]" },
  interviewing: { label: "Interviewing", color: "#8B5CF6", dot: "bg-[#8B5CF6]" },
  offer: { label: "Offer", color: "#10B981", dot: "bg-[#10B981]" },
  rejected: { label: "Rejected", color: "#EF4444", dot: "bg-[#EF4444]" },
};

export const STATUS_ORDER = ["draft", "applied", "interviewing", "offer", "rejected"];

export function scoreColor(score) {
  if (score == null) return "#6B7280";
  if (score >= 75) return "#10B981";
  if (score >= 50) return "#F59E0B";
  return "#EF4444";
}

export function relativeTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString();
}
