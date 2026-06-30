import React from "react";
import { toast } from "sonner";
import { Copy, Quote, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { triggerDownload } from "@/lib/download";

export default function CoverLetterTab({ data, appId }) {
  if (!data) return null;
  const copy = () => {
    navigator.clipboard.writeText(data.cover_letter || "");
    toast.success("Cover letter copied to clipboard");
  };

  const download = async () => {
    try {
      const { data: blob } = await api.get(`/applications/${appId}/export/cover-letter.docx`, { responseType: "blob" });
      triggerDownload(blob, `cover-letter-${appId}.docx`);
      toast.success("Cover letter downloaded");
    } catch {
      toast.error("Could not download cover letter");
    }
  };

  return (
    <div className="space-y-6" data-testid="cover-letter-tab">
      {data.hook && (
        <div className="flex items-start gap-3 rounded-2xl border border-[#8B5CF6]/30 bg-[#8B5CF6]/5 p-4">
          <Quote className="h-4 w-4 flex-shrink-0 text-[#8B5CF6]" />
          <div>
            <p className="overline mb-1 text-[#8B5CF6]">Opening hook</p>
            <p className="text-sm italic text-[#F3F4F6]">{data.hook}</p>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-white/10 bg-[#141414] p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="overline text-[#6B7280]">Cover letter</p>
          <div className="flex gap-2">
            <Button
              data-testid="download-cover-letter-btn"
              size="sm" variant="ghost"
              onClick={download}
              className="h-7 text-[#0066FF] hover:bg-[#0066FF]/10 hover:text-[#0066FF]"
            >
              <Download className="mr-1.5 h-3.5 w-3.5" /> Download
            </Button>
            <Button
              data-testid="copy-cover-letter-btn"
              size="sm" variant="ghost"
              onClick={copy}
              className="h-7 text-[#0066FF] hover:bg-[#0066FF]/10 hover:text-[#0066FF]"
            >
              <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy
            </Button>
          </div>
        </div>
        <div className="whitespace-pre-wrap text-sm leading-7 text-[#E5E7EB]" data-testid="cover-letter-text">
          {data.cover_letter || "—"}
        </div>
      </div>
    </div>
  );
}
