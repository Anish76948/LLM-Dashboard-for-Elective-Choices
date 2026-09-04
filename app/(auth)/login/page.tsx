"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { ModeToggle } from "@/components/mode-toggle";
import { ArrowRight, Lock, Mail, Sparkles, User, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoMode, setDemoMode] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (email.includes("@demo.edu") && password === "demo123") {
          const role = email.includes("admin")
            ? "admin"
            : email.includes("faculty")
            ? "faculty"
            : "student";
          document.cookie = `user_role=${role}; path=/; max-age=86400`;
          document.cookie = `electiveos_user=${email}; path=/; max-age=86400`;
          toast.success(`Logged in as ${email}`);
          router.push(role === "admin" ? "/admin" : role === "faculty" ? "/faculty" : "/dashboard");
          return;
        }
        toast.error(error.message);
        return;
      }

      const { data: profile } = await supabase
        .from("students")
        .select("role")
        .eq("id", data.user?.id)
        .single();

      const role =
        profile?.role ||
        (email.includes("admin")
          ? "admin"
          : email.includes("faculty")
          ? "faculty"
          : "student");
      document.cookie = `user_role=${role}; path=/; max-age=86400`;
      document.cookie = `electiveos_user=${email}; path=/; max-age=86400`;

      toast.success("Welcome back to Elective!");
      router.push(role === "admin" ? "/admin" : role === "faculty" ? "/faculty" : "/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Failed to log in");
    } finally {
      setLoading(false);
    }
  };

  const applyDemoPersona = (demoEmail: string, label: string) => {
    setEmail(demoEmail);
    setPassword("demo123");
    toast.info(`Filled credentials for ${label}`);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-[#eceef1] dark:bg-[#09090b] transition-colors relative">
      {/* Top Bar with Mode Toggle & Demo Switch */}
      <div className="absolute top-6 right-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setDemoMode(!demoMode)}
          className={`h-8 px-3 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 ${
            demoMode
              ? "bg-purple-500/10 border-purple-500/30 text-purple-700 dark:text-purple-300"
              : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Demo Mode: {demoMode ? "ON" : "OFF"}</span>
        </button>
        <ModeToggle />
      </div>

      <div className="w-full max-w-sm space-y-5">
        {/* Minimalist Brand Header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center justify-center w-11 h-11 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-2xl shadow-sm mb-1">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Elective</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Institutional Elective Allocation & Advising Engine</p>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-[#121215] rounded-[26px] border border-zinc-200/90 dark:border-zinc-800 shadow-sm p-7 space-y-5 transition-all">
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Login to your account</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Enter your institutional email & password</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Email Address</label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student1@demo.edu"
                  className="w-full h-9 pl-9 pr-3 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-400 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Password</label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-9 pl-9 pr-3 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-400 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-9 bg-zinc-900 hover:bg-black dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <span>{loading ? "Authenticating..." : "Login"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Conditional Demo Mode Box (Opens only when Demo Mode is toggled ON) */}
          {demoMode && (
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-2 animate-fade-in-up">
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-center">
                Select Demo Persona
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                <button
                  type="button"
                  onClick={() => applyDemoPersona("student1@demo.edu", "Student 1 (Full Prereqs)")}
                  className="py-1.5 px-2 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-lg text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 text-center transition-colors"
                >
                  Student 1
                </button>
                <button
                  type="button"
                  onClick={() => applyDemoPersona("student2@demo.edu", "Student 2 (Lacks ML)")}
                  className="py-1.5 px-2 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-lg text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 text-center transition-colors"
                >
                  Student 2
                </button>
                <button
                  type="button"
                  onClick={() => applyDemoPersona("faculty@demo.edu", "Prof. Vance (Faculty)")}
                  className="py-1.5 px-2 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-lg text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 text-center transition-colors"
                >
                  Faculty
                </button>
                <button
                  type="button"
                  onClick={() => applyDemoPersona("admin@demo.edu", "Academic Admin")}
                  className="py-1.5 px-2 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-lg text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 text-center transition-colors"
                >
                  Admin
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
