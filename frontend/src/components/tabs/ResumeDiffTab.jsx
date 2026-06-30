import React from "react";
import { toast } from "sonner";
import { Copy, ArrowRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { triggerDownload } from "@/lib/download";

export default function ResumeDiffTab({ data, originalResume, appId }) {
  if (!data) return null;

  const copy = () => {
    navigator.clipboard.writeText(data.rewritten_resume || "");
    toast.success("Rewritten resume copied to clipboard");
  };

  const download = async () => {
    try {
      const { data: blob } = await api.get(`/applications/${appId}/export/resume.pdf`, { responseType: "blob" });
      triggerDownload(blob, `resume-${appId}.pdf`);
      toast.success("Resume downloaded");
    } catch {
      toast.error("Could not download resume");
    }
  };

  return (
    <div className="space-y-6" data-testid="resume-diff-tab">
      {data.summary_of_changes && (
        <div className="rounded-2xl border border-[#8B5CF6]/30 bg-[#8B5CF6]/5 p-4">
          <p className="overline mb-1 text-[#8B5CF6]">What changed</p>
          <p className="text-sm text-[#F3F4F6]">{data.summary_of_changes}</p>
        </div>
      )}

      {/* Side-by-side */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-[#141414] p-5">
          <p className="overline mb-3 text-[#6B7280]">Original</p>
          <pre className="max-h-[420px] overflow-y-auto whitespace-pre-wrap font-mono text-xs leading-relaxed text-[#9CA3AF]" data-testid="resume-original">
            {originalResume || "—"}
          </pre>
        </div>
        <div className="rounded-2xl border border-[#10B981]/30 bg-[#141414] p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="overline text-[#10B981]">AI rewritten</p>
            <div className="flex gap-2">
              <Button
                data-testid="download-resume-btn"
                size="sm" variant="ghost"
                onClick={download}
                className="h-7 text-[#10B981] hover:bg-[#10B981]/10 hover:text-[#10B981]"
              >
                <Download className="mr-1.5 h-3.5 w-3.5" /> Download
              </Button>
              <Button
                data-testid="copy-resume-btn"
                size="sm" variant="ghost"
                onClick={copy}
                className="h-7 text-[#10B981] hover:bg-[#10B981]/10 hover:text-[#10B981]"
              >
                <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy
              </Button>
            </div>
          </div>
          <pre className="max-h-[420px] overflow-y-auto whitespace-pre-wrap font-mono text-xs leading-relaxed text-[#F3F4F6]" data-testid="resume-rewritten">
            {data.rewritten_resume || "—"}
          </pre>
        </div>
      </div>

      {/* Change log */}
      {data.changes?.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-[#141414] p-5">
          <p className="overline mb-4 text-[#6B7280]">Detailed improvements</p>
          <div className="space-y-4">
            {data.changes.map((c, i) => (
              <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-4" data-testid={`change-${i}`}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#8B5CF6]">{c.section}</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                  <div className="rounded-lg border border-[#EF4444]/20 bg-[#EF4444]/5 p-2.5 text-xs text-[#9CA3AF] line-through decoration-[#EF4444]/50">
                    {c.original}
                  </div>
                  <ArrowRight className="mx-auto hidden h-4 w-4 text-[#6B7280] sm:block" />
                  <div className="rounded-lg border border-[#10B981]/20 bg-[#10B981]/5 p-2.5 text-xs text-[#F3F4F6]">
                    {c.improved}
                  </div>
                </div>
                {c.reason && <p className="mt-2 text-xs text-[#6B7280]">{c.reason}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
