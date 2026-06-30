import React, { useState, useRef } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Upload, FileText, ArrowLeft, Sparkles, Loader2, CheckCircle2, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import api, { formatApiErrorDetail } from "@/lib/api";
import GenerationProgress from "@/components/GenerationProgress";

export default function NewApplication() {
  const navigate = useNavigate();
  const { refresh } = useOutletContext();
  const fileInputRef = useRef(null);

  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobDescriptionMode, setJobDescriptionMode] = useState("text");
  const [jobDescriptionUrl, setJobDescriptionUrl] = useState("");
  const [scraping, setScraping] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const [fileName, setFileName] = useState("");
  const [parsing, setParsing] = useState(false);
  const [generating, setGenerating] = useState(false);

  const handleFile = async (file) => {
    if (!file) return;
    setParsing(true);
    setFileName(file.name);
    try {
      const form = new FormData();
      form.append("file", file);
      const { data } = await api.post("/resume/parse", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResumeText(data.text);
      toast.success(`Parsed ${data.char_count.toLocaleString()} characters from ${data.filename}`);
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Failed to parse file");
      setFileName("");
    } finally {
      setParsing(false);
    }
  };

  const scrapeJobDescription = async () => {
    if (!jobDescriptionUrl.trim()) {
      toast.error("Paste a job URL first.");
      return;
    }
    setScraping(true);
    try {
      const { data } = await api.post("/jd/scrape", { url: jobDescriptionUrl.trim() });
      setJobDescription(data.text);
      toast.success(`Scraped ${data.char_count.toLocaleString()} characters from the URL`);
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Could not scrape the URL");
    } finally {
      setScraping(false);
    }
  };

  const canSubmit = jobTitle.trim() && company.trim() && jobDescription.trim() && resumeText.trim();

  const handleSubmit = async () => {
    if (!canSubmit) {
      toast.error("Please fill in all fields and add your resume.");
      return;
    }
    setGenerating(true);
    try {
      const { data: appData } = await api.post("/applications", {
        job_title: jobTitle,
        company,
        job_description: jobDescription,
        resume_text: resumeText,
      });
      await api.post(`/applications/${appData.id}/run`);
      await refresh();
      toast.success("AI analysis complete!");
      navigate(`/app/application/${appData.id}`);
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Generation failed");
      setGenerating(false);
    }
  };

  if (generating) {
    return (
      <div className="mx-auto max-w-3xl px-8 py-8">
        <GenerationProgress />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-8 py-8" data-testid="new-application-page">
      <button
        onClick={() => navigate("/app")}
        data-testid="back-btn"
        className="mb-6 flex items-center gap-1.5 text-sm text-[#9CA3AF] transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Back to dashboard
      </button>

      <p className="overline mb-1 text-[#8B5CF6]">New application</p>
      <h1 className="font-display mb-8 text-3xl font-bold tracking-tight">Set up your application</h1>

      <div className="space-y-6">
        {/* Role */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label className="text-[#9CA3AF]">Job title</Label>
            <Input
              data-testid="job-title-input"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="Senior Product Designer"
              className="mt-1.5 border-white/10 bg-white/5 text-[#F3F4F6] focus-visible:ring-[#0066FF]"
            />
          </div>
          <div>
            <Label className="text-[#9CA3AF]">Company</Label>
            <Input
              data-testid="company-input"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Acme Inc."
              className="mt-1.5 border-white/10 bg-white/5 text-[#F3F4F6] focus-visible:ring-[#0066FF]"
            />
          </div>
        </div>

        {/* Resume upload */}
        <div>
          <Label className="text-[#9CA3AF]">Your resume</Label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,.md"
            className="hidden"
            data-testid="resume-file-input"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          {!resumeText ? (
            <button
              data-testid="upload-resume-button"
              onClick={() => fileInputRef.current?.click()}
              disabled={parsing}
              className="mt-1.5 flex w-full flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/5 px-6 py-10 transition-colors hover:border-[#0066FF]/50 hover:bg-[#0066FF]/5"
            >
              {parsing ? (
                <>
                  <Loader2 className="mb-3 h-6 w-6 animate-spin text-[#0066FF]" />
                  <span className="text-sm text-[#9CA3AF]">Parsing {fileName}…</span>
                </>
              ) : (
                <>
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#0066FF]/15 text-[#0066FF]">
                    <Upload className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium text-[#F3F4F6]">Upload your resume</span>
                  <span className="mt-1 text-xs text-[#6B7280]">PDF or TXT · or paste text below</span>
                </>
              )}
            </button>
          ) : (
            <div className="mt-1.5 flex items-center justify-between rounded-2xl border border-[#10B981]/30 bg-[#10B981]/5 px-4 py-3" data-testid="resume-parsed-indicator">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-[#10B981]" />
                <div>
                  <p className="text-sm font-medium text-[#F3F4F6]">{fileName || "Resume added"}</p>
                  <p className="text-xs text-[#6B7280]">{resumeText.length.toLocaleString()} characters ready</p>
                </div>
              </div>
              <button
                data-testid="clear-resume-btn"
                onClick={() => { setResumeText(""); setFileName(""); }}
                className="rounded-lg p-1.5 text-[#9CA3AF] hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          <Textarea
            data-testid="resume-text-input"
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="…or paste your resume text here"
            className="mt-3 min-h-[120px] border-white/10 bg-white/5 text-sm text-[#F3F4F6] focus-visible:ring-[#0066FF]"
          />
        </div>

        {/* Job description */}
        <div>
          <Label className="text-[#9CA3AF]">Job description</Label>
          <div className="mt-2 flex gap-2">
            <Button type="button" variant={jobDescriptionMode === "text" ? "default" : "ghost"} size="sm" onClick={() => setJobDescriptionMode("text")}>Paste text</Button>
            <Button type="button" variant={jobDescriptionMode === "url" ? "default" : "ghost"} size="sm" onClick={() => setJobDescriptionMode("url")}>Paste URL</Button>
          </div>
          {jobDescriptionMode === "url" && (
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <Input
                value={jobDescriptionUrl}
                onChange={(e) => setJobDescriptionUrl(e.target.value)}
                placeholder="https://company.com/jobs/..."
                className="border-white/10 bg-white/5 text-[#F3F4F6] focus-visible:ring-[#0066FF]"
              />
              <Button type="button" onClick={scrapeJobDescription} disabled={scraping} className="sm:w-40">
                {scraping ? "Scraping…" : "Fetch JD"}
              </Button>
            </div>
          )}
          <Textarea
            data-testid="job-description-input"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder={jobDescriptionMode === "url" ? "Scraped text will appear here for review…" : "Paste the full job description here…"}
            className="mt-3 min-h-[200px] border-white/10 bg-white/5 text-sm text-[#F3F4F6] focus-visible:ring-[#0066FF]"
          />
        </div>

        <Button
          data-testid="run-pipeline-btn"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="h-12 w-full rounded-full bg-gradient-to-r from-[#0066FF] to-[#8B5CF6] text-base font-medium text-white hover:opacity-90 disabled:opacity-40"
        >
          <Sparkles className="mr-2 h-5 w-5" /> Run AI analysis
        </Button>
      </div>
    </div>
  );
}
