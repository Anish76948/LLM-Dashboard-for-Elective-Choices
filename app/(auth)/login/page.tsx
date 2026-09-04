"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { GraduationCap, ShieldAlert, Sparkles, UserCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // For hackathon ease: If Supabase auth errors or user is demo, fallback session cookie
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

      // Check role
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

  const quickFill = (userEmail: string, role: string) => {
    setEmail(userEmail);
    setPassword("demo123");
    toast.info(`Filled credentials for ${role}`);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-violet-600 text-white rounded-2xl shadow-lg shadow-violet-200">
            <GraduationCap className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">ElectiveOS</h1>
          <p className="text-sm text-slate-500">University Elective Decision & Advising Engine</p>
        </div>

        <Card className="border border-slate-200/80 shadow-sm bg-white">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl">Sign in to your portal</CardTitle>
            <CardDescription>Enter your university email to access choices</CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">University Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="student1@demo.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 text-white" disabled={loading}>
                {loading ? "Authenticating..." : "Sign In"}
              </Button>
            </CardContent>
          </form>

          <CardFooter className="flex flex-col space-y-3 pt-2 border-t border-slate-100">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 text-center w-full">
              Demo Quick-Fill
            </div>
            <div className="grid grid-cols-3 gap-2 w-full">
              <Button
                variant="outline"
                size="sm"
                className="text-xs border-violet-200 hover:bg-violet-50 text-violet-700"
                onClick={() => quickFill("student1@demo.edu", "Student 1 (Full Prereqs)")}
              >
                <UserCheck className="w-3.5 h-3.5 mr-1" />
                Student 1
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs border-amber-200 hover:bg-amber-50 text-amber-700"
                onClick={() => quickFill("student2@demo.edu", "Student 2 (No ML Prereq)")}
              >
                <ShieldAlert className="w-3.5 h-3.5 mr-1" />
                Student 2
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs border-slate-200 hover:bg-slate-100 text-slate-800"
                onClick={() => quickFill("admin@demo.edu", "Admin Dean")}
              >
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                Admin
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
