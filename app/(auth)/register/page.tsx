"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md bg-white border-slate-200 shadow-sm text-center p-6 space-y-4">
        <div className="inline-flex items-center justify-center p-3 bg-violet-600 text-white rounded-2xl mx-auto">
          <GraduationCap className="h-8 w-8" />
        </div>
        <CardTitle className="text-xl">University Registration</CardTitle>
        <CardDescription>
          Student accounts are pre-provisioned by university academic affairs. Please use your provided demo account.
        </CardDescription>
        <Link href="/login">
          <Button className="w-full bg-violet-600 hover:bg-violet-700 text-white mt-4">
            Go to Demo Sign In
          </Button>
        </Link>
      </Card>
    </div>
  );
}
