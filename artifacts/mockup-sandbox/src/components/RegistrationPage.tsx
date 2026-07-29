import * as React from "react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BookOpenCheck,
  CalendarDays,
  CreditCard,
  IndianRupee,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DEPARTMENTS, expectedCompletionDate, formatLogbookDate, todayForInput } from "@/lib/logbook-config";

export function RegistrationPage({
  onBack,
  onRegistered,
}: {
  onBack: () => void;
  onRegistered: () => void;
}) {
  const [step, setStep] = React.useState<1 | 2>(1);
  const [submitting, setSubmitting] = React.useState(false);
  const [form, setForm] = React.useState({
    fullName: "",
    email: "",
    department: "Pediatrics",
    registrationNumber: "",
    joiningDate: todayForInput(),
    password: "",
    confirmPassword: "",
    paymentMethod: "UPI",
  });

  const completionDate = expectedCompletionDate(form.joiningDate);
  const joiningYear = form.joiningDate ? new Date(`${form.joiningDate}T00:00:00`).getFullYear() : "";
  const passwordsMatch = Boolean(form.password) && form.password === form.confirmPassword;

  const continueToPayment = (event: React.FormEvent) => {
    event.preventDefault();
    if (passwordsMatch) setStep(2);
  };

  const completeRegistration = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch("/api/student/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Registration could not be completed.");
      toast.success("Payment completed and registration submitted", {
        description: `Reference ${result.student.paymentReference}. HOD verification is pending.`,
      });
      onRegistered();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Registration could not be completed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="medical-grid min-h-screen p-4 md:p-8">
      <div className="glass-panel mx-auto max-w-5xl overflow-hidden rounded-[30px]">
        <header className="flex items-center justify-between border-b border-white/80 bg-white/65 px-5 py-4 md:px-8">
          <button onClick={onBack} className="flex items-center gap-2 text-xs font-bold text-teal-800">
            <ArrowLeft className="h-4 w-4" /> Back to sign in
          </button>
          <div className="flex items-center gap-2 text-teal-800">
            <BookOpenCheck className="h-5 w-5" />
            <span className="text-sm font-bold">Student self-registration</span>
          </div>
        </header>

        <div className="grid lg:grid-cols-[.72fr_1.28fr]">
          <aside className="bg-gradient-to-br from-teal-700 to-cyan-600 p-7 text-white md:p-9">
            <p className="text-[10px] font-bold uppercase tracking-[.2em] text-teal-100">Registration progress</p>
            <h1 className="mt-3 text-3xl font-bold">Create your E-Logbook account</h1>
            <p className="mt-3 text-xs leading-5 text-teal-50/85">
              Register using the official university registration number, exact joining date and department.
            </p>
            <div className="mt-8 space-y-3">
              <Step number="1" title="Student & course details" active={step === 1} complete={step === 2} />
              <Step number="2" title="Registration payment" active={step === 2} complete={false} />
            </div>
            <div className="mt-8 rounded-2xl border border-white/15 bg-white/10 p-4">
              <p className="flex items-center gap-2 text-xs font-bold"><CalendarDays className="h-4 w-4" /> Course duration check</p>
              <p className="mt-2 text-[11px] leading-5 text-teal-50">
                The system calculates the expected completion date from the exact day, month and year of joining.
              </p>
            </div>
          </aside>

          <main className="bg-white/82 p-6 md:p-9">
            {step === 1 ? (
              <form onSubmit={continueToPayment} className="space-y-5">
                <div>
                  <p className="page-eyebrow">Step 1 of 2</p>
                  <h2 className="mt-1 text-3xl font-bold">Student details</h2>
                  <p className="mt-2 text-sm text-slate-500">All fields must match the official admission record.</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Full name" htmlFor="registration-full-name"><Input id="registration-full-name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required /></Field>
                  <Field label="Email address" htmlFor="registration-email"><Input id="registration-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></Field>
                  <Field label="Department" htmlFor="registration-department">
                    <Select value={form.department} onValueChange={(department) => setForm({ ...form, department })}>
                      <SelectTrigger id="registration-department"><SelectValue /></SelectTrigger>
                      <SelectContent>{DEPARTMENTS.map((department) => <SelectItem key={department} value={department}>{department}</SelectItem>)}</SelectContent>
                    </Select>
                  </Field>
                  <Field label="University registration number" htmlFor="registration-number"><Input id="registration-number" value={form.registrationNumber} onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })} placeholder="e.g. PG2024-PAED-014" required /></Field>
                  <Field label="Exact joining date" htmlFor="registration-joining-date">
                    <Input id="registration-joining-date" type="date" value={form.joiningDate} onChange={(e) => setForm({ ...form, joiningDate: e.target.value })} required />
                    <p className="text-[10px] text-slate-500">Day, month and year are required.</p>
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Summary label="Joining year" value={String(joiningYear)} />
                    <Summary label="Expected completion" value={completionDate ? formatLogbookDate(completionDate) : "—"} />
                  </div>
                  <Field label="Create password" htmlFor="registration-password"><Input id="registration-password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} minLength={8} required /></Field>
                  <Field label="Confirm password" htmlFor="registration-confirm-password">
                    <Input id="registration-confirm-password" type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} minLength={8} required />
                    {form.confirmPassword && !passwordsMatch && <p className="text-[10px] text-rose-600">Passwords do not match.</p>}
                  </Field>
                </div>
                <Button type="submit" disabled={!passwordsMatch} className="w-full sm:w-auto">Continue to payment <ArrowRight className="h-4 w-4" /></Button>
              </form>
            ) : (
              <form onSubmit={completeRegistration} className="space-y-6">
                <div>
                  <p className="page-eyebrow">Step 2 of 2</p>
                  <h2 className="mt-1 text-3xl font-bold">Registration payment</h2>
                  <p className="mt-2 text-sm text-slate-500">Complete payment to activate the student account.</p>
                </div>
                <Card className="border-teal-100 bg-teal-50/60">
                  <CardContent className="grid gap-4 p-5 sm:grid-cols-3">
                    <Summary label="Registration number" value={form.registrationNumber} />
                    <Summary label="Department" value={form.department} />
                    <Summary label="Course ends" value={formatLogbookDate(completionDate)} />
                  </CardContent>
                </Card>
                <div className="rounded-2xl border border-teal-100 bg-white p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-900">E-Logbook registration fee</p>
                      <p className="mt-1 text-xs text-slate-500">One-time account activation payment</p>
                    </div>
                    <p className="flex items-center text-2xl font-bold text-teal-700"><IndianRupee className="h-5 w-5" />1,500</p>
                  </div>
                  <div className="mt-5 space-y-2">
                    <Label htmlFor="registration-payment-method">Payment method</Label>
                    <Select value={form.paymentMethod} onValueChange={(paymentMethod) => setForm({ ...form, paymentMethod })}>
                      <SelectTrigger id="registration-payment-method"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UPI">UPI</SelectItem>
                        <SelectItem value="Card">Debit / Credit Card</SelectItem>
                        <SelectItem value="Net Banking">Net Banking</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="mt-4 flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-[11px] text-slate-600">
                    <ShieldCheck className="h-4 w-4 text-teal-600" /> Payment status and transaction reference will be saved with the registration.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button type="button" variant="outline" onClick={() => setStep(1)}><ArrowLeft className="h-4 w-4" /> Edit details</Button>
                  <Button type="submit" disabled={submitting}><CreditCard className="h-4 w-4" /> {submitting ? "Processing payment…" : "Pay ₹1,500 & register"}</Button>
                </div>
              </form>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label htmlFor={htmlFor}>{label}</Label>{children}</div>;
}

function Summary({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-teal-100 bg-white/80 p-3"><p className="text-[9px] font-bold uppercase tracking-wider text-teal-700">{label}</p><p className="mt-1 truncate text-xs font-bold text-slate-900">{value || "—"}</p></div>;
}

function Step({ number, title, active, complete }: { number: string; title: string; active: boolean; complete: boolean }) {
  return (
    <div className={`flex items-center gap-3 rounded-2xl border p-3 ${active ? "border-white/35 bg-white/15" : "border-white/10 bg-white/5"}`}>
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-xs font-bold text-teal-700">
        {complete ? <BadgeCheck className="h-4 w-4" /> : number}
      </span>
      <p className="text-xs font-bold">{title}</p>
    </div>
  );
}
