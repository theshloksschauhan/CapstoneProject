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

  if (!user) return <Navigate to="/login" replace />;

  return children;
}
