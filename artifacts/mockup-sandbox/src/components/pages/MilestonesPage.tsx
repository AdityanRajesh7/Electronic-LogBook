import * as React from "react";
import { Award, CheckCircle2, Edit3, FileText, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatLogbookDate } from "@/lib/logbook-config";

type Thesis = {
  topic: string;
  guide: string;
  coGuide: string;
  protocolSubmissionDate: string;
  iecClearanceDate: string;
  dataCollectionStartDate: string;
  dataCollectionEndDate: string;
  submissionDate: string;
};

const initialThesis: Thesis = {
  topic: "Clinical profile and predictors of severe acute asthma in children admitted to a tertiary-care centre",
  guide: "Dr. Mohammed M T P",
  coGuide: "Dr. Mohammed",
  protocolSubmissionDate: "2025-08-12",
  iecClearanceDate: "2025-10-06",
  dataCollectionStartDate: "2025-11-01",
  dataCollectionEndDate: "2026-10-31",
  submissionDate: "2027-03-15",
};

export function MilestonesPage() {
  const [thesis, setThesis] = React.useState(initialThesis);
  const [draft, setDraft] = React.useState(initialThesis);
  const [thesisOpen, setThesisOpen] = React.useState(false);
  const [certificateOpen, setCertificateOpen] = React.useState(false);
  const [certificates, setCertificates] = React.useState([
    { name: "PALS — Pediatric Advanced Life Support", provider: "Indian Academy of Pediatrics", dateIssued: "2027-10-15" },
    { name: "NRP — Neonatal Resuscitation Program", provider: "IAP", dateIssued: "2027-04-20" },
    { name: "BLS — Basic Life Support", provider: "AHA", dateIssued: "2026-12-01" },
  ]);
  const [certificate, setCertificate] = React.useState({ name: "", provider: "", dateIssued: "2028-01-01" });

  const saveThesis = (event: React.FormEvent) => {
    event.preventDefault();
    setThesis(draft);
    setThesisOpen(false);
    toast.success("Thesis milestones updated");
  };

  const saveCertificate = (event: React.FormEvent) => {
    event.preventDefault();
    setCertificates([...certificates, { ...certificate }]);
    setCertificateOpen(false);
    toast.success("Certificate added");
  };

  const fields: Array<[keyof Thesis, string]> = [
    ["protocolSubmissionDate", "Protocol submission"],
    ["iecClearanceDate", "IEC clearance"],
    ["dataCollectionStartDate", "Data collection start"],
    ["dataCollectionEndDate", "Data collection end"],
    ["submissionDate", "Thesis submission"],
  ];

  return (
    <div className="space-y-6 pb-12">
      <div>
        <p className="page-eyebrow">Research and mandatory training</p>
        <h2 className="page-title mt-1">Thesis & certifications</h2>
        <p className="mt-2 text-sm text-slate-500">Track the complete thesis timeline and required life-support certificates.</p>
      </div>

      <Card className="overflow-hidden border-white/70 bg-white/76 layer-2">
        <CardHeader className="flex flex-row items-start justify-between border-b border-white/70 bg-white/52 backdrop-blur-md">
          <div>
            <p className="page-eyebrow">Thesis milestone tracker</p>
            <CardTitle className="mt-2 max-w-3xl text-2xl leading-8 text-slate-950">{thesis.topic}</CardTitle>
            <p className="mt-2 text-xs text-slate-600"><strong>Guide:</strong> {thesis.guide} &nbsp;•&nbsp; <strong>Co-guide:</strong> {thesis.coGuide}</p>
          </div>
          <Dialog open={thesisOpen} onOpenChange={setThesisOpen}>
            <DialogTrigger asChild><Button variant="outline" size="sm"><Edit3 className="h-4 w-4" /> Edit</Button></DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl bg-white sm:max-w-2xl">
              <DialogHeader><DialogTitle>Edit thesis milestones</DialogTitle><DialogDescription>Maintain departmental research and submission dates.</DialogDescription></DialogHeader>
              <form onSubmit={saveThesis} className="space-y-4">
                <Field label="Topic"><Input value={draft.topic} onChange={(e) => setDraft({ ...draft, topic: e.target.value })} /></Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Guide"><Input value={draft.guide} onChange={(e) => setDraft({ ...draft, guide: e.target.value })} /></Field>
                  <Field label="Co-guide"><Input value={draft.coGuide} onChange={(e) => setDraft({ ...draft, coGuide: e.target.value })} /></Field>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {fields.map(([key, label]) => <Field key={key} label={label}><Input type="date" value={draft[key]} onChange={(e) => setDraft({ ...draft, [key]: e.target.value })} /></Field>)}
                </div>
                <DialogFooter><Button type="button" variant="outline" onClick={() => setThesisOpen(false)}>Cancel</Button><Button type="submit">Save milestones</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {fields.map(([key, label], index) => (
              <div key={key} className="relative rounded-[18px] border border-white/70 bg-white/80 p-4 shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-600 text-xs font-bold text-white">{index + 1}</span>
                <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
                <p className="mt-1 text-sm font-bold text-slate-900">{formatLogbookDate(thesis[key])}</p>
                {new Date(thesis[key]) <= new Date() && <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-emerald-600" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-white/70 bg-white/76">
        <CardHeader className="flex flex-row items-center justify-between border-b border-white/70">
          <CardTitle className="flex items-center gap-2 text-lg"><Award className="h-5 w-5 text-teal-600" /> Life-support certifications</CardTitle>
          <Dialog open={certificateOpen} onOpenChange={setCertificateOpen}>
            <DialogTrigger asChild><Button size="sm"><PlusCircle className="h-4 w-4" /> Add certificate</Button></DialogTrigger>
            <DialogContent className="rounded-2xl bg-white sm:max-w-md">
              <DialogHeader><DialogTitle>Add certificate</DialogTitle><DialogDescription>Record a mandatory training certificate.</DialogDescription></DialogHeader>
              <form onSubmit={saveCertificate} className="space-y-4">
                <Field label="Certificate"><Input value={certificate.name} onChange={(e) => setCertificate({ ...certificate, name: e.target.value })} required /></Field>
                <Field label="Issuing body"><Input value={certificate.provider} onChange={(e) => setCertificate({ ...certificate, provider: e.target.value })} required /></Field>
                <Field label="Date issued"><Input type="date" value={certificate.dateIssued} onChange={(e) => setCertificate({ ...certificate, dateIssued: e.target.value })} /></Field>
                <DialogFooter><Button type="button" variant="outline" onClick={() => setCertificateOpen(false)}>Cancel</Button><Button type="submit">Save certificate</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Number</TableHead><TableHead>Certificate</TableHead><TableHead>Issuing body</TableHead><TableHead>Date issued</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {certificates.map((item, idx) => <TableRow key={idx}><TableCell className="font-bold">{idx + 1}</TableCell><TableCell className="font-semibold"><span className="flex items-center gap-2"><FileText className="h-4 w-4 text-teal-600" /> {item.name}</span></TableCell><TableCell>{item.provider}</TableCell><TableCell>{formatLogbookDate(item.dateIssued)}</TableCell><TableCell><Badge className="border-emerald-200 bg-emerald-50 text-emerald-700"><CheckCircle2 className="mr-1 h-3 w-3" /> Active</Badge></TableCell></TableRow>)}
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
