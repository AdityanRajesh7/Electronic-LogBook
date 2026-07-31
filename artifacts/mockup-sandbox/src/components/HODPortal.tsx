import * as React from "react";
import { useLocation } from "wouter";
import {
  CheckCircle2,
  Clock3,
  CreditCard,
  ShieldCheck,
  UserCheck,
  Users,
  XCircle,
  TrendingUp,
  FileCheck,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ACADEMIC_REQUIREMENTS,
  DEPARTMENT_HOD,
  formatLogbookDate,
  REQUIRED_PROCEDURE_COUNT,
} from "@/lib/logbook-config";
import { apiGet } from "@/lib/apiClient";
import { getCurrentUser } from "@/lib/session";

type Registration = {
  number: number;
  name: string;
  department: string;
  registrationNumber: string;
  dateOfJoining: string;
  expectedCompletion: string;
  status: "Active";
};

type AnalyticsData = {
  totalStudents: number;
  avgCompletion: number;
  logStats: { pending: number; verified: number; rejected: number };
  topProcedures: { name: string; count: number }[];
  students: Registration[];
};

const paths: Record<string, string> = {
  "gap-dashboard": "/",
  "student-access": "/student-access",
  "leave-approvals": "/leave-approvals",
};

export function HODPortal({ activeTab = "gap-dashboard" }: { activeTab?: string }) {
  const [, setLocation] = useLocation();
  const [analyticsData, setAnalyticsData] = React.useState<AnalyticsData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Leave approvals remain local-only — no leaveRecordsTable in schema yet
  const [leaves, setLeaves] = React.useState([
    { number: 1, resident: "Dr. Anilkumar A", type: "Casual leave", from: "2026-08-04", to: "2026-08-05", reason: "Family commitment" },
    { number: 2, resident: "Dr. Radhamani KV", type: "Academic leave", from: "2026-08-11", to: "2026-08-13", reason: "Conference presentation" },
  ]);

  const fetchAnalytics = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const user = getCurrentUser();
      if (!user || !user.departmentId) {
        setError("Not logged in or department not assigned.");
        return;
      }
      const data = await apiGet<AnalyticsData>(`/api/departments/${user.departmentId}/analytics`);
      setAnalyticsData(data);
    } catch (err: any) {
      setError(err.message || "Failed to load department analytics.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const decideLeave = (number: number, approved: boolean) => {
    setLeaves((current) => current.filter((leave) => leave.number !== number));
    toast.success(approved ? "Leave approved" : "Leave returned");
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-teal-600"></div>
          <p className="text-sm font-medium text-slate-500">Loading Department Overview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 flex-col items-center justify-center space-y-4">
        <p className="text-red-500">{error}</p>
        <Button onClick={fetchAnalytics} variant="outline">Try Again</Button>
      </div>
    );
  }

  const registrations = analyticsData?.students ?? [];
  const logStats = analyticsData?.logStats ?? { pending: 0, verified: 0, rejected: 0 };
  const topProcedures = analyticsData?.topProcedures ?? [];
  const totalLogs = logStats.pending + logStats.verified + logStats.rejected;

  return (
    <div className="space-y-6 pb-12">
      <Card className="overflow-hidden border-teal-100 bg-gradient-to-r from-teal-800 via-teal-700 to-cyan-600 text-white">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.18em] text-teal-100">Department leadership</p>
              <h2 className="mt-2 text-3xl font-bold">{DEPARTMENT_HOD}</h2>
              <p className="mt-2 text-sm text-teal-50">HOD, Department of Pediatrics</p>
              <p className="mt-4 max-w-2xl text-xs leading-5 text-teal-100">
                Students create and pay for their own account. The HOD verifies paid registrations and oversees programme completion.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Metric value={String(analyticsData?.totalStudents ?? 0)} label="Registered" />
              <Metric value={`${analyticsData?.avgCompletion ?? 0}%`} label="Avg. Completion" />
              <Metric value="3 years" label="Programme" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={(value) => setLocation(paths[value] ?? "/")}>
        <TabsList className="h-auto flex-wrap">
          <TabsTrigger value="gap-dashboard"><ShieldCheck className="h-4 w-4" /> Overview</TabsTrigger>
          <TabsTrigger value="student-access"><Users className="h-4 w-4" /> Student registrations</TabsTrigger>
          <TabsTrigger value="leave-approvals"><Clock3 className="h-4 w-4" /> Leave approvals</TabsTrigger>
        </TabsList>

        <TabsContent value="gap-dashboard" className="space-y-4 pt-4">
          {/* Programme requirements — static */}
          <div className="grid gap-4 md:grid-cols-3">
            <Overview label="Procedure target" value={String(REQUIRED_PROCEDURE_COUNT)} note="Across emergency and invasive procedures" icon={UserCheck} />
            <Overview label="Case discussions" value="50" note="Mandatory total per resident" icon={CheckCircle2} />
            <Overview label="Avg. dept. completion" value={`${analyticsData?.avgCompletion ?? 0}%`} note="Verified logs only, across all residents" icon={TrendingUp} />
          </div>

          {/* Log activity breakdown */}
          <Card>
            <CardHeader className="border-b border-teal-100">
              <CardTitle className="text-xl">Department log activity</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 p-5 sm:grid-cols-3">
              <LogStatCard icon={Clock} color="amber" label="Pending review" value={logStats.pending} total={totalLogs} />
              <LogStatCard icon={FileCheck} color="emerald" label="Verified" value={logStats.verified} total={totalLogs} />
              <LogStatCard icon={AlertTriangle} color="rose" label="Rejected" value={logStats.rejected} total={totalLogs} />
            </CardContent>
          </Card>

          {/* Top procedures */}
          {topProcedures.length > 0 && (
            <Card>
              <CardHeader className="border-b border-teal-100">
                <CardTitle className="text-xl">Top procedure types</CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <div className="space-y-3">
                  {topProcedures.map((proc) => (
                    <div key={proc.name} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">{proc.name}</span>
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-teal-500"
                            style={{ width: `${Math.min((proc.count / (topProcedures[0]?.count || 1)) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="w-6 text-right text-sm font-bold text-teal-700">{proc.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Academic requirements — static */}
          <Card>
            <CardHeader className="border-b border-teal-100">
              <CardTitle className="text-xl">Mandatory academic frequency</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-4">
              {ACADEMIC_REQUIREMENTS.map((item) => (
                <div key={item.name} className="rounded-2xl border border-teal-100 bg-teal-50/50 p-4">
                  <p className="text-sm font-bold text-slate-900">{item.name}</p>
                  <p className="mt-2 text-2xl font-bold text-teal-700">{item.target}</p>
                  <p className="text-xs text-slate-500">{item.requirement}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="student-access" className="space-y-4 pt-4">
          <Card className="border-cyan-100 bg-cyan-50/50">
            <CardContent className="flex gap-3 p-5">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-cyan-700" />
              <div>
                <p className="font-bold text-slate-900">Student self-registration</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Students submit their registration number, department, exact joining date, joining year and payment. HOD verification activates access.
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="border-b border-teal-100">
              <CardTitle className="text-xl">Paid student registrations</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {registrations.length === 0 ? (
                <p className="p-6 text-center text-sm text-slate-500">No registered students found in this department.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Number</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Registration number</TableHead>
                      <TableHead>Date joined</TableHead>
                      <TableHead>Expected completion</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {registrations.map((student) => (
                      <TableRow key={student.number}>
                        <TableCell className="font-bold">{student.number}</TableCell>
                        <TableCell className="font-semibold">{student.name}</TableCell>
                        <TableCell>{student.department}</TableCell>
                        <TableCell>{student.registrationNumber}</TableCell>
                        <TableCell>{formatLogbookDate(student.dateOfJoining)}</TableCell>
                        <TableCell>{formatLogbookDate(student.expectedCompletion)}</TableCell>
                        <TableCell className="text-right">
                          <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">{student.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leave-approvals" className="pt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between border-b border-teal-100">
              <CardTitle className="text-xl">Pending leave requests</CardTitle>
              <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
                Demo data — not yet persisted
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              {leaves.length === 0 ? (
                <p className="p-6 text-center text-sm text-slate-500">No pending leave requests.</p>
              ) : (
                <Table>
                  <TableHeader><TableRow><TableHead>Number</TableHead><TableHead>Resident</TableHead><TableHead>Type</TableHead><TableHead>Dates</TableHead><TableHead>Reason</TableHead><TableHead className="text-right">Decision</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {leaves.map((leave) => (
                      <TableRow key={leave.number}>
                        <TableCell className="font-bold">{leave.number}</TableCell>
                        <TableCell className="font-semibold">{leave.resident}</TableCell>
                        <TableCell>{leave.type}</TableCell>
                        <TableCell>{formatLogbookDate(leave.from)} – {formatLogbookDate(leave.to)}</TableCell>
                        <TableCell>{leave.reason}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" onClick={() => decideLeave(leave.number, false)} className="text-rose-700"><XCircle className="h-4 w-4" /> Return</Button>
                            <Button size="sm" onClick={() => decideLeave(leave.number, true)}><CheckCircle2 className="h-4 w-4" /> Approve</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-center"><p className="text-xl font-bold">{value}</p><p className="text-[9px] font-bold uppercase tracking-wider text-teal-100">{label}</p></div>;
}

function Overview({ label, value, note, icon: Icon }: { label: string; value: string; note: string; icon: React.ComponentType<{ className?: string }> }) {
  return <Card><CardContent className="p-5"><Icon className="h-5 w-5 text-teal-600" /><p className="mt-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold text-teal-700">{value}</p><p className="mt-1 text-xs text-slate-500">{note}</p></CardContent></Card>;
}

function LogStatCard({
  icon: Icon,
  color,
  label,
  value,
  total,
}: {
  icon: React.ComponentType<{ className?: string }>;
  color: "amber" | "emerald" | "rose";
  label: string;
  value: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  const colorMap = {
    amber:   { bg: "bg-amber-50",   border: "border-amber-100",  text: "text-amber-700",   bar: "bg-amber-400"   },
    emerald: { bg: "bg-emerald-50", border: "border-emerald-100", text: "text-emerald-700", bar: "bg-emerald-500" },
    rose:    { bg: "bg-rose-50",    border: "border-rose-100",    text: "text-rose-700",    bar: "bg-rose-400"    },
  };
  const c = colorMap[color];
  return (
    <div className={`rounded-2xl border ${c.border} ${c.bg} p-4`}>
      <Icon className={`h-5 w-5 ${c.text}`} />
      <p className="mt-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${c.text}`}>{value}</p>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/60">
        <div className={`h-full rounded-full ${c.bar}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1 text-xs text-slate-400">{pct}% of all logs</p>
    </div>
  );
}
