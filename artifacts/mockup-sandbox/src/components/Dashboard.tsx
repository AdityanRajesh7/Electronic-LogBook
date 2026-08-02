import * as React from "react";
import { Link } from "wouter";
import {
  AlertTriangle,
  ArrowRight,
  Award,
  CalendarDays,
  CheckCircle2,
  FileText,
  GraduationCap,
  Printer,
  Stethoscope,
  Loader2,
  RefreshCcw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatLogbookDate } from "@/lib/logbook-config";
import { apiGet } from "@/lib/apiClient";
import { getCurrentUser } from "@/lib/session";

// Calculate expected completion by adding 3 years to dateOfJoining
function calculateExpectedCompletion(dateOfJoining: string) {
  if (!dateOfJoining) return "Unknown";
  try {
    const d = new Date(dateOfJoining);
    d.setFullYear(d.getFullYear() + 3);
    return d.toISOString().slice(0, 10);
  } catch {
    return "Unknown";
  }
}

export function Dashboard() {
  const user = React.useMemo(() => getCurrentUser(), []);
  const [logs, setLogs] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [deptConfig, setDeptConfig] = React.useState({ requiredCases: 50, requiredProcedures: 101, requiredAcademic: 50 });

  const fetchDashboardData = React.useCallback(async () => {
    if (!user?.studentProfileId) {
      setError("No student profile ID found. Please log in as a student.");
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const [logsData, configData] = await Promise.all([
        apiGet(`/api/students/${user.studentProfileId}/logs`),
        apiGet(`/api/departments/${user.departmentId}/config`).catch(() => null)
      ]);
      setLogs(logsData);
      if (configData) setDeptConfig(configData);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  React.useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        <p className="text-sm text-slate-500">Loading your logbook data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4">
        <AlertTriangle className="h-10 w-10 text-amber-500" />
        <p className="text-sm font-medium text-slate-900">{error}</p>
        <Button onClick={fetchDashboardData} variant="outline" className="text-teal-700">
          <RefreshCcw className="mr-2 h-4 w-4" /> Try again
        </Button>
      </div>
    );
  }

  if (!logs) return null;

  const categories = [
    { label: "Clinical cases", logged: logs.caseLogs?.length || 0, required: deptConfig.requiredCases, icon: FileText, href: "/cases", tone: "from-teal-500 to-cyan-500" },
    { label: "Procedures", logged: logs.procedureLogs?.length || 0, required: deptConfig.requiredProcedures, icon: Stethoscope, href: "/procedures", tone: "from-cyan-500 to-sky-500" },
    { label: "Case discussions", logged: logs.academicLogs?.length || 0, required: deptConfig.requiredAcademic, icon: GraduationCap, href: "/academics", tone: "from-emerald-500 to-teal-500" },
  ];

  const completion = Math.round(
    categories.reduce((sum, item) => sum + Math.min(item.logged / item.required, 1), 0) / categories.length * 100,
  );

  const mappedCaseLogs = (logs.caseLogs || []).map((l: any) => ({
    number: l.id, date: l.date, type: "Case", title: l.diagnosisProvisional || "Case Log", patientUhid: l.patientUhid, status: l.status, timestamp: new Date(l.createdAt).getTime()
  }));
  const mappedProcLogs = (logs.procedureLogs || []).map((l: any) => ({
    number: l.id, date: l.date, type: "Procedure", title: l.procedureName, patientUhid: l.patientUhid, status: l.status, timestamp: new Date(l.createdAt).getTime()
  }));
  const mappedAcadLogs = (logs.academicLogs || []).map((l: any) => ({
    number: l.id, date: l.date, type: "Academic", title: l.topic, patientUhid: "—", status: l.status, timestamp: new Date(l.createdAt).getTime()
  }));

  const recent = [...mappedCaseLogs, ...mappedProcLogs, ...mappedAcadLogs]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 5);

  return (
    <div className="space-y-6 pb-12">
      <Card className="overflow-hidden border-teal-100">
        <div className="h-1.5 bg-gradient-to-r from-teal-500 via-cyan-400 to-emerald-400" />
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col gap-7 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-2xl">
              <Badge className="border-0 bg-teal-50 text-[10px] font-bold uppercase tracking-[.16em] text-teal-800">MCI logbook guidelines</Badge>
              <p className="mt-4 page-eyebrow">{logs.profile?.department || "Department Unassigned"}</p>
              <h1 className="mt-1 text-4xl font-bold leading-tight text-slate-900 md:text-5xl">Postgraduate Electronic Logbook</h1>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                Maintain complete, dated clinical and academic records using patient UHID only. Submit entries regularly for professor verification.
              </p>
            </div>
            <div className="grid w-full gap-3 sm:grid-cols-2 xl:max-w-xl">
              <ProfileField label="Resident" value={user?.name || "Student"} />
              <ProfileField label="Registration number" value={logs.profile?.registrationNumber || "—"} />
              <ProfileField label="Date of joining" value={formatLogbookDate(logs.profile?.dateOfJoining || "—")} />
              <ProfileField label="Joining year" value={logs.profile?.joiningYear || "—"} />
              <ProfileField label="Expected completion" value={formatLogbookDate(calculateExpectedCompletion(logs.profile?.dateOfJoining))} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <Card className="overflow-hidden bg-gradient-to-br from-teal-700 via-teal-600 to-cyan-500 text-white">
          <CardContent className="relative p-6 md:p-7">
            <div className="absolute -right-14 -top-14 h-48 w-48 rounded-full border-[34px] border-white/10" />
            <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[.18em] text-teal-100">Overall logbook completion</p>
                <h2 className="mt-2 text-4xl font-bold">{completion}<span className="text-xl text-teal-100">%</span></h2>
                <p className="mt-2 max-w-xl text-xs leading-5 text-teal-50">Progress across cases, the complete procedure target, case discussions and assessments.</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Button asChild className="bg-white text-teal-800 hover:bg-teal-50">
                    <Link href="/cases"><FileText className="h-4 w-4" /> Log a case</Link>
                  </Button>
                  <Button asChild variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
                    <Link href="/procedures"><Stethoscope className="h-4 w-4" /> Log a procedure</Link>
                  </Button>
                  <Button asChild variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
                    <Link href="/postings"><CalendarDays className="h-4 w-4" /> Add posting / rotation</Link>
                  </Button>
                </div>
              </div>
              <div className="min-w-52 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                <p className="text-[10px] font-bold uppercase tracking-wider text-teal-100 flex items-center gap-1.5">Registration <Badge variant="secondary" className="h-4 px-1 text-[8px] bg-white/20 text-white border-0 hover:bg-white/20 rounded-sm">Active</Badge></p>
                <p className="mt-1 text-lg font-bold text-white">{logs.profile?.registrationNumber || "Unknown"}</p>
                <p className="mt-1 text-[11px] text-teal-50">Programme ends {formatLogbookDate(calculateExpectedCompletion(logs.profile?.dateOfJoining))}</p>
              </div>
            </div>
            <Progress value={completion} className="relative mt-6 h-2.5 bg-white/20" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {categories.map((item) => {
          const Icon = item.icon;
          const percent = Math.min(Math.round(item.logged / item.required * 100), 100);
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
            {recent.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50">
                  <FileText className="h-5 w-5 text-slate-400" />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-slate-900">No entries yet</h3>
                <p className="mt-1 max-w-sm text-sm text-slate-500">Your logbook is empty. Start by logging your first clinical case or procedure.</p>
              </div>
            ) : (
              <Table>
                <TableHeader><TableRow><TableHead>Number</TableHead><TableHead>Date</TableHead><TableHead>Type</TableHead><TableHead>Entry</TableHead><TableHead>Patient UHID</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                <TableBody>
                  {recent.map((item) => (
                    <TableRow key={`${item.type}-${item.number}`}>
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
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-amber-200 bg-amber-50/80">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-700" />
                <div>
                  <p className="text-sm font-bold text-amber-950">Procedure shortfall</p>
                  <p className="mt-1 text-xs leading-5 text-amber-900/80">Complete and verify every named procedure requirement; the combined target is 101.</p>
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
            <div><p className="text-sm font-bold">Next quarterly assessment</p><p className="text-xs text-slate-500 italic">Assessment tracking coming soon</p></div>
          </div>
          <Button asChild variant="outline" size="sm" disabled className="opacity-50 cursor-not-allowed">
            <span><Award className="h-4 w-4 mr-2 inline" /> View assessments</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-teal-100 bg-teal-50/45 px-4 py-3"><p className="text-[9px] font-bold uppercase tracking-[.15em] text-teal-700">{label}</p><p className="mt-1 truncate text-sm font-bold text-slate-900">{value}</p></div>;
}

function Status({ value }: { value: string }) {
  if (value === "verified") return <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700"><CheckCircle2 className="mr-1 h-3 w-3" /> Verified</Badge>;
  if (value === "rejected") return <Badge className="border-rose-200 bg-rose-50 text-rose-700">Revision</Badge>;
  return <Badge className="border-amber-200 bg-amber-50 text-amber-700">Pending</Badge>;
}
