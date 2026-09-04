"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { UserCheck, ShieldAlert, Sparkles, ArrowRight, Lock, Mail } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  // Keep inputs empty by default as requested (no forced prefill)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter your email and password");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Fallback demo authentication handler
        if (email.includes("@demo.edu") && password === "demo123") {
          const role = email.includes("admin") ? "admin" : "student";
          document.cookie = `user_role=${role}; path=/; max-age=86400`;
          document.cookie = `electiveos_user=${email}; path=/; max-age=86400`;
          toast.success(`Signed in as ${email}`);
          router.push(role === "admin" ? "/admin" : "/dashboard");
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

      const role = profile?.role || (email.includes("admin") ? "admin" : "student");
      document.cookie = `user_role=${role}; path=/; max-age=86400`;
      document.cookie = `electiveos_user=${email}; path=/; max-age=86400`;

      toast.success("Welcome back to ElectiveOS!");
      router.push(role === "admin" ? "/admin" : "/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (demoEmail: string, label: string) => {
    setEmail(demoEmail);
    setPassword("demo123");
    toast.info(`Filled credentials for ${label}`);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#eceef1] p-4 antialiased font-sans">
      <div className="w-full max-w-sm space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-11 h-11 bg-zinc-900 text-white rounded-2xl shadow-sm mb-1">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">ElectiveOS</h1>
          <p className="text-xs text-zinc-500">University Elective Decision & Advising Engine</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-[26px] border border-zinc-200/90 shadow-sm p-7 space-y-5">
          <div>
            <h2 className="text-base font-bold text-zinc-900">Sign in to your account</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Enter your institutional credentials below</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700">University Email</label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student1@demo.edu"
                  className="w-full h-9 pl-9 pr-3 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-400 placeholder:text-zinc-400 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700">Password</label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-9 pl-9 pr-3 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-400 placeholder:text-zinc-400 transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-9 bg-zinc-900 hover:bg-black text-white text-xs font-semibold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <span>{loading ? "Authenticating..." : "Sign In"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Separate Demo Quick Fill Row */}
          <div className="pt-4 border-t border-zinc-100 space-y-2">
            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-center">
              Or Select a Demo Persona
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setDemoCredentials("student1@demo.edu", "Student 1")}
                className="py-1.5 px-2 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg text-[11px] font-semibold text-zinc-700 text-center transition-colors"
              >
                Student 1
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials("student2@demo.edu", "Student 2")}
                className="py-1.5 px-2 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg text-[11px] font-semibold text-zinc-700 text-center transition-colors"
              >
                Student 2
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials("admin@demo.edu", "Dean Admin")}
                className="py-1.5 px-2 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg text-[11px] font-semibold text-zinc-700 text-center transition-colors"
              >
                Dean
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
