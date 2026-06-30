import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { formatApiErrorDetail } from "@/lib/api";

function AuthShell({ title, subtitle, children }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0A0A0A] px-6">
      <div className="pointer-events-none absolute -top-32 left-1/3 h-[420px] w-[420px] rounded-full bg-[#0066FF] opacity-20 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 h-[360px] w-[360px] rounded-full bg-[#8B5CF6] opacity-20 blur-[140px]" />
      <div className="absolute inset-0 bg-grid opacity-30" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0066FF]">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight text-[#F3F4F6]">CareerOS</span>
        </Link>
        <div className="rounded-2xl border border-white/10 glass p-8">
          <h1 className="font-display mb-1 text-2xl font-bold tracking-tight text-[#F3F4F6]">{title}</h1>
          <p className="mb-6 text-sm text-[#9CA3AF]">{subtitle}</p>
          {children}
        </div>
      </motion.div>
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/app");
    } catch (err) {
      setError(formatApiErrorDetail(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to your CareerOS workspace.">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label className="text-[#9CA3AF]" htmlFor="email">Email</Label>
          <Input
            id="email" type="email" required value={email}
            data-testid="login-email-input"
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 border-white/10 bg-white/5 text-[#F3F4F6] focus-visible:ring-[#0066FF]"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <Label className="text-[#9CA3AF]" htmlFor="password">Password</Label>
          <Input
            id="password" type="password" required value={password}
            data-testid="login-password-input"
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 border-white/10 bg-white/5 text-[#F3F4F6] focus-visible:ring-[#0066FF]"
            placeholder="••••••••"
          />
        </div>
        {error && <p data-testid="login-error" className="text-sm text-[#EF4444]">{error}</p>}
        <Button
          type="submit" disabled={loading}
          data-testid="login-submit-btn"
          className="h-11 w-full rounded-full bg-[#0066FF] font-medium text-white hover:bg-[#0052CC]"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-[#9CA3AF]">
        No account?{" "}
        <Link to="/register" data-testid="goto-register-link" className="text-[#0066FF] hover:underline">Create one</Link>
      </p>
    </AuthShell>
  );
}

export { AuthShell };
