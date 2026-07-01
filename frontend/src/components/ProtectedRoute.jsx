import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading || user === null) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0A0A0A]" data-testid="auth-loading">
        <Loader2 className="h-6 w-6 animate-spin text-[#0066FF]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-[#0A0A0A] px-4 text-center" data-testid="auth-error">
        <h2 className="mb-2 text-xl font-bold text-[#EF4444]">Cannot connect to backend</h2>
        <p className="max-w-md text-[#9CA3AF]">
          The automatic guest login failed. If you are using Render's free tier, the backend might be waking up (this takes ~50 seconds). Refresh the page to try again.
          <br /><br />
          If this persists, check that your Vercel <code className="text-white">REACT_APP_BACKEND_URL</code> is set correctly.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-6 rounded-full bg-[#0066FF] px-6 py-2 text-white hover:bg-[#0052CC]"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  return children;
}
