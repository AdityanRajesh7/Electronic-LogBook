import * as React from "react";
import { AlertCircle, CheckCircle2, Clock, PlusCircle, Stethoscope } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatLogbookDate, PROCEDURE_GROUPS, PROCEDURE_REQUIREMENTS, REQUIRED_PROCEDURE_COUNT, todayForInput, type ProcedureGroup } from "@/lib/logbook-config";

type ProcedureLog = {
  number: number;
  date: string;
  group: ProcedureGroup;
  patientUhid: string;
  procedureName: string;
  age: string;
  experience: string;
  verifiedCompetency: string;
  status: "pending" | "verified" | "revision";
};

const seeded: ProcedureLog[] = [
  { number: 11, date: "2026-07-24", group: "emergency", patientUhid: "UHID-2026-003944", procedureName: "Endotracheal Intubation", age: "7 years", experience: "Performed under supervision", verifiedCompetency: "Performed under supervision", status: "verified" },
  { number: 10, date: "2026-07-20", group: "invasive", patientUhid: "UHID-2026-003771", procedureName: "Lumbar Puncture", age: "4 months", experience: "Assisted", verifiedCompetency: "Assisted", status: "revision" },
  { number: 9, date: "2026-07-14", group: "emergency", patientUhid: "UHID-2026-003502", procedureName: "ICD Insertion", age: "8 years", experience: "Observed / procedure seen", verifiedCompetency: "Observed", status: "verified" },
  { number: 8, date: "2026-07-08", group: "invasive", patientUhid: "UHID-2026-003321", procedureName: "Bone Marrow Aspiration", age: "5 years", experience: "Assisted", verifiedCompetency: "Assisted", status: "verified" },
  { number: 7, date: "2026-07-02", group: "invasive", patientUhid: "UHID-2026-003140", procedureName: "Central Venous Line Insertion", age: "5 years", experience: "Performed under supervision", verifiedCompetency: "Performed under supervision", status: "verified" },
  { number: 6, date: "2026-06-28", group: "invasive", patientUhid: "UHID-2026-003008", procedureName: "Peritoneal Dialysis", age: "3 days", experience: "Observed / procedure seen", verifiedCompetency: "Observed", status: "verified" },
  { number: 5, date: "2026-06-20", group: "invasive", patientUhid: "UHID-2026-002844", procedureName: "Umbilical Venous Catheterisation", age: "1 hour", experience: "Performed under supervision", verifiedCompetency: "Performed under supervision", status: "verified" },
  { number: 4, date: "2026-06-12", group: "emergency", patientUhid: "UHID-2026-002605", procedureName: "Arterial Blood Gas", age: "8 years", experience: "Assisted", verifiedCompetency: "Assisted", status: "verified" },
  { number: 3, date: "2026-06-04", group: "emergency", patientUhid: "UHID-2026-002422", procedureName: "Mechanical Ventilation Setup", age: "1 year", experience: "Performed under supervision", verifiedCompetency: "Performed under supervision", status: "verified" },
  { number: 2, date: "2026-05-27", group: "emergency", patientUhid: "UHID-2026-002231", procedureName: "CPAP / HFNC", age: "6 months", experience: "Observed / procedure seen", verifiedCompetency: "Observed", status: "verified" },
  { number: 1, date: "2026-05-18", group: "emergency", patientUhid: "UHID-2026-001984", procedureName: "Endotracheal Intubation", age: "2 years", experience: "Performed under supervision", verifiedCompetency: "Performed under supervision", status: "verified" },
];

const groupNames: Record<ProcedureGroup, string> = {
  emergency: "Emergency procedures",
  invasive: "Invasive procedures",
};

export function ProcedureLogsPage() {
  const [open, setOpen] = React.useState(false);
  const [logs, setLogs] = React.useState(seeded);
  const [form, setForm] = React.useState({
    date: todayForInput(),
    group: "emergency" as ProcedureGroup,
    procedureName: "",
    patientUhid: "",
    age: "",
    experience: "Observed / procedure seen",
  });
  const loggedCounts = React.useMemo(
    () => Object.fromEntries(PROCEDURE_REQUIREMENTS.map((requirement) => [
      requirement.name,
      logs.filter((log) => log.procedureName === requirement.name).length,
    ])),
    [logs],
  );

  const setGroup = (group: ProcedureGroup) => setForm({ ...form, group, procedureName: "" });

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const next: ProcedureLog = {
      number: Math.max(...logs.map((log) => log.number)) + 1,
      ...form,
      verifiedCompetency: "Pending professor verification",
      status: "pending",
    };
    setLogs([next, ...logs]);
    setOpen(false);
    toast.success(`Procedure number ${next.number} sent to professor`);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="page-eyebrow">Procedures seen and performed</p>
          <h2 className="page-title mt-1">Procedure log</h2>
          <p className="mt-2 text-sm text-slate-500">Emergency and invasive procedure exposure, with competency verified only by the reviewing professor.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><PlusCircle className="h-4 w-4" /> Log procedure</Button></DialogTrigger>
          <DialogContent className="rounded-2xl bg-white sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>New procedure entry</DialogTitle>
              <DialogDescription>Select the required procedure and record the level of exposure.</DialogDescription>
            </DialogHeader>
            <form onSubmit={submit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Date"><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required /></Field>
                <Field label="Procedure group">
                  <Select value={form.group} onValueChange={(value: ProcedureGroup) => setGroup(value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="emergency">Emergency procedures</SelectItem><SelectItem value="invasive">Invasive procedures</SelectItem></SelectContent>
                  </Select>
                </Field>
              </div>
              <Field label="Procedure">
                <Select value={form.procedureName} onValueChange={(value) => setForm({ ...form, procedureName: value })}>
                  <SelectTrigger><SelectValue placeholder="Select a required procedure" /></SelectTrigger>
                  <SelectContent>{PROCEDURE_GROUPS[form.group].map((procedure) => <SelectItem key={procedure} value={procedure}>{procedure}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Patient UHID"><Input value={form.patientUhid} onChange={(e) => setForm({ ...form, patientUhid: e.target.value })} required /></Field>
                <Field label="Age"><Input value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} placeholder="e.g. 4 months" required /></Field>
              </div>
              <Field label="Procedure experience">
                <Select value={form.experience} onValueChange={(value) => setForm({ ...form, experience: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Observed / procedure seen">Observed / procedure seen</SelectItem>
                    <SelectItem value="Assisted">Assisted</SelectItem>
                    <SelectItem value="Performed under supervision">Performed under supervision</SelectItem>
                    <SelectItem value="Performed independently">Performed independently</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <p className="rounded-xl border border-teal-100 bg-teal-50 p-3 text-[11px] leading-5 text-teal-800">
                Verified competency is not self-selected. It is assigned by a professor during procedure review.
              </p>
              <DialogFooter><Button type="button" variant="outline" onClick={() => setOpen(false)}>Save draft</Button><Button type="submit">Send to professor</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {(Object.keys(PROCEDURE_GROUPS) as ProcedureGroup[]).map((group) => {
          const completed = logs.filter((log) => log.group === group).length;
          return (
            <Card key={group} className={group === "emergency" ? "border-cyan-100" : "border-teal-100"}>
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{groupNames[group]}</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{completed} logged</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-700"><Stethoscope className="h-5 w-5" /></div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
        <AlertCircle className="h-5 w-5 text-amber-700" />
        <p className="text-xs text-amber-900"><strong>{logs.length}/{REQUIRED_PROCEDURE_COUNT}</strong> required procedures logged. Continue adding procedures from the departmental list.</p>
      </div>

      <Card>
        <CardHeader className="border-b border-teal-100">
          <CardTitle className="text-lg">Number of procedures required</CardTitle>
          <p className="text-xs text-slate-500">The total is calculated from every required emergency and invasive procedure.</p>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow><TableHead>Procedure</TableHead><TableHead>Group</TableHead><TableHead>Logged</TableHead><TableHead>Required</TableHead><TableHead>Remaining</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {PROCEDURE_REQUIREMENTS.map((requirement) => {
                const logged = loggedCounts[requirement.name] ?? 0;
                return (
                  <TableRow key={requirement.name}>
                    <TableCell className="font-semibold">{requirement.name}</TableCell>
                    <TableCell><Badge variant="outline" className="border-teal-100 bg-teal-50 text-teal-800">{groupNames[requirement.group]}</Badge></TableCell>
                    <TableCell>{logged}</TableCell>
                    <TableCell className="font-bold text-teal-800">{requirement.required}</TableCell>
                    <TableCell>{Math.max(requirement.required - logged, 0)}</TableCell>
                  </TableRow>
                );
              })}
              <TableRow className="bg-teal-50/60">
                <TableCell className="font-bold" colSpan={3}>Combined target</TableCell>
                <TableCell className="font-bold text-teal-800">{REQUIRED_PROCEDURE_COUNT}</TableCell>
                <TableCell className="font-bold">{Math.max(REQUIRED_PROCEDURE_COUNT - logs.length, 0)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b border-teal-100"><CardTitle className="text-lg">Procedure entries sent</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Number</TableHead><TableHead>Date</TableHead><TableHead>Group</TableHead><TableHead>Procedure</TableHead><TableHead>Patient UHID</TableHead><TableHead>Age</TableHead><TableHead>Experience</TableHead><TableHead>Verified competency</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.number}>
                  <TableCell className="font-bold">{log.number}</TableCell>
                  <TableCell>{formatLogbookDate(log.date)}</TableCell>
                  <TableCell><Badge variant="outline" className="border-teal-100 bg-teal-50 text-teal-800">{groupNames[log.group]}</Badge></TableCell>
                  <TableCell className="font-semibold">{log.procedureName}</TableCell>
                  <TableCell className="font-semibold text-teal-800">{log.patientUhid}</TableCell>
                  <TableCell>{log.age}</TableCell>
                  <TableCell className="text-xs">{log.experience}</TableCell>
                  <TableCell className="text-xs">{log.verifiedCompetency}</TableCell>
                  <TableCell>{statusBadge(log.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}</div>;
}

function statusBadge(status: ProcedureLog["status"]) {
  if (status === "verified") return <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700"><CheckCircle2 className="mr-1 h-3 w-3" /> Verified</Badge>;
  if (status === "revision") return <Badge className="border-rose-200 bg-rose-50 text-rose-700"><AlertCircle className="mr-1 h-3 w-3" /> Revision</Badge>;
  return <Badge className="border-amber-200 bg-amber-50 text-amber-700"><Clock className="mr-1 h-3 w-3" /> Pending</Badge>;
}
