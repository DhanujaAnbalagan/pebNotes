"use client";

import { useState, useEffect, useRef } from "react";
import { User, Moon, Sun, LogOut, Shield, Zap, Info, Sparkles, Key, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { useTheme } from "next-themes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/use-auth-store";
import { logoutAction } from "@/app/actions/auth";
import { toast } from "sonner";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [isSavingKey, setIsSavingKey] = useState(false);
  const [keySaved, setKeySaved] = useState(false);

  useEffect(() => {
    setMounted(true);
    setApiKey(user?.geminiApiKey || "");
  }, [user?.geminiApiKey]);

  const handleLogout = async () => {
    try {
      await logoutAction();
      logout();
      toast.success("Logged out successfully");
    } catch {
      toast.error("Failed to log out");
    }
  };

  const handleSaveApiKey = async () => {
    setIsSavingKey(true);
    try {
      const res = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ geminiApiKey: apiKey.trim() || null }),
      });

      if (res.ok) {
        useAuthStore.getState().setUser({ ...user!, geminiApiKey: apiKey.trim() || null });
        toast.success("API Key saved successfully!");
        setKeySaved(true);
        setTimeout(() => setKeySaved(false), 3000);
      } else {
        toast.error("Failed to save API Key");
      }
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSavingKey(false);
    }
  };

  const handleClearApiKey = async () => {
    setApiKey("");
    setIsSavingKey(true);
    try {
      const res = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ geminiApiKey: null }),
      });
      if (res.ok) {
        useAuthStore.getState().setUser({ ...user!, geminiApiKey: null });
        toast.success("API Key removed. Using system default.");
      } else {
        toast.error("Failed to remove API Key");
      }
    } catch {
      toast.error("An error occurred.");
    } finally {
      setIsSavingKey(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account, appearance, and AI integrations.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Profile Section */}
        <Card className="border-none bg-card/50 shadow-sm rounded-3xl overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Profile Information
            </CardTitle>
            <CardDescription>Your personal details and account info.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center gap-6 p-6 rounded-2xl bg-accent/10 border border-border/50">
              <Avatar className="h-20 w-20 border-2 border-primary/20 shrink-0">
                <AvatarImage src={user?.avatar || `https://avatar.vercel.sh/${user?.email}.png`} />
                <AvatarFallback className="text-2xl font-bold">
                  {user?.name?.substring(0, 2).toUpperCase() || "??"}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1 text-center md:text-left flex-1">
                <h3 className="text-xl font-bold">{user?.name || "User Name"}</h3>
                <p className="text-muted-foreground">{user?.email || "user@example.com"}</p>
                <div className="flex items-center gap-2 mt-2 justify-center md:justify-start">
                  <Badge variant="secondary" className="rounded-lg bg-primary/10 text-primary border-none font-medium">
                    Personal Account
                  </Badge>
                  <Badge variant="secondary" className="rounded-lg bg-emerald-500/10 text-emerald-500 border-none font-medium">
                    Active
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Section */}
        <Card className="border-none bg-card/50 shadow-sm rounded-3xl overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {theme === "dark"
                ? <Moon className="w-5 h-5 text-blue-400" />
                : <Sun className="w-5 h-5 text-orange-400" />
              }
              Appearance
            </CardTitle>
            <CardDescription>Customize how Peblo AI looks on your device.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-2xl bg-accent/10 border border-border/50">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">Switch between light and dark themes.</p>
              </div>
              <Switch
                checked={theme === "dark"}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                className="data-[state=checked]:bg-primary"
              />
            </div>
          </CardContent>
        </Card>

        {/* AI Configuration Section */}
        <Card className="border-none bg-card/50 shadow-sm rounded-3xl overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-500" />
              AI & Integrations
            </CardTitle>
            <CardDescription>Configure your Gemini AI connection for note insights.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-accent/10 border border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="font-medium">Google Gemini AI</p>
                  <p className="text-xs text-muted-foreground">Model: gemini-1.5-flash</p>
                </div>
              </div>
              <Badge
                variant="secondary"
                className={`rounded-lg border-none font-medium ${
                  user?.geminiApiKey
                    ? "bg-purple-500/10 text-purple-500"
                    : "bg-emerald-500/10 text-emerald-500"
                }`}
              >
                {user?.geminiApiKey ? "Custom Key Active" : "System Key Active"}
              </Badge>
            </div>

            {/* API Key Input */}
            <div className="space-y-3">
              <Label htmlFor="api-key" className="text-sm font-medium flex items-center gap-2">
                <Key className="w-4 h-4" />
                Custom Gemini API Key
              </Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="api-key"
                    type={showKey ? "text" : "password"}
                    placeholder="AIzaSy..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="h-11 bg-accent/20 border-transparent focus-visible:bg-accent/40 focus-visible:ring-primary/20 rounded-xl pr-10 font-mono text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <Button
                  onClick={handleSaveApiKey}
                  disabled={isSavingKey || apiKey === (user?.geminiApiKey || "")}
                  className="h-11 px-5 rounded-xl shadow-sm"
                >
                  {keySaved ? (
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Saved
                    </span>
                  ) : isSavingKey ? "Saving..." : "Save Key"}
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-muted-foreground">
                  Your key is saved securely to your profile. Leave empty to use the system default.
                </p>
                {user?.geminiApiKey && (
                  <button
                    onClick={handleClearApiKey}
                    className="text-[11px] text-destructive hover:underline shrink-0 ml-4"
                  >
                    Remove key
                  </button>
                )}
              </div>
            </div>

            {/* Info Box */}
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 text-blue-400">
              <Info className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-blue-400">Get a free API key</p>
                <p className="mt-1 text-blue-400/80">
                  Visit{" "}
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="underline font-bold hover:text-blue-300 transition-colors"
                  >
                    Google AI Studio
                  </a>
                  {" "}→ Create API key → paste it above to unlock AI Insights.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Security Section */}
        <Card className="border-none bg-card/50 shadow-sm rounded-3xl overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-500" />
              Account Security
            </CardTitle>
            <CardDescription>Manage your account access and security preferences.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-between rounded-xl h-12 border-border/50"
              disabled
            >
              Change Password
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground bg-accent/50 px-2 py-0.5 rounded-md">Coming Soon</span>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 rounded-xl h-12 text-destructive hover:bg-destructive/10 hover:text-destructive border border-transparent hover:border-destructive/20 transition-all"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              Sign Out of Account
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
