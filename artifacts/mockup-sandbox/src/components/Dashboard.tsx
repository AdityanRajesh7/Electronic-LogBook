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
  Sparkles,
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
  const [summary, setSummary] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchDashboardData = React.useCallback(async () => {
    if (!user?.studentProfileId) {
      setError("No student profile ID found. Please log in as a student.");
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const [summaryData, logsData] = await Promise.all([
        apiGet(`/api/students/${user.studentProfileId}/dashboard`),
        apiGet(`/api/students/${user.studentProfileId}/logs`),
      ]);
      setSummary(summaryData);
      setLogs(logsData);
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

  const profile = summary?.student || logs.profile || {};
  const categories = summary?.categories || [
    { id: "cases", name: "Clinical cases", logged: logs.caseLogs?.length || 0, required: 50, verified: logs.caseLogs?.filter((item: any) => item.status === "verified").length || 0, percentage: 0, href: "/cases" },
    { id: "procedures", name: "Procedures", logged: logs.procedureLogs?.length || 0, required: 101, verified: logs.procedureLogs?.filter((item: any) => item.status === "verified").length || 0, percentage: 0, href: "/procedures" },
    { id: "academics", name: "Case discussions", logged: logs.academicLogs?.length || 0, required: 50, verified: logs.academicLogs?.filter((item: any) => item.status === "verified").length || 0, percentage: 0, href: "/academics" },
  ];

  const totalLogged = categories.reduce((sum: number, item: any) => sum + Number(item.logged || 0), 0);
  const totalVerified = categories.reduce((sum: number, item: any) => sum + Number(item.verified || 0), 0);
  const totalRequired = categories.reduce((sum: number, item: any) => sum + Number(item.required || 0), 0);
  const completion = totalRequired ? Math.min(100, Math.round((totalVerified / totalRequired) * 100)) : 0;
  const pendingReview = Math.max(totalLogged - totalVerified, 0);
  const profileName = profile.name || user?.name || "Student";
  const profileInitials = profileName
    .split(" ")
    .map((word: string) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

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
    <div className="section-spacing pb-12">
      <Card className="overflow-hidden border-white/75 bg-white/80 layer-2">
        <div className="h-28 bg-gradient-to-r from-[#ecd0ff] via-[#e8c7fd] to-[#dbb0f6]" />
        <CardContent className="p-0">
          <div className="px-6 pb-6 md:px-8">
            <div className="-mt-12 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-4 border-white bg-[#e5beff] text-2xl font-semibold text-purple-950 shadow-[0_16px_40px_rgba(124,58,237,0.18)]">
                  {profileInitials}
                </div>
                <div className="pt-10 md:pt-12">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">{profileName}</h1>
                    <Badge className="rounded-full border-0 bg-[#dbb0f6] px-3 py-1 text-[11px] font-semibold text-purple-950 shadow-[0_8px_18px_rgba(124,58,237,0.12)]">
                      Live profile data
                    </Badge>
                  </div>
                  <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-900">
                      <CalendarDays className="h-3.5 w-3.5" /> Date of joining: {formatLogbookDate(profile.dateOfJoining || logs.profile?.dateOfJoining || "") || "—"}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-900">
                      {profile.department || logs.profile?.department || "Department not set"}
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 md:pt-12">
                <Button asChild variant="outline" className="border-purple-100 bg-white/90 text-purple-900 shadow-[0_12px_24px_rgba(124,58,237,0.05)]">
                  <Link href="/cases"><FileText className="h-4 w-4" /> Review entries</Link>
                </Button>
              </div>
            </div>

            <div className="mt-6 rounded-[24px] border border-purple-100/80 bg-white/90 p-6 shadow-[0_18px_50px_rgba(124,58,237,0.05)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="page-eyebrow">Logbook details</p>
                  <h2 className="mt-1 text-xl font-semibold text-slate-950">Profile overview</h2>
                </div>
                <div className="hidden items-center gap-2 rounded-full border border-purple-100 bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-900 sm:flex">
                  <Sparkles className="h-3.5 w-3.5" /> Synced from database
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <ProfileField label="Full name" value={profileName} />
                <ProfileField label="Department" value={profile.department || logs.profile?.department || "Department not set"} />
                <ProfileField label="Registration no." value={profile.registrationNumber || logs.profile?.registrationNumber || "Registration unavailable"} />
                <ProfileField label="Current year" value={String(profile.joiningYear || logs.profile?.joiningYear || "Batch unavailable")} />
                <ProfileField label="Date of joining" value={formatLogbookDate(profile.dateOfJoining || logs.profile?.dateOfJoining || "") || "—"} />
                <ProfileField label="Expected completion" value={formatLogbookDate(calculateExpectedCompletion(profile.dateOfJoining || logs.profile?.dateOfJoining || ""))} />
                <ProfileField label="Student profile" value={profile.id ? `ID ${profile.id}` : "Profile ID unavailable"} />
                <ProfileField label="Verified entries" value={`${totalVerified} verified`} />
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-4 rounded-[24px] border border-purple-100/80 bg-gradient-to-r from-[#f4e8ff] to-[#efe2ff] p-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-purple-700 shadow-[0_10px_24px_rgba(124,58,237,0.08)]">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-950">{totalLogged} entries logged · {totalVerified} verified</p>
                  <p className="text-sm text-slate-600">{pendingReview} entries pending professor review</p>
                </div>
              </div>
              <Button asChild className="bg-purple-950 text-white shadow-[0_16px_34px_rgba(88,28,135,0.18)] hover:bg-purple-900">
                <Link href="/cases">Review entries</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {categories.map((item) => {
          const Icon = item.icon || getCategoryIcon(item.id || item.label || item.name);
          const href = item.href || getCategoryHref(item.id || item.label || item.name);
          const percent = Math.min(Math.round((Number(item.verified || 0) / Number(item.required || 1)) * 100), 100);
          const remaining = Math.max(Number(item.required || 0) - Number(item.logged || 0), 0);
          return (
            <Link key={item.id || item.label || item.name} href={href}>
              <Card className="h-full cursor-pointer border-white/75 bg-white/80 shadow-[0_18px_48px_rgba(124,58,237,0.05)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(124,58,237,0.08)]">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#e1b3ff] to-[#dbb0f6] text-purple-950 shadow-[0_12px_28px_rgba(124,58,237,0.16)]"><Icon className="h-5 w-5" /></div>
                    <div className="text-right">
                      <div className="text-4xl font-semibold leading-none text-slate-950 transition-all duration-700">{item.logged}</div>
                      <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Completed</div>
                    </div>
                  </div>
                  <p className="mt-4 text-sm font-semibold text-slate-900">{item.name || item.label}</p>
                  <p className="mt-1 text-[11px] text-slate-500">{item.logged} of {item.required} required</p>
                  <Progress value={percent} className="mt-4 h-2" />
                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                    <span>{remaining} remaining</span>
                    <span>{percent}%</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_.6fr]">
        <Card className="border-white/75 bg-white/80">
          <CardHeader className="flex flex-row items-center justify-between border-b border-purple-100/80">
            <div>
              <p className="page-eyebrow">Student activity</p>
              <CardTitle className="mt-1 text-xl">Recent entries</CardTitle>
            </div>
            <Button variant="ghost" size="sm" asChild><Link href="/cases">View logs <ArrowRight className="h-4 w-4" /></Link></Button>
          </CardHeader>
          <CardContent className="p-0">
            {recent.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-purple-700">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-slate-950">No entries yet</h3>
                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">Your logbook is empty. Start with a case, a procedure, or a posting and the dashboard will begin to fill in immediately.</p>
                <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                  <Button asChild><Link href="/cases">Log first case</Link></Button>
                  <Button asChild variant="outline"><Link href="/procedures">Open procedure list</Link></Button>
                </div>
              </div>
            ) : (
              <Table>
                <TableHeader><TableRow><TableHead>Number</TableHead><TableHead>Date</TableHead><TableHead>Type</TableHead><TableHead>Entry</TableHead><TableHead>Patient UHID</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                <TableBody>
                  {recent.map((item) => (
                    <TableRow key={`${item.type}-${item.number}`}>
                      <TableCell className="font-bold">{item.number}</TableCell>
                      <TableCell>{formatLogbookDate(item.date)}</TableCell>
                      <TableCell><Badge variant="outline" className="border-purple-100 bg-purple-50 text-purple-800">{item.type}</Badge></TableCell>
                      <TableCell className="max-w-xs font-semibold">{item.title}</TableCell>
                      <TableCell className="text-xs font-semibold text-purple-800">{item.patientUhid}</TableCell>
                      <TableCell><Status value={item.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-white/75 bg-white/80">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 text-purple-700" />
                <div>
                  <p className="text-sm font-bold text-purple-950">Procedure shortfall</p>
                  <p className="mt-1 text-xs leading-5 text-purple-900/80">Complete and verify every named procedure requirement; the combined target is 101.</p>
                  <Button asChild variant="link" className="mt-2 h-auto p-0 text-purple-800"><Link href="/procedures">Review requirements <ArrowRight className="h-3 w-3" /></Link></Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/75 bg-white/80">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <Printer className="mt-0.5 h-5 w-5 text-purple-700" />
                <div>
                  <p className="text-sm font-bold text-slate-900">Print at any point</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">Use Print PDF for a current copy. Incomplete records are automatically marked Draft; finalized records print as an official copy.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-white/75 bg-white/80">
        <CardContent className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-5 w-5 text-purple-600" />
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
  return <div className="rounded-[18px] border border-purple-100/80 bg-white/90 px-4 py-3 shadow-[0_10px_24px_rgba(124,58,237,0.05)]"><p className="text-[9px] font-bold uppercase tracking-[.15em] text-purple-700">{label}</p><p className="mt-1 truncate text-sm font-semibold text-slate-950">{value}</p></div>;
}

function getCategoryIcon(id: string) {
  if (id === "procedures") return Stethoscope;
  if (id === "academics") return GraduationCap;
  return FileText;
}

function getCategoryHref(id: string) {
  if (id === "procedures") return "/procedures";
  if (id === "academics") return "/academics";
  return "/cases";
}

function Status({ value }: { value: string }) {
  if (value === "verified") return <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700"><CheckCircle2 className="mr-1 h-3 w-3" /> Verified</Badge>;
  if (value === "rejected") return <Badge className="border-rose-200 bg-rose-50 text-rose-700">Revision</Badge>;
  return <Badge className="border-purple-200 bg-purple-50 text-purple-700">Pending</Badge>;
}
