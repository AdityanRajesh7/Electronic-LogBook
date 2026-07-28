import * as React from "react";
import { Link } from "wouter";
import {
  AlertTriangle,
  ArrowRight,
  Award,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Printer,
  Stethoscope,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatLogbookDate } from "@/lib/logbook-config";

const student = {
  name: "Dr. Adithya Nair",
  department: "Department of Pediatrics",
  registrationNumber: "PG2024-PAED-014",
  dateOfJoining: "2024-06-03",
  kuhsId: "KUHS-MD-PED-2024-014",
  guide: "Prof. Dr. Mohammad MTP",
};

const categories = [
  { label: "Clinical cases", logged: 42, required: 50, icon: FileText, href: "/cases", tone: "from-teal-500 to-cyan-500" },
  { label: "Procedures", logged: 11, required: 15, icon: Stethoscope, href: "/procedures", tone: "from-cyan-500 to-sky-500" },
  { label: "Academic activities", logged: 18, required: 20, icon: GraduationCap, href: "/academics", tone: "from-emerald-500 to-teal-500" },
  { label: "Assessments", logged: 3, required: 4, icon: ClipboardCheck, href: "/assessments", tone: "from-amber-400 to-orange-400" },
];

const recent = [
  { number: 1092, date: "2026-07-26", type: "Case", title: "Acute Severe Asthma Exacerbation", patientUhid: "UHID-2026-004281", status: "Pending" },
  { number: 1088, date: "2026-07-24", type: "Procedure", title: "Endotracheal Intubation", patientUhid: "UHID-2026-003944", status: "Verified" },
  { number: 1081, date: "2026-07-22", type: "Academic", title: "High-Flow Nasal Cannula versus CPAP", patientUhid: "—", status: "Verified" },
  { number: 1075, date: "2026-07-20", type: "Procedure", title: "Lumbar Puncture", patientUhid: "UHID-2026-003771", status: "Revision" },
];

export function Dashboard() {
  const completion = Math.round(
    categories.reduce((sum, item) => sum + item.logged / item.required, 0) / categories.length * 100,
  );

  return (
    <div className="space-y-6 pb-12">
      <Card className="overflow-hidden border-teal-100">
        <div className="h-1.5 bg-gradient-to-r from-teal-500 via-cyan-400 to-emerald-400" />
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col gap-7 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-2xl">
              <Badge className="border-0 bg-teal-50 text-[10px] font-bold uppercase tracking-[.16em] text-teal-800">MCI logbook guidelines</Badge>
              <p className="mt-4 page-eyebrow">{student.department}</p>
              <h1 className="mt-1 text-4xl font-bold leading-tight text-slate-900 md:text-5xl">Postgraduate Electronic Logbook</h1>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                Maintain complete, dated clinical and academic records using patient UHID only. Submit entries regularly for HOD / Guide verification.
              </p>
            </div>
            <div className="grid w-full gap-3 sm:grid-cols-2 xl:max-w-xl">
              <ProfileField label="Resident" value={student.name} />
              <ProfileField label="Registration number" value={student.registrationNumber} />
              <ProfileField label="Date of joining" value={formatLogbookDate(student.dateOfJoining)} />
              <ProfileField label="KUHS ID" value={student.kuhsId} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1.55fr_.85fr]">
        <Card className="overflow-hidden bg-gradient-to-br from-teal-700 via-teal-600 to-cyan-500 text-white">
          <CardContent className="relative p-6 md:p-7">
            <div className="absolute -right-14 -top-14 h-48 w-48 rounded-full border-[34px] border-white/10" />
            <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[.18em] text-teal-100">Current clinical schedule</p>
                <h2 className="mt-2 text-3xl font-bold">Pediatric Intensive Care Unit</h2>
                <p className="mt-2 text-xs text-teal-50">01/07/26 – 31/07/26 • HOD / Guide: {student.guide}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Button asChild className="bg-white text-teal-800 hover:bg-teal-50">
                    <Link href="/cases"><FileText className="h-4 w-4" /> Log a case</Link>
                  </Button>
                  <Button asChild variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
                    <Link href="/procedures"><Stethoscope className="h-4 w-4" /> Log a procedure</Link>
                  </Button>
                </div>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                <p className="text-[10px] font-bold uppercase tracking-wider text-teal-100">Schedule progress</p>
                <p className="mt-1 text-3xl font-bold">27/31</p>
                <p className="text-[11px] text-teal-50">days completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-teal-100">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="page-eyebrow">Overall completion</p>
                <p className="mt-2 text-5xl font-bold text-teal-700">{completion}<span className="text-xl text-teal-400">%</span></p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-700"><BookOpen className="h-5 w-5" /></div>
            </div>
            <Progress value={completion} className="mt-5 h-2.5" />
            <p className="mt-3 text-xs text-slate-500">Progress across cases, procedures, academics and assessments.</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {categories.map((item) => {
          const Icon = item.icon;
          const percent = Math.round(item.logged / item.required * 100);
          return (
            <Link key={item.label} href={item.href}>
              <Card className="h-full cursor-pointer border-teal-100 transition hover:-translate-y-0.5 hover:shadow-lg">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br ${item.tone} text-white shadow-sm`}><Icon className="h-5 w-5" /></div>
                    <span className="text-xs font-bold text-teal-700">{percent}%</span>
                  </div>
                  <p className="mt-5 text-[11px] font-bold uppercase tracking-wider text-slate-500">{item.label}</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{item.logged}<span className="text-sm text-slate-400">/{item.required}</span></p>
                  <Progress value={percent} className="mt-3 h-1.5" />
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_.6fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between border-b border-teal-100">
            <div>
              <p className="page-eyebrow">Student activity</p>
              <CardTitle className="mt-1 text-xl">Recent entries</CardTitle>
            </div>
            <Button variant="ghost" size="sm" asChild><Link href="/cases">View logs <ArrowRight className="h-4 w-4" /></Link></Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Number</TableHead><TableHead>Date</TableHead><TableHead>Type</TableHead><TableHead>Entry</TableHead><TableHead>Patient UHID</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {recent.map((item) => (
                  <TableRow key={item.number}>
                    <TableCell className="font-bold">{item.number}</TableCell>
                    <TableCell>{formatLogbookDate(item.date)}</TableCell>
                    <TableCell><Badge variant="outline" className="border-teal-100 bg-teal-50 text-teal-800">{item.type}</Badge></TableCell>
                    <TableCell className="max-w-xs font-semibold">{item.title}</TableCell>
                    <TableCell className="text-xs font-semibold text-teal-800">{item.patientUhid}</TableCell>
                    <TableCell><Status value={item.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-amber-200 bg-amber-50/80">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-700" />
                <div>
                  <p className="text-sm font-bold text-amber-950">Procedure shortfall</p>
                  <p className="mt-1 text-xs leading-5 text-amber-900/80">4 more required procedures should be completed and verified.</p>
                  <Button asChild variant="link" className="mt-2 h-auto p-0 text-amber-800"><Link href="/procedures">Review requirements <ArrowRight className="h-3 w-3" /></Link></Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-cyan-100">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <Printer className="mt-0.5 h-5 w-5 text-cyan-700" />
                <div>
                  <p className="text-sm font-bold text-slate-900">Print at any point</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">Use Print PDF for a current copy. Incomplete records are automatically marked Draft; finalized records print as an official copy.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-teal-100 bg-white/70">
        <CardContent className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-5 w-5 text-teal-600" />
            <div><p className="text-sm font-bold">Next quarterly assessment</p><p className="text-xs text-slate-500">30/09/26 with Prof. Dr. Mohammad MTP</p></div>
          </div>
          <Button asChild variant="outline" size="sm"><Link href="/assessments"><Award className="h-4 w-4" /> View assessments</Link></Button>
        </CardContent>
      </Card>
    </div>
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-teal-100 bg-teal-50/45 px-4 py-3"><p className="text-[9px] font-bold uppercase tracking-[.15em] text-teal-700">{label}</p><p className="mt-1 truncate text-sm font-bold text-slate-900">{value}</p></div>;
}

function Status({ value }: { value: string }) {
  if (value === "Verified") return <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700"><CheckCircle2 className="mr-1 h-3 w-3" /> Verified</Badge>;
  if (value === "Revision") return <Badge className="border-rose-200 bg-rose-50 text-rose-700">Revision</Badge>;
  return <Badge className="border-amber-200 bg-amber-50 text-amber-700">Pending</Badge>;
}
