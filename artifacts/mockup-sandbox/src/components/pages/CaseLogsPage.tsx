import * as React from "react";
import { AlertCircle, CheckCircle2, Clock, Eye, FileText, PlusCircle, Search } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { formatLogbookDate, todayForInput } from "@/lib/logbook-config";

type CaseLog = {
  number: number;
  date: string;
  patientUhid: string;
  age: string;
  gender: string;
  chiefComplaints: string;
  history: string;
  examination: string;
  investigations: string;
  diagnosis: string;
  differentialDiagnosis: string;
  management: string;
  outcome: string;
  learningPoints: string;
  status: "pending" | "verified" | "revision";
  remarks: string;
};

const caseSeed: CaseLog[] = [
  {
    number: 3,
    date: "2026-07-26",
    patientUhid: "UHID-2026-004281",
    age: "7 years",
    gender: "Male",
    chiefComplaints: "Breathlessness and wheeze for 8 hours; nocturnal cough for 3 days.",
    history: "Known asthma for 2 years with two prior admissions. Missed controller medication for one week. No fever, choking episode or drug allergy.",
    examination: "Alert but anxious; RR 42/min, HR 132/min, SpO₂ 89% on room air. Intercostal retractions, reduced bilateral air entry and diffuse expiratory wheeze.",
    investigations: "PEFR 35% of predicted; ABG: pH 7.34, pCO₂ 43 mmHg. Chest radiograph showed hyperinflation without focal infiltrate.",
    diagnosis: "Acute Severe Asthma Exacerbation",
    differentialDiagnosis: "Foreign-body aspiration; bronchopneumonia; anaphylaxis.",
    management: "Oxygen, back-to-back salbutamol–ipratropium nebulisation, IV hydrocortisone, IV magnesium sulphate and continuous cardiorespiratory monitoring.",
    outcome: "SpO₂ improved to 97% and respiratory distress settled over 6 hours. Shifted to ward on inhaled bronchodilator and controller therapy.",
    learningPoints: "Applied severity classification, documented response after each bronchodilator cycle and counselled family on spacer technique and an asthma action plan.",
    status: "pending",
    remarks: "Awaiting Dr. Mohammed review.",
  },
  {
    number: 2,
    date: "2026-07-23",
    patientUhid: "UHID-2026-004097",
    age: "3 years",
    gender: "Female",
    chiefComplaints: "High fever for 5 days, abdominal pain and reduced urine output.",
    history: "No bleeding manifestations. Oral intake reduced. No previous major illness.",
    examination: "Cold extremities, delayed capillary refill, narrow pulse pressure and tender hepatomegaly.",
    investigations: "Rising hematocrit, platelet count 42,000/mm³ and positive dengue NS1 antigen.",
    diagnosis: "Severe Dengue with Plasma Leakage",
    differentialDiagnosis: "Septic shock; enteric fever.",
    management: "Judicious IV crystalloid resuscitation with serial hematocrit, urine-output and perfusion monitoring.",
    outcome: "Hemodynamically stable after 24 hours; fluids tapered without overload.",
    learningPoints: "Used dynamic clinical endpoints to guide fluids and recognised the critical phase early.",
    status: "verified",
    remarks: "Clear fluid-balance documentation and monitoring plan.",
  },
  {
    number: 1,
    date: "2026-07-19",
    patientUhid: "UHID-2026-003812",
    age: "10 months",
    gender: "Male",
    chiefComplaints: "Loose stools and vomiting for 2 days.",
    history: "Eight watery stools, three episodes of vomiting, no blood in stool.",
    examination: "Irritable, thirsty, sunken eyes and reduced skin turgor.",
    investigations: "Serum electrolytes within normal limits.",
    diagnosis: "Acute Gastroenteritis with Some Dehydration",
    differentialDiagnosis: "Urinary tract infection; surgical abdomen.",
    management: "ORS Plan B, zinc supplementation and continued breastfeeding.",
    outcome: "Hydration restored and discharged with danger-sign counselling.",
    learningPoints: "Classified dehydration clinically and demonstrated ORS preparation to caregiver.",
    status: "verified",
    remarks: "Appropriate dehydration assessment.",
  },
];

const emptyForm = {
  date: todayForInput(),
  patientUhid: "",
  age: "",
  gender: "Male",
  chiefComplaints: "",
  history: "",
  examination: "",
  investigations: "",
  diagnosis: "",
  differentialDiagnosis: "",
  management: "",
  outcome: "",
  learningPoints: "",
};

export function CaseLogsPage() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedLog, setSelectedLog] = React.useState<CaseLog | null>(null);
  const [caseLogs, setCaseLogs] = React.useState(caseSeed);
  const [form, setForm] = React.useState(emptyForm);

  const handleAddCase = (event: React.FormEvent) => {
    event.preventDefault();
    const next: CaseLog = {
      number: Math.max(...caseLogs.map((item) => item.number)) + 1,
      ...form,
      status: "pending",
      remarks: "Submitted for professor review.",
    };
    setCaseLogs([next, ...caseLogs]);
    setForm({ ...emptyForm, date: todayForInput() });
    setIsModalOpen(false);
    toast.success(`Case number ${next.number} submitted`);
  };

  const search = searchTerm.toLowerCase();
  const filteredLogs = caseLogs.filter((log) =>
    [log.number, log.diagnosis, log.patientUhid, log.chiefComplaints]
      .some((value) => String(value).toLowerCase().includes(search)),
  );

  const setField = (field: keyof typeof form, value: string) => setForm({ ...form, [field]: value });

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="page-eyebrow">Clinical case exposure</p>
          <h2 className="page-title mt-1">Cases presented</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Structured histories, examinations, investigations, management and learning reflections for every presented case.
          </p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button><PlusCircle className="h-4 w-4" /> Log clinical case</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl bg-white sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl"><FileText className="h-5 w-5 text-teal-600" /> New clinical case</DialogTitle>
              <DialogDescription>Complete the clinical record before sending it to a professor.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddCase} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-4">
                <Field label="Date"><Input type="date" value={form.date} onChange={(e) => setField("date", e.target.value)} required /></Field>
                <Field label="Patient UHID"><Input value={form.patientUhid} onChange={(e) => setField("patientUhid", e.target.value)} placeholder="UHID-2026-…" required /></Field>
                <Field label="Age"><Input value={form.age} onChange={(e) => setField("age", e.target.value)} placeholder="e.g. 7 years" required /></Field>
                <Field label="Gender">
                  <Select value={form.gender} onValueChange={(value) => setField("gender", value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent>
                  </Select>
                </Field>
              </div>
              <Field label="Chief complaints"><Textarea rows={2} value={form.chiefComplaints} onChange={(e) => setField("chiefComplaints", e.target.value)} required /></Field>
              <Field label="Relevant history"><Textarea rows={3} value={form.history} onChange={(e) => setField("history", e.target.value)} required /></Field>
              <Field label="Clinical examination"><Textarea rows={3} value={form.examination} onChange={(e) => setField("examination", e.target.value)} required /></Field>
              <Field label="Investigations"><Textarea rows={2} value={form.investigations} onChange={(e) => setField("investigations", e.target.value)} required /></Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Final diagnosis"><Input value={form.diagnosis} onChange={(e) => setField("diagnosis", e.target.value)} required /></Field>
                <Field label="Differential diagnosis"><Input value={form.differentialDiagnosis} onChange={(e) => setField("differentialDiagnosis", e.target.value)} /></Field>
              </div>
              <Field label="Management and interventions"><Textarea rows={3} value={form.management} onChange={(e) => setField("management", e.target.value)} required /></Field>
              <Field label="Outcome / follow-up"><Textarea rows={2} value={form.outcome} onChange={(e) => setField("outcome", e.target.value)} /></Field>
              <Field label="Learning points"><Textarea rows={2} value={form.learningPoints} onChange={(e) => setField("learningPoints", e.target.value)} required /></Field>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Save draft</Button>
                <Button type="submit">Send to professor</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="flex flex-col justify-between gap-4 border-b border-teal-100 md:flex-row md:items-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-teal-600" />
            <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" placeholder="Search number, diagnosis, UHID or complaint…" />
          </div>
          <Badge variant="outline" className="w-fit border-teal-100 bg-teal-50 px-3 py-1 text-teal-800">{caseLogs.length} of 50 cases logged</Badge>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Number</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Patient UHID</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Diagnosis</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Record</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.number}>
                  <TableCell className="font-bold">{log.number}</TableCell>
                  <TableCell>{formatLogbookDate(log.date)}</TableCell>
                  <TableCell className="font-semibold text-teal-800">{log.patientUhid}</TableCell>
                  <TableCell>{log.age}</TableCell>
                  <TableCell><p className="max-w-sm font-semibold text-slate-900">{log.diagnosis}</p></TableCell>
                  <TableCell>{statusBadge(log.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedLog(log)}><Eye className="h-4 w-4" /> Details</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={Boolean(selectedLog)} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl bg-white sm:max-w-3xl">
          {selectedLog && (
            <>
              <DialogHeader>
                <p className="page-eyebrow">Case number {selectedLog.number} • {formatLogbookDate(selectedLog.date)}</p>
                <DialogTitle className="text-2xl">{selectedLog.diagnosis}</DialogTitle>
                <DialogDescription>{selectedLog.patientUhid} • {selectedLog.age} • {selectedLog.gender}</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4">
                <Detail label="Chief complaints" value={selectedLog.chiefComplaints} />
                <Detail label="Relevant history" value={selectedLog.history} />
                <Detail label="Clinical examination" value={selectedLog.examination} />
                <Detail label="Investigations" value={selectedLog.investigations} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Detail label="Final diagnosis" value={selectedLog.diagnosis} />
                  <Detail label="Differential diagnosis" value={selectedLog.differentialDiagnosis} />
                </div>
                <Detail label="Management and interventions" value={selectedLog.management} />
                <Detail label="Outcome / follow-up" value={selectedLog.outcome} />
                <Detail label="Learning points" value={selectedLog.learningPoints} />
                <div className="rounded-2xl border border-teal-100 bg-teal-50/70 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-teal-700">Professor remarks</p>
                  <p className="mt-1 text-sm text-teal-950">{selectedLog.remarks}</p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}</div>;
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div><p className="text-[10px] font-bold uppercase tracking-wider text-teal-700">{label}</p><p className="mt-1 text-sm leading-6 text-slate-700">{value || "Not recorded"}</p></div>;
}

function statusBadge(status: CaseLog["status"]) {
  if (status === "verified") return <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700"><CheckCircle2 className="mr-1 h-3 w-3" /> Verified</Badge>;
  if (status === "revision") return <Badge className="border-rose-200 bg-rose-50 text-rose-700"><AlertCircle className="mr-1 h-3 w-3" /> Revision</Badge>;
  return <Badge className="border-amber-200 bg-amber-50 text-amber-700"><Clock className="mr-1 h-3 w-3" /> Pending</Badge>;
}
