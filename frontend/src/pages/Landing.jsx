import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sparkles, FileText, Target, MessageSquare, ScanLine, GitCompareArrows,
  ArrowRight, ShieldCheck, Zap, BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const features = [
  { icon: Target, title: "Fit Analysis", desc: "Instant match scoring against any job description with strengths & gaps.", color: "#0066FF" },
  { icon: GitCompareArrows, title: "Resume Rewrite", desc: "AI rewrites your resume with a side-by-side before/after diff view.", color: "#8B5CF6" },
  { icon: FileText, title: "Cover Letters", desc: "Tailored, confident cover letters generated in seconds.", color: "#10B981" },
  { icon: MessageSquare, title: "Interview Pack", desc: "Personalized questions with STAR model answers and coaching tips.", color: "#F59E0B" },
  { icon: ScanLine, title: "ATS Score", desc: "Simulate applicant tracking systems and fix what blocks you.", color: "#0066FF" },
  { icon: BarChart3, title: "Application Tracker", desc: "A pipeline view of every application with live status.", color: "#8B5CF6" },
];

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0A0A0A] text-[#F3F4F6]">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-[#0066FF] opacity-20 blur-[140px]" />
      <div className="pointer-events-none absolute top-20 right-0 h-[400px] w-[400px] rounded-full bg-[#8B5CF6] opacity-20 blur-[140px]" />
      <div className="absolute inset-0 bg-grid opacity-40" />

      {/* Nav */}
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0066FF]">
            <Sparkles className="h-5 w-5 text-white" strokeWidth={2} />
          </div>
          <span className="font-display text-xl font-bold tracking-tight">CareerOS</span>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <Button data-testid="nav-dashboard-btn" onClick={() => navigate("/app")} className="bg-[#0066FF] hover:bg-[#0052CC] text-white rounded-full">
              Open Dashboard
            </Button>
          ) : (
            <>
              <Link to="/login" data-testid="nav-login-link" className="text-sm text-[#9CA3AF] hover:text-white transition-colors">
                Sign in
              </Link>
              <Button data-testid="nav-getstarted-btn" onClick={() => navigate("/register")} className="bg-[#0066FF] hover:bg-[#0052CC] text-white rounded-full">
                Get started
              </Button>
            </>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pt-20 pb-28 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 glass px-4 py-1.5 text-xs text-[#9CA3AF]"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#8B5CF6] glow-violet" />
          Powered by OpenAI — multi-agent AI pipeline
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="font-display mx-auto max-w-4xl text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl"
        >
          The AI career operating system
          <span className="block bg-gradient-to-r from-[#0066FF] via-[#8B5CF6] to-[#10B981] bg-clip-text text-transparent">
            that gets you hired.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[#9CA3AF]"
        >
          Upload your resume, paste a job description, and let a team of AI agents analyze fit,
          rewrite your resume, draft cover letters, build interview prep and score your ATS — all in one workspace.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Button
            data-testid="hero-getstarted-btn"
            onClick={() => navigate(user ? "/app" : "/register")}
            className="h-12 rounded-full bg-[#0066FF] px-7 text-base font-medium text-white hover:bg-[#0052CC]"
          >
            {user ? "Open dashboard" : "Build my first application"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button
            data-testid="hero-signin-btn"
            variant="outline"
            onClick={() => navigate("/login")}
            className="h-12 rounded-full border-white/15 bg-white/5 px-7 text-base text-[#F3F4F6] hover:bg-white/10"
          >
            Sign in
          </Button>
        </motion.div>

        <div className="mt-10 flex items-center justify-center gap-6 text-xs text-[#6B7280]">
          <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4" /> Private & secure</span>
          <span className="flex items-center gap-1.5"><Zap className="h-4 w-4" /> Results in seconds</span>
          <span className="flex items-center gap-1.5"><Sparkles className="h-4 w-4" /> 5 AI agents</span>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-32">
        <p className="overline mb-3 text-center text-[#8B5CF6]">Everything you need</p>
        <h2 className="font-display mb-12 text-center text-3xl font-bold tracking-tight sm:text-4xl">
          One workspace. Five specialized agents.
        </h2>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="group rounded-2xl border border-white/10 bg-[#141414] p-6 transition-colors hover:border-white/20"
            >
              <div
                className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${f.color}1A`, color: f.color }}
              >
                <f.icon className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <h3 className="font-display mb-2 text-lg font-semibold">{f.title}</h3>
              <p className="text-sm leading-relaxed text-[#9CA3AF]">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 mx-auto max-w-4xl px-6 pb-32">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#141414] to-[#0d0d0d] p-12 text-center">
          <div className="pointer-events-none absolute -top-20 left-1/2 h-60 w-60 -translate-x-1/2 rounded-full bg-[#0066FF] opacity-20 blur-[100px]" />
          <h2 className="font-display relative text-3xl font-bold tracking-tight sm:text-4xl">
            Stop guessing. Start landing interviews.
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-[#9CA3AF]">
            Join CareerOS and turn every application into a tailored, ATS-ready submission.
          </p>
          <Button
            data-testid="cta-getstarted-btn"
            onClick={() => navigate(user ? "/app" : "/register")}
            className="relative mt-8 h-12 rounded-full bg-[#0066FF] px-8 text-base font-medium text-white hover:bg-[#0052CC]"
          >
            Get started free <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/10 py-8 text-center text-sm text-[#6B7280]">
        © {new Date().getFullYear()} CareerOS — Built with AI, designed for humans.
      </footer>
    </div>
  );
}
