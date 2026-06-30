import React from "react";
import { DollarSign, MessageSquare, Lightbulb } from "lucide-react";

export default function SalaryNegotiationTab({ data }) {
  if (!data) return null;

  return (
    <div className="space-y-6" data-testid="salary-negotiation-tab">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex flex-1 flex-col justify-center rounded-2xl border border-white/10 bg-[#141414] p-6">
          <div className="mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-[#10B981]" />
            <h3 className="font-display text-lg font-semibold text-[#F3F4F6]">Market Value Estimate</h3>
          </div>
          <p className="text-xl font-medium text-[#10B981]">{data.market_value_estimate || "Unknown"}</p>
        </div>

        {data.tips && data.tips.length > 0 && (
          <div className="flex-1 rounded-2xl border border-[#F59E0B]/30 bg-[#F59E0B]/5 p-6">
            <div className="mb-4 flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-[#F59E0B]" />
              <h3 className="font-display text-lg font-semibold text-[#F3F4F6]">Pro Tips</h3>
            </div>
            <ul className="space-y-2">
              {data.tips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-[#E5E7EB]">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#F59E0B]" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {data.negotiation_scripts && data.negotiation_scripts.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-[#141414] p-6">
          <h3 className="font-display mb-4 flex items-center gap-2 text-lg font-semibold text-[#F3F4F6]">
            <MessageSquare className="h-5 w-5 text-[#0066FF]" />
            Negotiation Scripts
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {data.negotiation_scripts.map((item, idx) => (
              <div key={idx} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="overline mb-2 text-[#0066FF]">{item.scenario}</p>
                <div className="whitespace-pre-wrap text-sm italic text-[#9CA3AF]">
                  "{item.script}"
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
