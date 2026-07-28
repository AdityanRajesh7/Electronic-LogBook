import * as React from "react";
import { CheckCircle2, Clock, GraduationCap, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatLogbookDate, todayForInput } from "@/lib/logbook-config";

type AcademicLog = {
  number: number;
  date: string;
  type: string;
  presentationType: string;
  topic: string;
  faculty: string;
  status: "pending" | "verified";
};

const logsSeed: AcademicLog[] = [
  { number: 1081, date: "2026-07-22", type: "Journal Club", presentationType: "—", topic: "High-Flow Nasal Cannula versus CPAP in Pediatric Bronchiolitis", faculty: "Prof. Dr. Mohammad MTP", status: "verified" },
  { number: 1072, date: "2026-07-16", type: "Symposia", presentationType: "Paper", topic: "Approach to Neonatal Cholestasis and Biliary Atresia", faculty: "Dr. Radhamani KV", status: "verified" },
  { number: 1065, date: "2026-07-10", type: "Conference Presentation", presentationType: "Case presentation", topic: "Nephrotic Syndrome with Anasarca in a Four-Year-Old", faculty: "Dr. Anilkumar A", status: "pending" },
  { number: 1059, date: "2026-06-28", type: "Conference Attended", presentationType: "—", topic: "Kerala Pediatric Pulmonology Update 2026", faculty: "Prof. Dr. Mohammad MTP", status: "verified" },
  { number: 1054, date: "2026-06-20", type: "Mortality Meeting", presentationType: "Case presentation", topic: "Refractory Septic Shock: Systems and Clinical Review", faculty: "Dr. Radhamani KV", status: "verified" },
];

const conferenceTypes = new Set(["Conference Presentation", "Symposia"]);

export function AcademicLogsPage() {
  const [open, setOpen] = React.useState(false);
  const [logs, setLogs] = React.useState(logsSeed);
  const [form, setForm] = React.useState({
    date: todayForInput(),
    type: "Journal Club",
    presentationType: "Paper",
    topic: "",
    faculty: "Prof. Dr. Mohammad MTP",
  });

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const next: AcademicLog = {
      number: Math.max(...logs.map((item) => item.number)) + 1,
      ...form,
      presentationType: conferenceTypes.has(form.type) ? form.presentationType : "—",
      status: "pending",
    };
    setLogs([next, ...logs]);
    setOpen(false);
    toast.success(`Academic activity number ${next.number} sent`);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="page-eyebrow">Academic record</p>
          <h2 className="page-title mt-1">Academic activities</h2>
          <p className="mt-2 text-sm text-slate-500">Presentations, journal clubs, seminars, symposia, mortality meetings and conferences.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><PlusCircle className="h-4 w-4" /> Log academic activity</Button></DialogTrigger>
          <DialogContent className="rounded-2xl bg-white sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>New academic activity</DialogTitle>
              <DialogDescription>Add attendance or presentation details for guide verification.</DialogDescription>
            </DialogHeader>
            <form onSubmit={submit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Date"><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
                <Field label="Activity category">
                  <Select value={form.type} onValueChange={(value) => setForm({ ...form, type: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Journal Club">Journal club</SelectItem>
                      <SelectItem value="Seminar">Seminar</SelectItem>
                      <SelectItem value="Symposia">Symposia</SelectItem>
                      <SelectItem value="Bedside Case Presentation">Bedside case presentation</SelectItem>
                      <SelectItem value="Mortality Meeting">Mortality meeting</SelectItem>
                      <SelectItem value="Conference Attended">Conference attended</SelectItem>
                      <SelectItem value="Conference Presentation">Conference presentation</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              {conferenceTypes.has(form.type) && (
                <Field label="Presentation format">
                  <Select value={form.presentationType} onValueChange={(value) => setForm({ ...form, presentationType: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Poster">Poster</SelectItem>
                      <SelectItem value="Paper">Paper</SelectItem>
                      <SelectItem value="Case presentation">Case presentation</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              )}
              <Field label={form.type === "Conference Attended" ? "Conference name" : "Topic / title"}>
                <Input value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} required />
              </Field>
              <Field label="HOD / Guide">
                <Select value={form.faculty} onValueChange={(value) => setForm({ ...form, faculty: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Prof. Dr. Mohammad MTP">Prof. Dr. Mohammad MTP</SelectItem>
                    <SelectItem value="Dr. Radhamani KV">Dr. Radhamani KV</SelectItem>
                    <SelectItem value="Dr. Anilkumar A">Dr. Anilkumar A</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <DialogFooter><Button type="button" variant="outline" onClick={() => setOpen(false)}>Save draft</Button><Button type="submit">Send to guide</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Summary label="Conferences attended" value={logs.filter((log) => log.type === "Conference Attended").length} />
        <Summary label="Conference presentations" value={logs.filter((log) => log.type === "Conference Presentation").length} />
        <Summary label="All academic activities" value={logs.length} />
      </div>

      <Card>
        <CardHeader className="border-b border-teal-100"><CardTitle className="flex items-center gap-2 text-lg"><GraduationCap className="h-5 w-5 text-teal-600" /> Academic activity record</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Number</TableHead><TableHead>Date</TableHead><TableHead>Activity</TableHead><TableHead>Presentation</TableHead><TableHead>Topic / conference</TableHead><TableHead>HOD / Guide</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.number}>
                  <TableCell className="font-bold">{log.number}</TableCell>
                  <TableCell>{formatLogbookDate(log.date)}</TableCell>
                  <TableCell><Badge variant="outline" className="border-teal-100 bg-teal-50 text-teal-800">{log.type}</Badge></TableCell>
                  <TableCell>{log.presentationType}</TableCell>
                  <TableCell className="max-w-sm font-semibold">{log.topic}</TableCell>
                  <TableCell>{log.faculty}</TableCell>
                  <TableCell>{log.status === "verified" ? <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700"><CheckCircle2 className="mr-1 h-3 w-3" /> Verified</Badge> : <Badge className="border-amber-200 bg-amber-50 text-amber-700"><Clock className="mr-1 h-3 w-3" /> Pending</Badge>}</TableCell>
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

function Summary({ label, value }: { label: string; value: number }) {
  return <Card><CardContent className="p-5"><p className="text-3xl font-bold text-teal-700">{value}</p><p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}</p></CardContent></Card>;
}
