import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarDays, CheckCircle2, Clock, XCircle } from "lucide-react";
import { toast } from "sonner";
import { formatLogbookDate, todayForInput } from "@/lib/logbook-config";
import { apiGet, apiPost } from "@/lib/apiClient";
import { getCurrentUser } from "@/lib/session";

type LeaveStatus = "pending" | "approved" | "rejected";

type LeaveRecord = {
  number: number;
  appliedOn: string;
  fromDate: string;
  toDate: string;
  totalDays: number;
  leaveType: string;
  reason: string;
  status: LeaveStatus;
  approvedBy: string;
};

export function AttendancePage() {
  const [leaveType, setLeaveType] = React.useState("Casual Leave");
  const [fromDate, setFromDate] = React.useState("2026-08-12");
  const [toDate, setToDate] = React.useState("2026-08-14");
  const [reason, setReason] = React.useState("");

  const [leaves, setLeaves] = React.useState<LeaveRecord[]>([]);
  const user = React.useMemo(() => getCurrentUser(), []);

  const fetchLeaves = React.useCallback(async () => {
    if (!user?.studentProfileId) return;
    try {
      const data = await apiGet(`/api/students/${user.studentProfileId}/leave-records`);
      setLeaves(data.map((l: any) => ({
        number: l.id,
        appliedOn: l.createdAt ? l.createdAt.split("T")[0] : "",
        fromDate: l.startDate,
        toDate: l.endDate,
        totalDays: getInclusiveDays(l.startDate, l.endDate),
        leaveType: l.leaveType === "casual" ? "Casual Leave" : l.leaveType === "academic" ? "Academic Leave" : l.leaveType,
        reason: l.reason,
        status: l.status,
        approvedBy: l.reviewedBy ? "HOD" : "Awaiting HOD",
      })));
    } catch (err) {
      toast.error("Failed to load leave records");
    }
  }, [user?.studentProfileId]);

  React.useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    const totalDays = getInclusiveDays(fromDate, toDate);

    if (!reason || totalDays < 1) {
      toast.error("Enter a valid leave period and reason.");
      return;
    }
    
    if (!user?.studentProfileId) return;

    try {
      const payload = {
        startDate: fromDate,
        endDate: toDate,
        leaveType: leaveType === "Casual Leave" ? "casual" : leaveType === "Academic Leave" ? "academic" : "casual",
        reason
      };
      await apiPost(`/api/students/${user.studentProfileId}/leave-records`, payload);
      toast.success(`Leave application submitted`, {
        description: `Sent to the HOD for approval (${formatLogbookDate(fromDate)} to ${formatLogbookDate(toDate)}).`,
      });
      setReason("");
      fetchLeaves();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit leave application");
    }
  };

  const casualUsed = leaves
    .filter((leave) => leave.leaveType === "Casual Leave" && leave.status === "approved")
    .reduce((total, leave) => total + leave.totalDays, 0);

  const academicUsed = leaves
    .filter((leave) => leave.leaveType === "Academic Leave" && leave.status === "approved")
    .reduce((total, leave) => total + leave.totalDays, 0);

  const pendingCount = leaves.filter((leave) => leave.status === "pending").length;

  return (
    <div className="space-y-6 pb-12">
      <div>
        <p className="page-eyebrow">Attendance administration</p>
        <h2 className="page-title mt-1">Leave records</h2>
        <p className="mt-2 text-sm text-slate-500">Apply for leave and maintain the complete HOD decision record.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard label="Casual Leave (20/yr)" value={casualUsed} total={20} tone="teal" />
        <SummaryCard label="Academic Leave (15/yr)" value={academicUsed} total={15} tone="teal" />
        <SummaryCard label="Pending Approval" value={pendingCount} tone="amber" />
      </div>

      <Card className="border border-slate-200 bg-white">
        <CardHeader className="border-b border-slate-100 pb-3">
          <CardTitle className="text-sm font-bold text-slate-900">New Leave Application</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <form onSubmit={handleApplyLeave} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-1">
                <Label className="text-xs">Leave Type</Label>
                <Select value={leaveType} onValueChange={setLeaveType}>
                  <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Casual Leave">Casual Leave</SelectItem>
                    <SelectItem value="Medical Leave">Medical Leave</SelectItem>
                    <SelectItem value="Academic Leave">Academic Leave</SelectItem>
                    <SelectItem value="Maternity / Paternity Leave">Maternity / Paternity Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">From Date</Label>
                <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="text-xs" required />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">To Date</Label>
                <Input type="date" min={fromDate} value={toDate} onChange={(e) => setToDate(e.target.value)} className="text-xs" required />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Reason for Leave</Label>
              <Input
                placeholder="e.g. Attending IAP Pulmonary Conference"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="text-xs"
                required
              />
            </div>
            <Button type="submit" className="bg-teal-600 text-xs font-semibold text-white hover:bg-teal-700">
              Submit Leave Application
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border border-slate-200 bg-white">
        <CardHeader className="border-b border-slate-100 pb-3">
          <CardTitle className="text-base font-bold text-slate-900">Leave Records</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="text-xs font-semibold">Application</TableHead>
                <TableHead className="text-xs font-semibold">Leave Type</TableHead>
                <TableHead className="text-xs font-semibold">Leave Period</TableHead>
                <TableHead className="text-xs font-semibold">Reason</TableHead>
                <TableHead className="text-xs font-semibold">HOD decision</TableHead>
                <TableHead className="text-xs font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaves.map((leave) => (
                <TableRow key={leave.number}>
                  <TableCell className="py-3 text-xs font-bold text-slate-900">
                    {leave.number}
                    <p className="text-[10px] font-normal text-slate-400">Applied {formatLogbookDate(leave.appliedOn)}</p>
                  </TableCell>
                  <TableCell className="py-3 text-xs font-medium text-slate-700">{leave.leaveType}</TableCell>
                  <TableCell className="py-3 text-xs text-slate-700">
                    {formatLogbookDate(leave.fromDate)} to {formatLogbookDate(leave.toDate)}
                    <p className="text-[10px] text-slate-400">{leave.totalDays} day(s)</p>
                  </TableCell>
                  <TableCell className="max-w-[260px] py-3 text-xs text-slate-600">{leave.reason}</TableCell>
                  <TableCell className="py-3 text-xs text-slate-600">{leave.approvedBy}</TableCell>
                  <TableCell className="py-3">{renderLeaveStatus(leave.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function getInclusiveDays(fromDate: string, toDate: string) {
  const start = new Date(`${fromDate}T00:00:00Z`).getTime();
  const end = new Date(`${toDate}T00:00:00Z`).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return 0;
  return Math.floor((end - start) / 86_400_000) + 1;
}

function SummaryCard({ label, value, tone, total }: { label: string; value: number; tone: "teal" | "amber" | "slate", total?: number }) {
  const toneClass = {
    teal: "border-teal-200 bg-teal-50 text-teal-900",
    amber: "border-amber-200 bg-amber-50 text-amber-900",
    slate: "border-slate-200 bg-white text-slate-900",
  }[tone];

  return (
    <div className={`rounded-xl border p-4 ${toneClass}`}>
      <p className="text-2xl font-black">
        {value} <span className="text-sm font-semibold opacity-60">{total ? `/ ${total} used` : ""}</span>
      </p>
      <p className="text-[11px] font-semibold uppercase tracking-wide opacity-70">{label}</p>
    </div>
  );
}

function renderLeaveStatus(status: LeaveStatus) {
  if (status === "approved") {
    return (
      <Badge className="border-emerald-200 bg-emerald-50 text-[10px] text-emerald-700">
        <CheckCircle2 className="mr-1 h-3 w-3" /> Approved
      </Badge>
    );
  }

  if (status === "rejected") {
    return (
      <Badge className="border-rose-200 bg-rose-50 text-[10px] text-rose-700">
        <XCircle className="mr-1 h-3 w-3" /> Rejected
      </Badge>
    );
  }

  return (
    <Badge className="border-amber-200 bg-amber-50 text-[10px] text-amber-700">
      <Clock className="mr-1 h-3 w-3" /> Pending HOD
    </Badge>
  );
}
