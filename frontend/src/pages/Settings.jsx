import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import api, { formatApiErrorDetail } from "@/lib/api";

export default function Settings() {
  const navigate = useNavigate();
  const { user, refresh } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user?.name]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {};
      if (name.trim() && name.trim() !== user?.name) payload.name = name.trim();
      if (newPassword) {
        payload.current_password = currentPassword;
        payload.new_password = newPassword;
      }
      if (!payload.name && !payload.new_password) {
        toast.error("No changes to save");
        return;
      }
      await api.patch("/auth/profile", payload);
      await refresh();
      setCurrentPassword("");
      setNewPassword("");
      toast.success("Profile updated");
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl px-8 py-8" data-testid="settings-page">
      <button
        onClick={() => navigate("/app")}
        className="mb-6 text-sm text-[#9CA3AF] hover:text-white"
        data-testid="settings-back-btn"
      >
        ← Back to dashboard
      </button>
      <p className="overline mb-1 text-[#8B5CF6]">Settings</p>
      <h1 className="font-display mb-8 text-3xl font-bold tracking-tight">Account settings</h1>

      <form onSubmit={handleSave} className="space-y-6 rounded-2xl border border-white/10 bg-[#141414] p-6">
        <div>
          <Label className="text-[#9CA3AF]">Email</Label>
          <Input value={user?.email || ""} disabled className="mt-1.5 border-white/10 bg-white/5" />
        </div>
        <div>
          <Label className="text-[#9CA3AF]">Display name</Label>
          <Input
            data-testid="settings-name-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1.5 border-white/10 bg-white/5"
          />
        </div>
        <div className="border-t border-white/10 pt-6">
          <p className="overline mb-4 text-[#6B7280]">Change password</p>
          <div className="space-y-4">
            <div>
              <Label className="text-[#9CA3AF]">Current password</Label>
              <Input
                data-testid="settings-current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mt-1.5 border-white/10 bg-white/5"
              />
            </div>
            <div>
              <Label className="text-[#9CA3AF]">New password</Label>
              <Input
                data-testid="settings-new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1.5 border-white/10 bg-white/5"
              />
            </div>
          </div>
        </div>
        <Button
          data-testid="settings-save-btn"
          type="submit"
          disabled={saving}
          className="rounded-full bg-[#0066FF] text-white hover:bg-[#0052CC]"
        >
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save changes
        </Button>
      </form>
    </div>
  );
}
