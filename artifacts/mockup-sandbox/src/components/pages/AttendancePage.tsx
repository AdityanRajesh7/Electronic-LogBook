import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export function AttendancePage() {
  const [clockedIn, setClockedIn] = React.useState(true);
  const [fromDate, setFromDate] = React.useState("2026-08-12");
  const [toDate, setToDate] = React.useState("2026-08-14");
  const [reason, setReason] = React.useState("");

  const [leaves, setLeaves] = React.useState([
    {
      id: "LV-402",
      fromDate: "2026-08-12",
      toDate: "2026-08-14",
      totalDays: 3,
      reason: "Attending National Paediatric Pulmonary Conference (IAP)",
      status: "pending",
    },
    {
      id: "LV-388",
      fromDate: "2026-06-10",
      toDate: "2026-06-11",
      totalDays: 2,
      reason: "Casual Leave",
      status: "approved",
    },
  ]);

  const handleToggleClock = () => {
    const nextState = !clockedIn;
    setClockedIn(nextState);
    toast.info(nextState ? "Duty On (Clocked In at 08:00 AM)" : "Duty Off (Clocked Out)", {
      description: "Duty attendance register updated.",
    });
  };

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason || !fromDate || !toDate) return;

    const newLeave = {
      id: `LV-${Math.floor(400 + Math.random() * 500)}`,
      fromDate,
      toDate,
      totalDays: 3,
      reason,
      status: "pending",
    };

    setLeaves([newLeave, ...leaves]);
    toast.success(`Leave Application ${newLeave.id} submitted!`, {
      description: `Sent to HOD for approval (${fromDate} to ${toDate}).`,
    });

    setReason("");
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <Clock className="h-6 w-6 text-teal-600" /> Attendance &amp; Leave Register
        </h2>
        <p className="text-xs text-slate-500">
          Duty clock-in / clock-out tracking and leave application management
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-slate-200 bg-white md:col-span-1">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-900">Duty Clock Control</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4 text-center">
            <div className="p-4 bg-teal-50 rounded-xl border border-teal-200">
              <p className="text-xs text-slate-500 font-semibold uppercase">Today's Duty Status</p>
              <p className="text-lg font-black text-emerald-700 mt-1">
                {clockedIn ? "Present (Clocked In at 08:00 AM)" : "Duty Off"}
              </p>
            </div>
            <Button
              onClick={handleToggleClock}
              className={clockedIn ? "w-full bg-amber-600 hover:bg-amber-700 text-white font-bold" : "w-full bg-teal-600 hover:bg-teal-700 text-white font-bold"}
            >
              {clockedIn ? "Clock Out Duty" : "Clock In Duty"}
            </Button>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 bg-white md:col-span-2">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-900">Apply for Leave</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <form onSubmit={handleApplyLeave} className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs">From Date</Label>
                  <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="text-xs" required />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">To Date</Label>
                  <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="text-xs" required />
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
              <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold">
                Submit Leave Application
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-slate-200 bg-white">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base font-bold text-slate-900">Submitted Leave Applications</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="text-xs font-semibold">Application ID</TableHead>
                <TableHead className="text-xs font-semibold">Dates</TableHead>
                <TableHead className="text-xs font-semibold">Reason</TableHead>
                <TableHead className="text-xs font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaves.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="py-3 text-xs font-bold text-slate-900">{l.id}</TableCell>
                  <TableCell className="py-3 text-xs text-slate-700">{l.fromDate} to {l.toDate} ({l.totalDays} Days)</TableCell>
                  <TableCell className="py-3 text-xs text-slate-600">{l.reason}</TableCell>
                  <TableCell className="py-3">
                    {l.status === "approved" ? (
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                        <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-600" /> Approved
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">
                        <Clock className="h-3 w-3 mr-1 text-amber-600" /> Pending HOD Approval
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
