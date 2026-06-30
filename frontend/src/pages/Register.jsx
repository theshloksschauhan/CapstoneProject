import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { formatApiErrorDetail } from "@/lib/api";
import { AuthShell } from "@/pages/Login";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(name, email, password);
      navigate("/app");
    } catch (err) {
      setError(formatApiErrorDetail(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Create your account" subtitle="Start landing interviews with AI on your side.">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label className="text-[#9CA3AF]" htmlFor="name">Full name</Label>
          <Input
            id="name" required value={name}
            data-testid="register-name-input"
            onChange={(e) => setName(e.target.value)}
            className="mt-1.5 border-white/10 bg-white/5 text-[#F3F4F6] focus-visible:ring-[#0066FF]"
            placeholder="Jane Doe"
          />
        </div>
        <div>
          <Label className="text-[#9CA3AF]" htmlFor="email">Email</Label>
          <Input
            id="email" type="email" required value={email}
            data-testid="register-email-input"
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 border-white/10 bg-white/5 text-[#F3F4F6] focus-visible:ring-[#0066FF]"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <Label className="text-[#9CA3AF]" htmlFor="password">Password</Label>
          <Input
            id="password" type="password" required minLength={6} value={password}
            data-testid="register-password-input"
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 border-white/10 bg-white/5 text-[#F3F4F6] focus-visible:ring-[#0066FF]"
            placeholder="At least 6 characters"
          />
        </div>
        {error && <p data-testid="register-error" className="text-sm text-[#EF4444]">{error}</p>}
        <Button
          type="submit" disabled={loading}
          data-testid="register-submit-btn"
          className="h-11 w-full rounded-full bg-[#0066FF] font-medium text-white hover:bg-[#0052CC]"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-[#9CA3AF]">
        Already have an account?{" "}
        <Link to="/login" data-testid="goto-login-link" className="text-[#0066FF] hover:underline">Sign in</Link>
      </p>
    </AuthShell>
  );
}
