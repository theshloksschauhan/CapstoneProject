import React, { useState, useRef } from "react";
import { Lightbulb, Target, Mic, Square, Play } from "lucide-react";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";

const CATEGORY_COLOR = {
  Behavioral: "#0066FF",
  Technical: "#8B5CF6",
  "Role-specific": "#10B981",
  Culture: "#F59E0B",
};
const DIFFICULTY_COLOR = { easy: "#10B981", medium: "#F59E0B", hard: "#EF4444" };

export default function InterviewPackTab({ data }) {
  const [recordingId, setRecordingId] = useState(null);
  const [transcripts, setTranscripts] = useState({});
  const recognitionRef = useRef(null);

  const toggleRecording = (qId) => {
    if (recordingId === qId) {
      // Stop recording
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setRecordingId(null);
    } else {
      // Start recording
      if (recordingId && recognitionRef.current) {
        recognitionRef.current.stop();
      }
      
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert("Your browser does not support the Speech Recognition API. Please use Chrome or Edge.");
        return;
      }
      
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onresult = (event) => {
        let finalTranscript = "";
        let interimTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + " ";
          } else {
            interimTranscript += transcript;
          }
        }
        
        setTranscripts(prev => ({
          ...prev,
          [qId]: (prev[qId] || "").replace(/ \[.*\]$/, "") + finalTranscript + (interimTranscript ? ` [${interimTranscript}]` : "")
        }));
      };
      
      recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setRecordingId(null);
      };
      
      recognition.onend = () => {
        if (recordingId === qId) {
          setRecordingId(null);
        }
      };
      
      recognitionRef.current = recognition;
      
      if (!transcripts[qId]) {
         setTranscripts(prev => ({...prev, [qId]: ""}));
      }
      
      try {
        recognition.start();
        setRecordingId(qId);
      } catch (err) {
        console.error("Failed to start speech recognition", err);
      }
    }
  };

  if (!data) return null;
  return (
    <div className="space-y-6" data-testid="interview-pack-tab">
      {data.focus_areas?.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-[#141414] p-5">
          <div className="mb-3 flex items-center gap-2">
            <Target className="h-4 w-4 text-[#8B5CF6]" />
            <p className="overline text-[#6B7280]">Focus areas</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.focus_areas.map((f, i) => (
              <span key={i} className="rounded-full border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 px-3 py-1 text-xs text-[#C4B5FD]">{f}</span>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-white/10 bg-[#141414] p-2">
        <Accordion type="single" collapsible className="w-full">
          {(data.questions || []).map((q, i) => {
            const catColor = CATEGORY_COLOR[q.category] || "#6B7280";
            const diffColor = DIFFICULTY_COLOR[q.difficulty] || "#6B7280";
            return (
              <AccordionItem key={i} value={`q-${i}`} className="border-white/10 px-3" data-testid={`interview-q-${i}`}>
                <AccordionTrigger className="text-left hover:no-underline">
                  <div className="flex flex-1 items-start gap-3 pr-3">
                    <span className="mt-0.5 font-mono text-xs text-[#6B7280]">{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-sm font-medium text-[#F3F4F6]">{q.question}</span>
                  </div>
                  <div className="mr-3 flex flex-shrink-0 gap-1.5">
                    <span className="rounded-full px-2 py-0.5 text-[10px]" style={{ backgroundColor: `${catColor}1A`, color: catColor }}>{q.category}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pl-9 pr-3">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="rounded-full px-2 py-0.5 text-[10px]" style={{ backgroundColor: `${diffColor}1A`, color: diffColor }}>{q.difficulty}</span>
                  </div>
                  <p className="overline mb-1 text-[#6B7280]">Suggested answer</p>
                  <p className="mb-3 text-sm leading-relaxed text-[#D1D5DB]">{q.suggested_answer}</p>
                  {q.tip && (
                    <div className="flex items-start gap-2 rounded-lg border border-[#0066FF]/20 bg-[#0066FF]/5 p-2.5 mb-4">
                      <Lightbulb className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#0066FF]" />
                      <p className="text-xs text-[#9CA3AF]">{q.tip}</p>
                    </div>
                  )}
                  
                  <div className="mt-4 rounded-xl border border-white/5 bg-white/5 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="overline text-[#6B7280]">Practice your answer</p>
                      <button 
                        onClick={() => toggleRecording(i)}
                        className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                          recordingId === i 
                            ? "bg-[#EF4444]/20 text-[#EF4444] hover:bg-[#EF4444]/30" 
                            : "bg-[#0066FF]/20 text-[#0066FF] hover:bg-[#0066FF]/30"
                        }`}
                      >
                        {recordingId === i ? (
                          <><Square className="h-3 w-3 fill-current" /> Stop Recording</>
                        ) : (
                          <><Mic className="h-3 w-3" /> Voice Mock Interview</>
                        )}
                      </button>
                    </div>
                    
                    <div className={`min-h-[80px] rounded-lg border border-white/10 p-3 text-sm text-[#F3F4F6] ${
                      recordingId === i ? "bg-[#141414] ring-1 ring-[#EF4444]/50" : "bg-black/20"
                    }`}>
                      {transcripts[i] ? (
                        <p className="whitespace-pre-wrap">{transcripts[i]}</p>
                      ) : (
                        <p className="text-[#6B7280] italic">Click the button above and speak your answer to practice...</p>
                      )}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </div>
  );
}
