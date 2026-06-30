import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Loader2, Sparkles } from "lucide-react";

const STEPS = [
  "Parsing resume & job description",
  "Analyzing fit & match rate",
  "Rewriting your resume",
  "Drafting a tailored cover letter",
  "Building your interview pack",
  "Scoring ATS compatibility",
];

export default function GenerationProgress() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((a) => (a < STEPS.length - 1 ? a + 1 : a));
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-16 text-center" data-testid="generation-progress">
      <div className="relative mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#8B5CF6]/15 glow-violet">
        <Sparkles className="h-7 w-7 text-[#8B5CF6]" />
      </div>
      <h2 className="font-display mb-1 text-xl font-bold text-[#F3F4F6]">AI agents at work</h2>
      <p className="mb-8 text-sm text-[#9CA3AF]">This usually takes 30–60 seconds. Hang tight.</p>

      <div className="w-full space-y-2.5">
        {STEPS.map((step, i) => {
          const done = i < active;
          const current = i === active;
          return (
            <motion.div
              key={step}
              initial={{ opacity: 0.4 }}
              animate={{ opacity: done || current ? 1 : 0.4 }}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm ${
                current
                  ? "border-[#8B5CF6]/40 ai-shimmer text-[#F3F4F6]"
                  : done
                  ? "border-[#10B981]/30 bg-[#10B981]/5 text-[#F3F4F6]"
                  : "border-white/10 bg-white/5 text-[#6B7280]"
              }`}
            >
              {done ? (
                <Check className="h-4 w-4 flex-shrink-0 text-[#10B981]" />
              ) : current ? (
                <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin text-[#8B5CF6]" />
              ) : (
                <span className="h-4 w-4 flex-shrink-0 rounded-full border border-white/20" />
              )}
              {step}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
