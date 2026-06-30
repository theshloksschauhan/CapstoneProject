import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft, Sparkles, Loader2, RefreshCw, Target, GitCompareArrows,
  FileText, MessageSquare, ScanLine, Trash2, Clock, Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import api, { formatApiErrorDetail } from "@/lib/api";
import { STATUS_META, STATUS_ORDER, relativeTime } from "@/lib/format";
import GenerationProgress from "@/components/GenerationProgress";
import FitAnalysisTab from "@/components/tabs/FitAnalysisTab";
import AtsScoreTab from "@/components/tabs/AtsScoreTab";
import ResumeDiffTab from "@/components/tabs/ResumeDiffTab";
import CoverLetterTab from "@/components/tabs/CoverLetterTab";
import InterviewPackTab from "@/components/tabs/InterviewPackTab";
import SalaryNegotiationTab from "@/components/tabs/SalaryNegotiationTab";
import { triggerDownload } from "@/lib/download";
import { DollarSign } from "lucide-react";

const TABS = [
  { key: "fit_analysis", label: "Fit Analysis", icon: Target },
  { key: "resume_rewrite", label: "Resume", icon: GitCompareArrows },
  { key: "cover_letter", label: "Cover Letter", icon: FileText },
  { key: "interview_pack", label: "Interview Pack", icon: MessageSquare },
  { key: "salary_negotiation", label: "Salary Coach", icon: DollarSign },
  { key: "ats_score", label: "ATS Score", icon: ScanLine },
];

export default function ApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refresh } = useOutletContext();
  const [appData, setAppData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [regenKey, setRegenKey] = useState(null);
  const [tab, setTab] = useState("fit_analysis");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/applications/${id}`);
      setAppData(data);
    } catch (e) {
      toast.error("Application not found");
      navigate("/app");
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => { load(); }, [load]);

  const runPipeline = async () => {
    setRunning(true);
    try {
      const { data } = await api.post(`/applications/${id}/run`);
      setAppData(data);
      await refresh();
      toast.success("AI analysis complete!");
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Generation failed");
    } finally {
      setRunning(false);
    }
  };

  const regenerate = async (agent) => {
    setRegenKey(agent);
    try {
      const { data } = await api.post(`/applications/${id}/regenerate/${agent}`);
      setAppData(data);
      await refresh();
      toast.success("Regenerated successfully");
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Regeneration failed");
    } finally {
      setRegenKey(null);
    }
  };

  const changeStatus = async (status) => {
    try {
      const { data } = await api.patch(`/applications/${id}/status`, { status });
      setAppData(data);
      await refresh();
      toast.success(`Marked as ${STATUS_META[status].label}`);
    } catch (err) {
      toast.error("Could not update status");
    }
  };

  const remove = async () => {
    try {
      await api.delete(`/applications/${id}`);
      await refresh();
      toast.success("Application deleted");
      navigate("/app");
    } catch (err) {
      toast.error("Could not delete");
    }
  };

  const addToCalendar = async () => {
    try {
      const { data: blob } = await api.get(`/applications/${id}/export/followup.ics`, { responseType: "blob" });
      triggerDownload(blob, `followup-${id}.ics`);
      toast.success("Calendar reminder downloaded");
    } catch (err) {
      toast.error("Could not download calendar reminder");
    }
  };

  if (loading || !appData) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#0066FF]" />
      </div>
    );
  }

  const results = appData.results || {};
  const generated = appData.generated;

  return (
    <div className="mx-auto max-w-6xl px-8 py-8" data-testid="application-detail">
      <button
        onClick={() => navigate("/app")}
        data-testid="detail-back-btn"
        className="mb-5 flex items-center gap-1.5 text-sm text-[#9CA3AF] transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Dashboard
      </button>

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#F3F4F6]">{appData.job_title}</h1>
          <p className="text-[#9CA3AF]">{appData.company}</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={appData.status} onValueChange={changeStatus}>
            <SelectTrigger data-testid="status-select" className="w-[150px] border-white/10 bg-white/5 text-[#F3F4F6]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-[#141414] text-[#F3F4F6]">
              {STATUS_ORDER.map((s) => (
                <SelectItem key={s} value={s} data-testid={`status-option-${s}`}>
                  <span className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${STATUS_META[s].dot}`} />
                    {STATUS_META[s].label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button data-testid="calendar-btn" onClick={addToCalendar} variant="ghost" size="icon" className="text-[#9CA3AF] hover:bg-white/10 hover:text-white" title="Add reminder to calendar">
            <Calendar className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button data-testid="delete-app-btn" variant="ghost" size="icon" className="text-[#9CA3AF] hover:bg-[#EF4444]/10 hover:text-[#EF4444]">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="border-white/10 bg-[#141414] text-[#F3F4F6]">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this application?</AlertDialogTitle>
                <AlertDialogDescription className="text-[#9CA3AF]">
                  This permanently removes the application and all AI-generated content.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-white/10 bg-transparent text-[#F3F4F6] hover:bg-white/10">Cancel</AlertDialogCancel>
                <AlertDialogAction data-testid="confirm-delete-btn" onClick={remove} className="bg-[#EF4444] text-white hover:bg-[#DC2626]">Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Status timeline */}
      {appData.status_history?.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-[#141414] px-4 py-3">
          <Clock className="h-3.5 w-3.5 text-[#6B7280]" />
          {appData.status_history.map((h, i) => (
            <span key={i} className="flex items-center gap-1.5 text-xs text-[#9CA3AF]">
              {i > 0 && <span className="text-[#6B7280]">→</span>}
              <span className={`h-1.5 w-1.5 rounded-full ${STATUS_META[h.status]?.dot}`} />
              {STATUS_META[h.status]?.label}
              <span className="text-[#6B7280]">· {relativeTime(h.at)}</span>
            </span>
          ))}
        </div>
      )}

      {/* Not generated yet */}
      {!generated && !running && (
        <div className="rounded-2xl border border-dashed border-[#8B5CF6]/30 bg-[#8B5CF6]/5 py-16 text-center" data-testid="run-prompt">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#8B5CF6]/15 text-[#8B5CF6] glow-violet">
            <Sparkles className="h-6 w-6" />
          </div>
          <h3 className="font-display mb-1 text-lg font-semibold">Ready to analyze</h3>
          <p className="mb-5 text-sm text-[#9CA3AF]">Run the AI pipeline to generate fit analysis, resume rewrite, cover letter, interview prep and ATS score.</p>
          <Button data-testid="run-ai-btn" onClick={runPipeline} className="rounded-full bg-gradient-to-r from-[#0066FF] to-[#8B5CF6] text-white hover:opacity-90">
            <Sparkles className="mr-2 h-4 w-4" /> Run AI analysis
          </Button>
        </div>
      )}

      {running && <GenerationProgress />}

      {/* Results tabs */}
      {generated && !running && (
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <div className="mb-6 flex items-center justify-between gap-4 overflow-x-auto">
            <TabsList className="flex h-auto flex-wrap gap-1 bg-[#141414] p-1">
              {TABS.map((t) => (
                <TabsTrigger
                  key={t.key} value={t.key}
                  data-testid={`tab-${t.key}`}
                  className="gap-1.5 rounded-lg px-3 py-2 text-sm data-[state=active]:bg-white/10 data-[state=active]:text-white"
                >
                  <t.icon className="h-3.5 w-3.5" /> {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
            <Button
              data-testid="regenerate-btn"
              variant="outline" size="sm"
              disabled={regenKey === tab}
              onClick={() => regenerate(tab)}
              className="flex-shrink-0 border-[#8B5CF6]/30 bg-[#8B5CF6]/5 text-[#C4B5FD] hover:bg-[#8B5CF6]/15 hover:text-white"
            >
              {regenKey === tab ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="mr-1.5 h-3.5 w-3.5" />}
              Regenerate
            </Button>
          </div>

          {regenKey === tab ? (
            <GenerationProgress />
          ) : (
            <>
              <TabsContent value="fit_analysis"><FitAnalysisTab data={results.fit_analysis} /></TabsContent>
              <TabsContent value="resume_rewrite"><ResumeDiffTab data={results.resume_rewrite} originalResume={appData.resume_text} appId={id} /></TabsContent>
              <TabsContent value="cover_letter"><CoverLetterTab data={results.cover_letter} appId={id} /></TabsContent>
              <TabsContent value="interview_pack"><InterviewPackTab data={results.interview_pack} /></TabsContent>
              <TabsContent value="salary_negotiation"><SalaryNegotiationTab data={results.salary_negotiation} /></TabsContent>
              <TabsContent value="ats_score"><AtsScoreTab data={results.ats_score} /></TabsContent>
            </>
          )}
        </Tabs>
      )}
    </div>
  );
}
