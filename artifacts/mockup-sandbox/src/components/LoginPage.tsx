import * as React from "react";
import { BookOpenCheck, CheckCircle2, KeyRound, ShieldCheck, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginPage({ onSignIn }: { onSignIn: () => void }) {
  const [registrationNumber, setRegistrationNumber] = React.useState("PG2024-PAED-014");
  const [password, setPassword] = React.useState("Demo@2026");

  const signIn = (event: React.FormEvent) => {
    event.preventDefault();
    if (registrationNumber && password) onSignIn();
  };

  return (
    <div className="medical-grid flex min-h-screen items-center justify-center p-4 md:p-8">
      <div className="glass-panel grid w-full max-w-6xl overflow-hidden rounded-[30px] lg:grid-cols-[1.08fr_.92fr]">
        <section className="relative overflow-hidden bg-gradient-to-br from-teal-700 via-teal-600 to-cyan-500 p-8 text-white md:p-12">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border-[42px] border-white/10" />
          <div className="absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-cyan-300/15 blur-2xl" />
          <div className="relative">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/16 shadow-lg ring-1 ring-white/25">
              <BookOpenCheck className="h-7 w-7" />
            </div>
            <p className="mt-12 text-xs font-bold uppercase tracking-[0.2em] text-teal-50">Department of Pediatrics</p>
            <h1 className="mt-3 max-w-xl text-4xl font-bold leading-[1.05] md:text-5xl">
              A complete postgraduate training record, in one place.
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-6 text-teal-50/85">
              Record clinical exposure, procedures, academic work, assessments, thesis progress and leave in an MCI-aligned electronic logbook.
            </p>

            <div className="mt-12 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {[
                ["1", "HOD creates the student account"],
                ["2", "Temporary password is issued"],
                ["3", "Student signs in and resets it"],
              ].map(([number, text]) => (
                <div key={number} className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-xs font-bold text-teal-700">{number}</span>
                  <p className="mt-3 text-xs font-semibold leading-5 text-white">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white/80 p-8 md:p-12">
          <div className="mx-auto max-w-sm">
            <p className="page-eyebrow">KUHS secure access</p>
            <h2 className="mt-2 text-4xl font-bold text-slate-900">Welcome back</h2>
            <p className="mt-2 text-sm text-slate-500">Sign in with the credentials issued by your department HOD.</p>

            <form onSubmit={signIn} className="mt-9 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="registration">Registration number / KUHS ID</Label>
                <div className="relative">
                  <UserPlus className="absolute left-3 top-3 h-4 w-4 text-teal-600" />
                  <Input
                    id="registration"
                    value={registrationNumber}
                    onChange={(event) => setRegistrationNumber(event.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3 h-4 w-4 text-teal-600" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="h-11 w-full">
                <ShieldCheck className="h-4 w-4" /> Sign in to E-Logbook
              </Button>
            </form>

            <div className="mt-6 rounded-2xl border border-teal-100 bg-teal-50/75 p-4">
              <p className="flex items-center gap-2 text-xs font-bold text-teal-900">
                <CheckCircle2 className="h-4 w-4 text-teal-600" /> Demo account ready
              </p>
              <p className="mt-1 text-[11px] leading-5 text-teal-800/75">
                The sample registration number and password are pre-filled so the prototype can be explored immediately.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
